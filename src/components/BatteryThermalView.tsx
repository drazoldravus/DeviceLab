import React, { useState } from 'react';
import { BatteryThermalResult, SystemSpecs } from '../types/benchmark';
import { runBatteryThermalStressTest } from '../services/batteryThermalBenchmark';
import { Battery, BatteryCharging, Flame, Play, Loader2, ShieldCheck, AlertTriangle, TrendingDown, Clock, Zap } from 'lucide-react';

interface BatteryThermalViewProps {
  batteryResult: BatteryThermalResult | null;
  specs: SystemSpecs | null;
  onUpdateResult: (res: BatteryThermalResult) => void;
}

export const BatteryThermalView: React.FC<BatteryThermalViewProps> = ({
  batteryResult,
  specs,
  onUpdateResult,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [testDuration, setTestDuration] = useState<number>(20);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [liveOps, setLiveOps] = useState<number>(0);
  const [liveRetention, setLiveRetention] = useState<number>(100);

  const handleStartStressTest = async () => {
    setIsRunning(true);
    setElapsedSec(0);

    try {
      const result = await runBatteryThermalStressTest(testDuration, (elapsed, total, ops, retention) => {
        setElapsedSec(elapsed);
        setLiveOps(ops);
        setLiveRetention(retention);
      });
      onUpdateResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const isBatterySupported = specs?.batterySupported ?? false;
  const isCharging = specs?.batteryCharging ?? false;
  const batteryLevel = specs?.batteryLevel ?? null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Battery Efficiency & Thermal Throttling Lab
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Sustained workload profiling to measure silicon heat saturation, clock frequency stability, and power drain on mobile and laptops.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-400 px-2">Duration:</span>
            {[15, 25, 40].map((sec) => (
              <button
                key={sec}
                onClick={() => setTestDuration(sec)}
                disabled={isRunning}
                className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
                  testDuration === sec
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          <button
            onClick={handleStartStressTest}
            disabled={isRunning}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Soaking ({elapsedSec}s / {testDuration}s)</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Start Thermal Soak</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Telemetry & Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Real Battery Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Battery State</span>
            {isCharging ? (
              <BatteryCharging className="h-4 w-4 text-emerald-400" />
            ) : (
              <Battery className="h-4 w-4 text-cyan-400" />
            )}
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {batteryLevel !== null ? `${batteryLevel}%` : 'AC Power / Line'}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
            {isBatterySupported ? (
              <span>{isCharging ? 'Plugged into AC Adapter' : 'Running on Internal Battery'}</span>
            ) : (
              <span>Direct AC or desktop workstation</span>
            )}
          </div>
        </div>

        {/* Thermal Retention */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Thermal Retention</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {isRunning ? `${liveRetention}%` : batteryResult ? `${batteryResult.thermalRetentionPercent}%` : '--'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {batteryResult ? (
              batteryResult.throttlingDetected ? (
                <span className="text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Throttling Detected
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Thermally Stable
                </span>
              )
            ) : (
              <span>Ratio of sustained vs burst speed</span>
            )}
          </div>
        </div>

        {/* Sustained Drain Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Discharge Efficiency</span>
            <TrendingDown className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white">
            {batteryResult?.estimatedDrainPerHour ? `~${batteryResult.estimatedDrainPerHour}% / hr` : '--'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Under active compute load
          </div>
        </div>

        {/* Efficiency Index */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Efficiency Score</span>
            <Zap className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-purple-400">
            {batteryResult ? batteryResult.efficiencyScore.toLocaleString() : '--'}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Points (0 - 10,000 scale)
          </div>
        </div>
      </div>

      {/* Live Stress Progress & Timeline */}
      {isRunning && (
        <div className="rounded-xl border border-cyan-500/30 bg-slate-900/90 p-6 shadow-lg shadow-cyan-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />
              <span className="text-sm font-semibold text-white">
                Sustained Thermal Stress in Progress ({elapsedSec}s of {testDuration}s)
              </span>
            </div>
            <div className="text-xs font-mono text-cyan-300">
              Throughput: {liveOps.toLocaleString()} ops/s
            </div>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${(elapsedSec / testDuration) * 100}%` }}
            />
          </div>

          <p className="text-xs text-slate-400">
            The engine is continuously saturating all logical cores with floating-point matrices to measure whether the OS governor throttles clock speeds to prevent overheating.
          </p>
        </div>
      )}

      {/* Detailed Analysis Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Samples Breakdown & Thermal Timeline */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="font-semibold text-white mb-1">
            Sustained Clock Rate & Thermal Curve
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Compares initial burst throughput against sustained performance over time.
          </p>

          {batteryResult && batteryResult.samples.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Initial Burst Speed</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-white">
                    {batteryResult.initialThroughputOps.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">ops/second</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Sustained Final Speed</span>
                  <span className="text-xl font-bold font-mono tabular-nums text-cyan-400">
                    {batteryResult.finalThroughputOps.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">ops/second</span>
                </div>
              </div>

              {/* Visual Samples Bar Chart */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Throughput Timeline ({batteryResult.samples.length} intervals)</span>
                  <span className="font-mono text-cyan-400">
                    Drop: {Math.max(0, Math.round(100 - batteryResult.thermalRetentionPercent))}%
                  </span>
                </div>
                <div className="h-32 flex items-end gap-1.5 p-3 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto">
                  {batteryResult.samples.map((sample, idx) => {
                    const maxOps = Math.max(...batteryResult.samples.map((s) => s.ops), 1);
                    const heightPercent = Math.max(15, Math.round((sample.ops / maxOps) * 100));
                    const isThrottled = sample.ops < batteryResult.initialThroughputOps * 0.88;

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center group relative min-w-[8px]"
                      >
                        <div
                          className={`w-full rounded-t transition-all ${
                            isThrottled ? 'bg-amber-400/80' : 'bg-cyan-400/80'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono text-white whitespace-nowrap pointer-events-none z-10">
                          {sample.timeSec}s: {sample.ops.toLocaleString()} ops
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Interpretation Note */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300">
                {batteryResult.thermalRetentionPercent >= 92 ? (
                  <p>
                    <span className="text-emerald-400 font-semibold">Excellent Thermal Dissipation:</span> Your device maintained {batteryResult.thermalRetentionPercent}% of its peak computing capacity. Ideal for sustained mobile gaming on Android and heavy compile loads on Windows.
                  </p>
                ) : batteryResult.thermalRetentionPercent >= 82 ? (
                  <p>
                    <span className="text-amber-400 font-semibold">Moderate Thermal Degradation:</span> Performance lowered by {Math.round(100 - batteryResult.thermalRetentionPercent)}% as heat accumulated. Standard behavior for thin-and-light chassis.
                  </p>
                ) : (
                  <p>
                    <span className="text-rose-400 font-semibold">Aggressive Thermal Throttling:</span> Performance dropped by {Math.round(100 - batteryResult.thermalRetentionPercent)}%. Consider testing in a cooler ambient environment or inspecting fan/vent clearance.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Run the thermal soak test to generate sustained clock rate samples and calculate battery efficiency.
            </div>
          )}
        </div>

        {/* Right: SoC Architecture & Silicon Reference */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-white mb-1">
              Silicon Power Architecture
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Modern heterogeneous CPU complexes balance high-efficiency cores with high-power prime cores.
            </p>

            <div className="relative rounded-lg overflow-hidden border border-slate-800 mb-4 aspect-video">
              <img
                src="/src/assets/images/android_chip_telemetry_1791638059956.jpg"
                alt="Silicon system-on-chip thermal architecture"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 text-[11px] font-mono text-cyan-300">
                Thermal Dissipation Profile
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Target Core Topology:</span>
                <span className="text-white font-medium">{specs?.cpuCores} Cores Available</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Host OS:</span>
                <span className="text-white font-medium">{specs?.os}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Battery Status API:</span>
                <span className="text-white font-medium">
                  {specs?.batterySupported ? 'Supported & Polled' : 'Restricted by browser sandbox'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <Clock className="h-3.5 w-3.5" />
            <span>Last checked: {batteryResult?.completedAt || 'Never'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
