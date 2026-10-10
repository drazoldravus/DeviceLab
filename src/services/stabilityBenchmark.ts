import { StabilityResult } from '../types/benchmark';

export async function runStabilityBenchmark(
  onProgress?: (stage: string, percent: number) => void
): Promise<StabilityResult> {
  onProgress?.('Initializing Event Loop Jitter Probes...', 10);
  await new Promise((r) => setTimeout(r, 60));

  // 1. Long Tasks & Blocking Time via PerformanceObserver
  let longTasksCount = 0;
  let totalBlockingTimeMs = 0;

  let observer: PerformanceObserver | null = null;
  if (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes?.includes('longtask')) {
    try {
      observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          longTasksCount++;
          // Any task > 50ms is a long task; blocking time is duration - 50ms
          const blocking = Math.max(0, entry.duration - 50);
          totalBlockingTimeMs += blocking;
        }
      });
      observer.observe({ entryTypes: ['longtask'] });
    } catch {
      // Longtask observer fallback
    }
  }

  // 2. Event Loop Jitter Test
  onProgress?.('Measuring Main Thread Microtask Jitter...', 30);
  const jitterDeltas: number[] = [];
  const expectedIntervalMs = 12;
  let lastTime = performance.now();

  const jitterIterations = 120;
  for (let i = 0; i < jitterIterations; i++) {
    await new Promise((r) => setTimeout(r, expectedIntervalMs));
    const now = performance.now();
    const actualDelta = now - lastTime;
    lastTime = now;
    const jitter = Math.abs(actualDelta - expectedIntervalMs);
    jitterDeltas.push(jitter);
  }

  jitterDeltas.sort((a, b) => a - b);
  const maxEventLoopJitterMs = Math.round(jitterDeltas[jitterDeltas.length - 1] * 10) / 10;
  const p95Index = Math.floor(jitterDeltas.length * 0.95);
  const eventLoopJitterP95Ms = Math.round(jitterDeltas[p95Index] * 10) / 10;

  // 3. Memory Heap Pressure & Garbage Collection Behavior
  onProgress?.('Evaluating Garbage Collection Pressure & Memory Heap...', 60);
  const perfAny = performance as unknown as {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };

  let heapInitialMB: number | null = null;
  let heapFinalMB: number | null = null;
  let heapDeltaMB: number | null = null;
  let memoryLeakDetected = false;

  if (perfAny.memory) {
    heapInitialMB = Math.round((perfAny.memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10;

    // Allocate transient object graphs
    let cyclicCluster: Array<{ id: number; data: string; link?: unknown }> | null = [];
    for (let c = 0; c < 30000; c++) {
      cyclicCluster.push({
        id: c,
        data: 'temporary_heap_load_payload_' + c,
      });
    }

    // Dereference to trigger GC eligibility
    cyclicCluster = null;

    // Small delay to allow engine scavenger
    await new Promise((r) => setTimeout(r, 150));
    heapFinalMB = Math.round((perfAny.memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
    heapDeltaMB = Math.round((heapFinalMB - (heapInitialMB || 0)) * 10) / 10;
    // If heap increased drastically and didn't release
    if (heapDeltaMB > 25) {
      memoryLeakDetected = true;
    }
  }

  // 4. Modern Web Platform APIs Compliance
  onProgress?.('Auditing Web Platform API Subsystems & Features...', 85);
  await new Promise((r) => setTimeout(r, 50));

  const apiResults: Record<string, { supported: boolean; details?: string }> = {
    'WebGL 2.0 (3D Graphics)': {
      supported: typeof document !== 'undefined' && !!document.createElement('canvas').getContext('webgl2'),
      details: 'Hardware rasterizer & geometry shaders',
    },
    'WebGPU (Next-Gen Graphics)': {
      supported: typeof navigator !== 'undefined' && 'gpu' in navigator,
      details: 'Low-overhead modern compute pipeline',
    },
    'Web Workers (Multi-Threading)': {
      supported: typeof Worker !== 'undefined',
      details: 'Dedicated OS threads for background compute',
    },
    'SharedArrayBuffer & Atomics': {
      supported: typeof SharedArrayBuffer !== 'undefined',
      details: 'Cross-thread zero-copy shared memory',
    },
    'OffscreenCanvas (Background Render)': {
      supported: typeof OffscreenCanvas !== 'undefined',
      details: 'Worker-based non-blocking canvas rendering',
    },
    'IndexedDB (Persistent Storage)': {
      supported: typeof indexedDB !== 'undefined',
      details: 'Transactional client-side object storage',
    },
    'WebAudio API (Low-Latency Sound)': {
      supported: typeof AudioContext !== 'undefined' || typeof (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext !== 'undefined',
      details: 'Digital signal processing and audio mixing',
    },
    'Battery Status API': {
      supported: typeof (navigator as unknown as { getBattery?: unknown }).getBattery === 'function',
      details: 'Battery level, drain and charging telemetry',
    },
    'Vibration API (Haptic Feedback)': {
      supported: typeof navigator !== 'undefined' && 'vibrate' in navigator,
      details: 'Mobile haptic actuators (Android)',
    },
    'Touch Events (Multi-Touch)': {
      supported: typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
      details: `Digitizer multi-touch points: ${navigator.maxTouchPoints || 0}`,
    },
    'Pointer Lock API (Desktop Input)': {
      supported: typeof document !== 'undefined' && 'pointerLockElement' in document,
      details: 'Raw mouse cursor lock for Windows desktop games',
    },
    'Screen Wake Lock API': {
      supported: typeof navigator !== 'undefined' && 'wakeLock' in navigator,
      details: 'Prevents display sleep during benchmarks',
    },
    'Web Locks API (Resource Mutex)': {
      supported: typeof navigator !== 'undefined' && 'locks' in navigator,
      details: 'Cross-tab execution coordination',
    },
    'WebCodecs (Hardware Video)': {
      supported: typeof window !== 'undefined' && 'VideoDecoder' in window,
      details: 'Direct hardware video acceleration',
    },
    'Device Memory API': {
      supported: typeof (navigator as unknown as { deviceMemory?: number }).deviceMemory !== 'undefined',
      details: `${(navigator as unknown as { deviceMemory?: number }).deviceMemory || 'Unavailable'} GB RAM tier`,
    },
  };

  const apisTotal = Object.keys(apiResults).length;
  const apisSupported = Object.values(apiResults).filter((a) => a.supported).length;

  if (observer) {
    observer.disconnect();
  }

  onProgress?.('Finalizing System Stability Grade...', 98);
  await new Promise((r) => setTimeout(r, 50));

  // Calculate stability score
  let stabilityScore = 9500;
  // Deduct for high jitter
  if (eventLoopJitterP95Ms > 5) {
    stabilityScore -= Math.min(2500, (eventLoopJitterP95Ms - 5) * 80);
  }
  // Deduct for long tasks
  stabilityScore -= Math.min(2000, longTasksCount * 300);
  stabilityScore -= Math.min(1500, totalBlockingTimeMs * 5);
  // Add/deduct for API support
  const apiCoverageRatio = apisSupported / apisTotal;
  stabilityScore = Math.round(stabilityScore * (0.8 + apiCoverageRatio * 0.2));

  let grade: StabilityResult['grade'] = 'A+';
  if (stabilityScore >= 9000) grade = 'A+';
  else if (stabilityScore >= 8000) grade = 'A';
  else if (stabilityScore >= 6800) grade = 'B';
  else if (stabilityScore >= 5200) grade = 'C';
  else grade = 'D';

  return {
    longTasksCount,
    totalBlockingTimeMs: Math.round(totalBlockingTimeMs),
    maxEventLoopJitterMs,
    eventLoopJitterP95Ms,
    memoryLeakDetected,
    heapInitialMB,
    heapFinalMB,
    heapDeltaMB,
    apisSupported,
    apisTotal,
    apiResults,
    stabilityScore: Math.max(1000, Math.min(10000, stabilityScore)),
    grade,
    completedAt: new Date().toLocaleTimeString(),
  };
}
