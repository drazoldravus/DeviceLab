import React, { useState, useEffect } from 'react';
import {
  SystemSpecs,
  CPUBenchmarkResult,
  GPUBenchmarkResult,
  MemoryStorageResult,
  BatteryThermalResult,
  StabilityResult,
  FullTestReport,
} from './types/benchmark';
import { detectSystemSpecs } from './utils/systemDetector';
import { TopNav, NavTab } from './components/TopNav';
import { DeviceSpecCard } from './components/DeviceSpecCard';
import { HardwareBenchView } from './components/HardwareBenchView';
import { BatteryThermalView } from './components/BatteryThermalView';
import { StabilityView } from './components/StabilityView';
import { DisplayTouchView } from './components/DisplayTouchView';
import { DeviceComparisonModal } from './components/DeviceComparisonModal';
import { ReportExportModal } from './components/ReportExportModal';
import { FullBenchmarkRunner } from './components/FullBenchmarkRunner';
import { Cpu, Zap, HardDrive, Battery, ShieldCheck, Play, ArrowRight, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [specs, setSpecs] = useState<SystemSpecs | null>(null);

  // Benchmark Results State
  const [cpuResult, setCpuResult] = useState<CPUBenchmarkResult | null>(null);
  const [gpuResult, setGpuResult] = useState<GPUBenchmarkResult | null>(null);
  const [memResult, setMemResult] = useState<MemoryStorageResult | null>(null);
  const [batteryResult, setBatteryResult] = useState<BatteryThermalResult | null>(null);
  const [stabilityResult, setStabilityResult] = useState<StabilityResult | null>(null);
  const [overallIndexScore, setOverallIndexScore] = useState<number>(0);

  // Modals
  const [isFullRunnerOpen, setIsFullRunnerOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Load system specs on mount
  useEffect(() => {
    async function loadSpecs() {
      const detected = await detectSystemSpecs();
      setSpecs(detected);
    }
    void loadSpecs();
  }, []);

  // Recalculate composite score whenever tests update
  useEffect(() => {
    if (!cpuResult && !gpuResult && !memResult && !batteryResult && !stabilityResult) {
      return;
    }

    const cpuScore = cpuResult?.multiCoreScore ?? 2000;
    const gpuScore = gpuResult?.score ?? 3500;
    const memScore = memResult?.overallScore ?? 1500;
    const battScore = batteryResult?.efficiencyScore ?? 8000;
    const stabScore = stabilityResult?.stabilityScore ?? 9000;

    const normalizedCpu = Math.min(3000, Math.round((cpuScore / 12000) * 3000));
    const normalizedGpu = Math.min(3000, Math.round((gpuScore / 7500) * 3000));
    const normalizedMem = Math.min(1500, Math.round((memScore / 3000) * 1500));
    const normalizedBatt = Math.min(1500, Math.round((battScore / 10000) * 1500));
    const normalizedStab = Math.min(1000, Math.round((stabScore / 10000) * 1000));

    const total = Math.min(9999, Math.max(1500, normalizedCpu + normalizedGpu + normalizedMem + normalizedBatt + normalizedStab));
    setOverallIndexScore(total);
  }, [cpuResult, gpuResult, memResult, batteryResult, stabilityResult]);

  const hasAnyResults = !!(cpuResult || gpuResult || memResult || batteryResult || stabilityResult);

  const fullReport: FullTestReport | null = specs
    ? {
        timestamp: new Date().toLocaleString(),
        device: specs,
        cpu: cpuResult || undefined,
        gpu: gpuResult || undefined,
        memoryStorage: memResult || undefined,
        batteryThermal: batteryResult || undefined,
        stability: stabilityResult || undefined,
        overallIndexScore: overallIndexScore || 7200,
      }
    : null;

  const handleFullSuiteCompleted = (results: {
    cpu: CPUBenchmarkResult;
    gpu: GPUBenchmarkResult;
    mem: MemoryStorageResult;
    battery: BatteryThermalResult;
    stability: StabilityResult;
    overallIndexScore: number;
  }) => {
    setCpuResult(results.cpu);
    setGpuResult(results.gpu);
    setMemResult(results.mem);
    setBatteryResult(results.battery);
    setStabilityResult(results.stability);
    setOverallIndexScore(results.overallIndexScore);
    setIsFullRunnerOpen(false);
    setActiveTab('overview');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 3-Zone Top Bar */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRunAll={() => setIsFullRunnerOpen(true)}
        isRunningAll={isFullRunnerOpen}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Device Detection Bar */}
        <DeviceSpecCard
          specs={specs}
          onOpenComparison={() => setIsComparisonOpen(true)}
          onOpenReport={() => setIsReportOpen(true)}
          hasResults={hasAnyResults}
        />

        {/* Tab Content Router */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Composite Index Score & Hero Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Overall Index Score Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Composite Device Index</span>
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline gap-3 my-2">
                    <span className="text-4xl md:text-5xl font-black font-mono text-cyan-400 tabular-nums">
                      {overallIndexScore > 0 ? overallIndexScore.toLocaleString() : '--'}
                    </span>
                    <span className="text-xs font-mono text-slate-500">/ 10,000</span>
                  </div>

                  <div className="text-xs text-slate-300 mt-2 font-medium">
                    {overallIndexScore >= 8000
                      ? 'Flagship Tier · High-Performance Workstation Class'
                      : overallIndexScore >= 6500
                      ? 'Upper Midrange · Excellent Multitasking & Efficiency'
                      : overallIndexScore > 0
                      ? 'Standard Tier · Capable Everyday Browser Workloads'
                      : 'Run benchmark suite to calculate standardized hardware index'}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800/80 mt-6 flex flex-wrap gap-2">
                  <button
                    onClick={() => setIsFullRunnerOpen(true)}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Run Full Benchmark</span>
                  </button>
                  <button
                    onClick={() => setIsComparisonOpen(true)}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    Compare SoCs
                  </button>
                </div>
              </div>

              {/* Subsystem Score Mini Strip */}
              <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* CPU */}
                <div
                  onClick={() => setActiveTab('hardware')}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-cyan-400" /> CPU</span>
                    </div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white">
                      {cpuResult ? cpuResult.multiCoreScore : '--'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {cpuResult ? `${cpuResult.multiCoreSpeedup}x Scaling` : 'Pending test'}
                    </div>
                  </div>
                  <div className="text-[11px] text-cyan-400 flex items-center gap-1 pt-3">
                    <span>Inspect</span> <ArrowRight className="h-3 w-3" />
                  </div>
                </div>

                {/* GPU 3D */}
                <div
                  onClick={() => setActiveTab('hardware')}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-emerald-400" /> GPU 3D</span>
                    </div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white">
                      {gpuResult ? `${gpuResult.fpsAverage} FPS` : '--'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {gpuResult ? `Var: ${gpuResult.frameTimeVarianceMs}ms` : 'Pending test'}
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1 pt-3">
                    <span>Inspect</span> <ArrowRight className="h-3 w-3" />
                  </div>
                </div>

                {/* Battery & Thermal */}
                <div
                  onClick={() => setActiveTab('battery')}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5"><Battery className="h-3.5 w-3.5 text-amber-400" /> Battery</span>
                    </div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white">
                      {batteryResult ? `${batteryResult.thermalRetentionPercent}%` : '--'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {batteryResult ? (batteryResult.throttlingDetected ? 'Throttled' : 'Thermally Stable') : 'Thermal soak'}
                    </div>
                  </div>
                  <div className="text-[11px] text-amber-400 flex items-center gap-1 pt-3">
                    <span>Inspect</span> <ArrowRight className="h-3 w-3" />
                  </div>
                </div>

                {/* Stability */}
                <div
                  onClick={() => setActiveTab('stability')}
                  className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 hover:border-slate-700 transition-colors cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-purple-400" /> Stability</span>
                    </div>
                    <div className="text-2xl font-bold font-mono tabular-nums text-white">
                      {stabilityResult ? `Grade ${stabilityResult.grade}` : '--'}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {stabilityResult ? `${stabilityResult.apisSupported} APIs active` : 'Engine audit'}
                    </div>
                  </div>
                  <div className="text-[11px] text-purple-400 flex items-center gap-1 pt-3">
                    <span>Inspect</span> <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Android & Windows Architecture Comparison Strip */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="font-semibold text-white">
                    Android & Windows Hardware Profiling Framework
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    How in-browser testing accesses bare-metal hardware features across mobile and desktop environments.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsReportOpen(true)}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Export Diagnostic Certificate</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                {/* Android Profile */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <h4 className="font-semibold text-white text-sm">
                      Android Device Architecture
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Evaluates ARM64 heterogenous core complexes (Cortex-X Prime + Performance + Efficiency cores), Adreno/Mali mobile GPU shaders, touch sampling frequency (120Hz-360Hz), and aggressive mobile thermal throttling policies.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Battery Status API:</span>
                      <span className="font-mono text-emerald-400">Native Chromium Support</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Thermal Throttling:</span>
                      <span className="font-mono text-white">Monitored via sustained soak</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Digitizer Multi-Touch:</span>
                      <span className="font-mono text-white">Up to 10 simultaneous touches</span>
                    </div>
                  </div>
                </div>

                {/* Windows Profile */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <h4 className="font-semibold text-white text-sm">
                      Windows PC & Laptop Architecture
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Evaluates x86_64 / ARM64 multi-threaded Web Workers, Direct3D / ANGLE hardware acceleration layers, high-refresh rate displays (120Hz-240Hz), low-latency pointer lock, and IndexedDB flash drive IOPS.
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-t border-slate-800/80">
                      <span className="text-slate-400">High-Concurrency Workers:</span>
                      <span className="font-mono text-cyan-400">Up to 32 hardware threads</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Graphics Backend:</span>
                      <span className="font-mono text-white">Direct3D 11/12 via ANGLE</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Mouse Polling Rate:</span>
                      <span className="font-mono text-white">Up to 1000Hz sampling</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Hardware Bench */}
        {activeTab === 'hardware' && (
          <HardwareBenchView
            cpuResult={cpuResult}
            gpuResult={gpuResult}
            memResult={memResult}
            onUpdateCpu={setCpuResult}
            onUpdateGpu={setGpuResult}
            onUpdateMem={setMemResult}
          />
        )}

        {/* Tab 3: Battery & Thermals */}
        {activeTab === 'battery' && (
          <BatteryThermalView
            batteryResult={batteryResult}
            specs={specs}
            onUpdateResult={setBatteryResult}
          />
        )}

        {/* Tab 4: Software Stability */}
        {activeTab === 'stability' && (
          <StabilityView
            stabilityResult={stabilityResult}
            onUpdateResult={setStabilityResult}
          />
        )}

        {/* Tab 5: Display & Touch */}
        {activeTab === 'display' && <DisplayTouchView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span>DeviceLab Diagnostic Suite</span>
            <span aria-hidden="true" className="mx-2">·</span>
            <span>Real-time in-browser hardware testing for Android & Windows</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsComparisonOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Device Database
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Test Certificate
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FullBenchmarkRunner
        isOpen={isFullRunnerOpen}
        onClose={() => setIsFullRunnerOpen(false)}
        specs={specs}
        onCompleted={handleFullSuiteCompleted}
      />

      <DeviceComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        report={fullReport}
      />

      <ReportExportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        report={fullReport}
      />
    </div>
  );
}
