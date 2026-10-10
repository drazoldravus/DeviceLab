import React, { useState } from 'react';
import { StabilityResult } from '../types/benchmark';
import { runStabilityBenchmark } from '../services/stabilityBenchmark';
import { ShieldCheck, Play, Loader2, CheckCircle2, XCircle, AlertCircle, Cpu, HardDrive } from 'lucide-react';

interface StabilityViewProps {
  stabilityResult: StabilityResult | null;
  onUpdateResult: (res: StabilityResult) => void;
}

export const StabilityView: React.FC<StabilityViewProps> = ({
  stabilityResult,
  onUpdateResult,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [stage, setStage] = useState('');
  const [percent, setPercent] = useState(0);

  const handleRunStability = async () => {
    setIsRunning(true);
    try {
      const res = await runStabilityBenchmark((stg, pct) => {
        setStage(stg);
        setPercent(pct);
      });
      onUpdateResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
      setPercent(100);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Software Stability & Browser Engine Diagnostics
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Evaluates event loop scheduling precision, UI thread blocking times, memory heap garbage collection pressure, and web API runtime stability.
          </p>
        </div>

        <div>
          <button
            onClick={handleRunStability}
            disabled={isRunning}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Diagnosing Engine...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Run Stability Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-slate-200">{stage}</span>
            <span className="font-mono text-cyan-400 font-bold">{percent}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-150"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Stability Score Card */}
      {stabilityResult ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Grade */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Overall Stability Grade</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-white">
                Grade {stabilityResult.grade}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Score: <span className="text-cyan-400 font-mono font-semibold">{stabilityResult.stabilityScore.toLocaleString()}</span> / 10,000
            </div>
          </div>

          {/* Event Loop Jitter */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Event Loop Jitter (P95)</span>
              <Cpu className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {stabilityResult.eventLoopJitterP95Ms} ms
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Max Deviation: <span className="font-mono text-slate-200">{stabilityResult.maxEventLoopJitterMs} ms</span>
            </div>
          </div>

          {/* Long Tasks / Blocking */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>UI Thread Long Tasks</span>
              <AlertCircle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {stabilityResult.longTasksCount} Tasks
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Total Blocking Time: <span className="font-mono text-slate-200">{stabilityResult.totalBlockingTimeMs} ms</span>
            </div>
          </div>

          {/* Memory Heap Leak Check */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Memory Heap / GC</span>
              <HardDrive className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {stabilityResult.heapFinalMB ? `${stabilityResult.heapFinalMB} MB` : 'Nominal'}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {stabilityResult.memoryLeakDetected ? (
                <span className="text-rose-400">Leak Potential Detected</span>
              ) : (
                <span className="text-emerald-400">Heap Recycled Cleanly</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center text-slate-400">
          <p className="text-sm">Click "Run Stability Audit" to evaluate event loop jitter and API compatibility.</p>
        </div>
      )}

      {/* Web Platform API Matrix */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="font-semibold text-white">
              Browser Engine & Web Platform API Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Audits the availability and stability of modern hardware-acceleration APIs on this browser instance.
            </p>
          </div>
          {stabilityResult && (
            <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              Coverage: <span className="text-cyan-400 font-bold">{stabilityResult.apisSupported}</span> / {stabilityResult.apisTotal} APIs
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {stabilityResult ? (
            Object.entries(stabilityResult.apiResults).map(([name, info]) => (
              <div
                key={name}
                className="flex items-start justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80"
              >
                <div>
                  <div className="text-xs font-semibold text-white">{name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{info.details}</div>
                </div>
                <div className="shrink-0 ml-2">
                  {info.supported ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium bg-slate-900 px-2 py-0.5 rounded">
                      <XCircle className="h-3 w-3" /> Unavailable
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-xs text-slate-500">
              Run the stability audit to test WebGL2, WebGPU, WebAudio, OffscreenCanvas, Vibration, and Battery APIs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
