import React, { useState, useRef, useEffect } from 'react';
import { CPUBenchmarkResult, GPUBenchmarkResult, MemoryStorageResult } from '../types/benchmark';
import { runCPUBenchmark } from '../services/cpuBenchmark';
import { WebGLStressEngine } from '../services/gpuBenchmark';
import { runMemoryAndStorageBenchmark } from '../services/memoryStorageBenchmark';
import { Cpu, Zap, HardDrive, Play, Loader2, Gauge, Activity } from 'lucide-react';

interface HardwareBenchViewProps {
  cpuResult: CPUBenchmarkResult | null;
  gpuResult: GPUBenchmarkResult | null;
  memResult: MemoryStorageResult | null;
  onUpdateCpu: (result: CPUBenchmarkResult) => void;
  onUpdateGpu: (result: GPUBenchmarkResult) => void;
  onUpdateMem: (result: MemoryStorageResult) => void;
}

export const HardwareBenchView: React.FC<HardwareBenchViewProps> = ({
  cpuResult,
  gpuResult,
  memResult,
  onUpdateCpu,
  onUpdateGpu,
  onUpdateMem,
}) => {
  // CPU state
  const [cpuRunning, setCpuRunning] = useState(false);
  const [cpuStage, setCpuStage] = useState('');
  const [cpuPercent, setCpuPercent] = useState(0);

  // GPU state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gpuEngineRef = useRef<WebGLStressEngine | null>(null);
  const [gpuRunning, setGpuRunning] = useState(false);
  const [gpuParticleCount, setGpuParticleCount] = useState<number>(30000);
  const [instantFps, setInstantFps] = useState<number>(60);
  const [gpuProgress, setGpuProgress] = useState<number>(0);

  // Memory/Storage state
  const [memRunning, setMemRunning] = useState(false);
  const [memStage, setMemStage] = useState('');
  const [memPercent, setMemPercent] = useState(0);

  // Initialize WebGL preview canvas
  useEffect(() => {
    if (canvasRef.current) {
      const engine = new WebGLStressEngine(canvasRef.current, gpuParticleCount);
      const ok = engine.init();
      if (ok) {
        gpuEngineRef.current = engine;
        engine.startContinuousRender((fps) => {
          if (!gpuRunning) {
            setInstantFps(fps);
          }
        });
      }
    }

    return () => {
      gpuEngineRef.current?.stop();
    };
  }, [gpuParticleCount]);

  // Run CPU test
  const handleRunCpu = async () => {
    setCpuRunning(true);
    try {
      const res = await runCPUBenchmark((stage, percent) => {
        setCpuStage(stage);
        setCpuPercent(percent);
      });
      onUpdateCpu(res);
    } catch (e) {
      console.error(e);
    } finally {
      setCpuRunning(false);
      setCpuPercent(100);
    }
  };

  // Run GPU test
  const handleRunGpu = async () => {
    if (!canvasRef.current) return;
    setGpuRunning(true);
    setGpuProgress(0);

    const engine = new WebGLStressEngine(canvasRef.current, gpuParticleCount);
    engine.init();
    gpuEngineRef.current = engine;

    try {
      const res = await engine.runBenchmark(6000, (fps, progress) => {
        setInstantFps(fps);
        setGpuProgress(progress);
      });
      onUpdateGpu(res);
    } catch (e) {
      console.error(e);
    } finally {
      setGpuRunning(false);
      // Resume background render loop
      engine.startContinuousRender((fps) => setInstantFps(fps));
    }
  };

  // Run Memory/Storage test
  const handleRunMem = async () => {
    setMemRunning(true);
    try {
      const res = await runMemoryAndStorageBenchmark((stage, percent) => {
        setMemStage(stage);
        setMemPercent(percent);
      });
      onUpdateMem(res);
    } catch (e) {
      console.error(e);
    } finally {
      setMemRunning(false);
      setMemPercent(100);
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Hardware Performance Suite
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real browser-native benchmarks measuring single & multi-core CPU compute, 3D WebGL rasterization, and RAM/storage I/O.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              void handleRunCpu();
              void handleRunGpu();
              void handleRunMem();
            }}
            disabled={cpuRunning || gpuRunning || memRunning}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5 fill-current text-cyan-400" />
            Run All Hardware Tests
          </button>
        </div>
      </div>

      {/* Grid of 3 Main Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. CPU Compute Engine Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">CPU Processing</h3>
                  <div className="text-xs text-slate-400">Prime Sieve · Mandelbrot · Hash</div>
                </div>
              </div>
              <button
                onClick={handleRunCpu}
                disabled={cpuRunning}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition-colors disabled:opacity-50"
              >
                {cpuRunning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Running</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run CPU</span>
                  </>
                )}
              </button>
            </div>

            {cpuRunning && (
              <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="truncate pr-2">{cpuStage}</span>
                  <span className="font-mono tabular-nums text-cyan-400 font-semibold">{cpuPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-150"
                    style={{ width: `${cpuPercent}%` }}
                  />
                </div>
              </div>
            )}

            {cpuResult ? (
              <div className="mt-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70">
                    <span className="text-xs text-slate-400 block mb-0.5">Single-Core</span>
                    <span className="text-2xl font-bold font-mono tabular-nums text-white">
                      {cpuResult.singleCoreScore}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">Points</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70">
                    <span className="text-xs text-slate-400 block mb-0.5">Multi-Core</span>
                    <span className="text-2xl font-bold font-mono tabular-nums text-cyan-400">
                      {cpuResult.multiCoreScore}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Scaling {cpuResult.multiCoreSpeedup}x
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Prime Sieve 2.5M:</span>
                    <span className="font-mono tabular-nums text-white">{cpuResult.primeSieveMs} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Mandelbrot Rate:</span>
                    <span className="font-mono tabular-nums text-white">{cpuResult.mandelbrotOpsSec.toLocaleString()} ops/s</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Bitwise Avalanche:</span>
                    <span className="font-mono tabular-nums text-white">{cpuResult.hashThroughputMBs} MB/s</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 py-8 text-center text-xs text-slate-500">
                Click "Run CPU" to test single-core floating point and multi-worker parallelism.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Calibrated baseline index</span>
            <span className="font-mono">{cpuResult ? cpuResult.completedAt : 'Not tested'}</span>
          </div>
        </div>

        {/* 2. GPU 3D WebGL Stress Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">GPU 3D Shader Stress</h3>
                  <div className="text-xs text-slate-400">30k Particle Swarm & Lighting</div>
                </div>
              </div>
              <button
                onClick={handleRunGpu}
                disabled={gpuRunning}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors disabled:opacity-50"
              >
                {gpuRunning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run GPU</span>
                  </>
                )}
              </button>
            </div>

            {/* Live WebGL Canvas Viewport */}
            <div className="mt-4 relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={400}
                height={225}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-slate-950/85 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded text-xs font-mono tabular-nums text-emerald-400 flex items-center gap-1.5">
                <Activity className="h-3 w-3" />
                <span>{instantFps} FPS</span>
              </div>
              {gpuRunning && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-100"
                    style={{ width: `${gpuProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Particle Density Selector */}
            <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2">
              <span>Particle Density:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-md border border-slate-800">
                {[15000, 30000, 50000].map((count) => (
                  <button
                    key={count}
                    onClick={() => setGpuParticleCount(count)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer transition-colors ${
                      gpuParticleCount === count
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {count / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {gpuResult && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70">
                  <span className="text-xs text-slate-400 block mb-0.5">Average FPS</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-white">
                    {gpuResult.fpsAverage}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Range: {gpuResult.fpsMin} - {gpuResult.fpsMax}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70">
                  <span className="text-xs text-slate-400 block mb-0.5">Frame Variance</span>
                  <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                    {gpuResult.frameTimeVarianceMs} ms
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    1% Low: {gpuResult.percentile99FrameTimeMs} ms
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center mt-4">
            <span>Score: {gpuResult ? gpuResult.score.toLocaleString() : 'Pending'}</span>
            <span className="font-mono">{gpuResult ? gpuResult.completedAt : 'Not tested'}</span>
          </div>
        </div>

        {/* 3. Memory & Storage I/O Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-800/60 text-purple-400">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">RAM & Flash I/O</h3>
                  <div className="text-xs text-slate-400">Sequential Bandwidth & IndexedDB</div>
                </div>
              </div>
              <button
                onClick={handleRunMem}
                disabled={memRunning}
                className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium border border-purple-500/30 transition-colors disabled:opacity-50"
              >
                {memRunning ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run I/O</span>
                  </>
                )}
              </button>
            </div>

            {memRunning && (
              <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="truncate pr-2">{memStage}</span>
                  <span className="font-mono tabular-nums text-purple-400 font-semibold">{memPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 transition-all duration-150"
                    style={{ width: `${memPercent}%` }}
                  />
                </div>
              </div>
            )}

            {memResult ? (
              <div className="mt-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70">
                    <span className="text-xs text-slate-400 block mb-0.5">RAM Read Bandwidth</span>
                    <span className="text-2xl font-bold font-mono tabular-nums text-white">
                      {memResult.sequentialReadMBs.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">MB/sec</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/70">
                    <span className="text-xs text-slate-400 block mb-0.5">RAM Write Bandwidth</span>
                    <span className="text-2xl font-bold font-mono tabular-nums text-purple-400">
                      {memResult.sequentialWriteMBs.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">MB/sec</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Pointer Chasing Latency:</span>
                    <span className="font-mono tabular-nums text-white">{memResult.randomAccessLatencyUs} µs</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">IndexedDB Write IOPS:</span>
                    <span className="font-mono tabular-nums text-white">{memResult.idbWriteIops.toLocaleString()} ops/s</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">IndexedDB Read Bandwidth:</span>
                    <span className="font-mono tabular-nums text-white">{memResult.idbReadThroughputMBs} MB/s</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Transaction Latency:</span>
                    <span className="font-mono tabular-nums text-white">{memResult.idbTransactionLatencyMs} ms</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 py-8 text-center text-xs text-slate-500">
                Click "Run I/O" to measure RAM bandwidth, pointer-chasing cache drops, and IndexedDB disk transactions.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex justify-between items-center">
            <span>Score: {memResult ? memResult.overallScore.toLocaleString() : 'Pending'}</span>
            <span className="font-mono">{memResult ? memResult.completedAt : 'Not tested'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
