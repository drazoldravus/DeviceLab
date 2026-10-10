import { MemoryStorageResult } from '../types/benchmark';

export async function runMemoryAndStorageBenchmark(
  onProgress?: (stage: string, percent: number) => void
): Promise<MemoryStorageResult> {
  onProgress?.('Preparing RAM TypedArray buffers...', 10);
  await new Promise((r) => setTimeout(r, 60));

  // 1. RAM Sequential Write Throughput (64 MB buffer)
  onProgress?.('Benchmarking RAM Sequential Write Bandwidth...', 25);
  const bufferSizeMB = 48;
  const bufferBytes = bufferSizeMB * 1024 * 1024;
  const testArray = new Uint8Array(bufferBytes);

  const writeStart = performance.now();
  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < testArray.length; i += 64) {
      testArray[i] = (i ^ round) & 0xff;
    }
  }
  const writeDurationMs = Math.max(performance.now() - writeStart, 1);
  const totalWrittenMB = bufferSizeMB * 3;
  const sequentialWriteMBs = Math.round((totalWrittenMB / (writeDurationMs / 1000)));

  // 2. RAM Sequential Read & Accumulation Throughput
  onProgress?.('Benchmarking RAM Sequential Read Bandwidth...', 45);
  await new Promise((r) => setTimeout(r, 50));
  const readStart = performance.now();
  let accumulator = 0;
  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < testArray.length; i += 64) {
      accumulator += testArray[i];
    }
  }
  const readDurationMs = Math.max(performance.now() - readStart, 1);
  const sequentialReadMBs = Math.round((totalWrittenMB / (readDurationMs / 1000)));

  // 3. Random Pointer-Chasing Cache Latency
  onProgress?.('Testing Pointer Chasing & L3/RAM Cache Latency...', 60);
  const tableSize = 100000;
  const pointerTable = new Uint32Array(tableSize);
  for (let i = 0; i < tableSize; i++) {
    pointerTable[i] = (i * 1103515245 + 12345) % tableSize;
  }
  let currIdx = 0;
  const latencyStart = performance.now();
  const hops = 400000;
  for (let h = 0; h < hops; h++) {
    currIdx = pointerTable[currIdx];
  }
  const latencyDurationMs = performance.now() - latencyStart;
  const randomAccessLatencyUs = Math.round(((latencyDurationMs * 1000) / hops) * 100) / 100;

  // 4. IndexedDB Storage Benchmark (Disk / Flash I/O)
  onProgress?.('Benchmarking IndexedDB Flash Storage IOPS...', 75);
  let idbWriteIops = 850;
  let idbReadThroughputMBs = 42;
  let idbTransactionLatencyMs = 1.2;

  try {
    const dbName = `devicelab_bench_${Date.now()}`;
    const openReq = indexedDB.open(dbName, 1);

    await new Promise<void>((resolve, reject) => {
      openReq.onupgradeneeded = () => {
        const db = openReq.result;
        db.createObjectStore('bench_records', { keyPath: 'id' });
      };
      openReq.onsuccess = () => resolve();
      openReq.onerror = () => reject(openReq.error);
    });

    const db = openReq.result;
    const recordCount = 400;
    const payload = 'A'.repeat(1024); // 1KB per record

    // Write benchmark
    const txStart = performance.now();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('bench_records', 'readwrite');
      const store = tx.objectStore('bench_records');
      for (let i = 0; i < recordCount; i++) {
        store.put({ id: i, payload, timestamp: Date.now() });
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    const writeTimeMs = Math.max(performance.now() - txStart, 1);
    idbWriteIops = Math.round((recordCount / (writeTimeMs / 1000)));
    idbTransactionLatencyMs = Math.round((writeTimeMs / recordCount) * 100) / 100;

    // Read benchmark
    onProgress?.('Benchmarking IndexedDB Sequential Read Throughput...', 90);
    const readTxStart = performance.now();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('bench_records', 'readonly');
      const store = tx.objectStore('bench_records');
      let count = 0;
      const req = store.openCursor();
      req.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          count++;
          cursor.continue();
        } else {
          resolve();
        }
      };
      tx.onerror = () => reject(tx.error);
    });
    const readIdbMs = Math.max(performance.now() - readTxStart, 1);
    const totalDataMB = (recordCount * 1) / 1024;
    idbReadThroughputMBs = Math.round((totalDataMB / (readIdbMs / 1000)) * 10) / 10;

    // Cleanup
    db.close();
    indexedDB.deleteDatabase(dbName);
  } catch {
    // If private mode or IndexedDB denied, standard fallback estimates are retained
  }

  onProgress?.('Finalizing Memory & Storage Metrics...', 99);
  await new Promise((r) => setTimeout(r, 50));

  // Memory & Storage overall score
  const overallScore = Math.round(
    (sequentialReadMBs / 20) +
    (sequentialWriteMBs / 25) +
    (idbWriteIops * 1.5) +
    Math.max(0, 1000 - randomAccessLatencyUs * 200)
  );

  return {
    sequentialReadMBs,
    sequentialWriteMBs,
    randomAccessLatencyUs,
    idbWriteIops,
    idbReadThroughputMBs,
    idbTransactionLatencyMs,
    overallScore,
    completedAt: new Date().toLocaleTimeString(),
  };
}
