import React from 'react';
import { SystemSpecs } from '../types/benchmark';
import { Cpu, Monitor, Battery, Zap, HardDrive, Wifi, Smartphone, Laptop, Sparkles } from 'lucide-react';

interface DeviceSpecCardProps {
  specs: SystemSpecs | null;
  onOpenComparison: () => void;
  onOpenReport: () => void;
  hasResults: boolean;
}

export const DeviceSpecCard: React.FC<DeviceSpecCardProps> = ({
  specs,
  onOpenComparison,
  onOpenReport,
  hasResults,
}) => {
  if (!specs) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse">
        <div className="h-6 w-48 bg-slate-800 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-16 bg-slate-800/60 rounded" />
          <div className="h-16 bg-slate-800/60 rounded" />
          <div className="h-16 bg-slate-800/60 rounded" />
          <div className="h-16 bg-slate-800/60 rounded" />
        </div>
      </div>
    );
  }

  const isAndroid = specs.os === 'Android';
  const isWindows = specs.os === 'Windows';

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span>Detected Host Platform</span>
            <span aria-hidden="true">·</span>
            <span>{specs.browser} {specs.browserVersion ? `v${specs.browserVersion.split('.')[0]}` : ''}</span>
            <span aria-hidden="true">·</span>
            <span>{specs.engine}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            {isAndroid ? (
              <Smartphone className="h-6 w-6 text-emerald-400 shrink-0" />
            ) : isWindows ? (
              <Laptop className="h-6 w-6 text-cyan-400 shrink-0" />
            ) : (
              <Monitor className="h-6 w-6 text-slate-300 shrink-0" />
            )}
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              {specs.osVersion}
            </h1>
            <span className="text-xs font-mono text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded">
              {specs.architecture}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenComparison}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            Compare Reference Devices
          </button>
          {hasResults && (
            <button
              onClick={onOpenReport}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors font-semibold"
            >
              View Test Certificate
            </button>
          )}
        </div>
      </div>

      {/* Hardware Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
        {/* CPU Cores */}
        <div className="rounded-lg bg-slate-950/60 border border-slate-800/70 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Compute Cores</span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-white">
            {specs.cpuCores} Threads
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            Concurrency Target
          </div>
        </div>

        {/* Memory */}
        <div className="rounded-lg bg-slate-950/60 border border-slate-800/70 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <HardDrive className="h-3.5 w-3.5 text-purple-400" />
            <span>RAM Allocation</span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-white">
            {specs.deviceMemoryGB ? `${specs.deviceMemoryGB} GB` : 'System RAM'}
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            {specs.deviceMemoryGB ? 'Available Memory Tier' : 'Browser Managed'}
          </div>
        </div>

        {/* Display Refresh & Res */}
        <div className="rounded-lg bg-slate-950/60 border border-slate-800/70 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Monitor className="h-3.5 w-3.5 text-amber-400" />
            <span>Display Frame Rate</span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-white">
            {specs.refreshRateHz} Hz
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            DPR {specs.devicePixelRatio}x · {specs.colorDepth}-bit
          </div>
        </div>

        {/* GPU Engine */}
        <div className="rounded-lg bg-slate-950/60 border border-slate-800/70 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>GPU Pipeline</span>
          </div>
          <div className="text-lg font-bold font-mono truncate text-white" title={specs.gpuRenderer}>
            {specs.hasWebGPU ? 'WebGPU / GL2' : 'WebGL 2.0'}
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5" title={specs.gpuRenderer}>
            {specs.gpuRenderer}
          </div>
        </div>

        {/* Battery Telemetry */}
        <div className="rounded-lg bg-slate-950/60 border border-slate-800/70 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Battery className="h-3.5 w-3.5 text-rose-400" />
            <span>Power Source</span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-white">
            {specs.batterySupported && specs.batteryLevel !== null
              ? `${specs.batteryLevel}%`
              : 'AC / Powered'}
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            {specs.batteryCharging ? 'Charging (AC)' : specs.batterySupported ? 'Discharging' : 'Standard Power'}
          </div>
        </div>

        {/* Network & Touch */}
        <div className="rounded-lg bg-slate-950/60 border border-slate-800/70 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Wifi className="h-3.5 w-3.5 text-blue-400" />
            <span>Network & Input</span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums text-white">
            {specs.networkDownlinkMbps ? `${specs.networkDownlinkMbps} Mbps` : specs.networkType}
          </div>
          <div className="text-[11px] text-slate-500 truncate mt-0.5">
            {specs.maxTouchPoints > 0 ? `${specs.maxTouchPoints}-pt Touchscreen` : 'Mouse & Keyboard'}
          </div>
        </div>
      </div>
    </div>
  );
};
