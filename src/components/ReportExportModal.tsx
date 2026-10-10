import React, { useState } from 'react';
import { FullTestReport } from '../types/benchmark';
import { X, Copy, Check, Download, Printer, ShieldCheck, Cpu, Zap, HardDrive, Battery } from 'lucide-react';

interface ReportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullTestReport | null;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !report) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `devicelab-test-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              DeviceLab Diagnostic Test Certificate
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>Timestamp: {report.timestamp}</span>
              <span aria-hidden="true">·</span>
              <span>Host: {report.device.osVersion}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Certificate Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-950/40">
          {/* Certificate Banner */}
          <div className="rounded-xl border border-cyan-500/30 bg-slate-950 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
                <ShieldCheck className="h-4 w-4" />
                <span>Verified Diagnostic Certificate</span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {report.device.osVersion}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {report.device.gpuRenderer} · {report.device.cpuCores} Cores
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-400">Composite Performance Index</div>
              <div className="text-3xl font-black font-mono text-cyan-400 tabular-nums">
                {report.overallIndexScore.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">Scale 0 - 10,000</div>
            </div>
          </div>

          {/* Test Sections Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CPU Compute */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span>CPU Performance</span>
              </div>
              {report.cpu ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Single-Core Score:</span>
                    <span className="font-mono tabular-nums text-white font-bold">{report.cpu.singleCoreScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Multi-Core Score:</span>
                    <span className="font-mono tabular-nums text-cyan-400 font-bold">{report.cpu.multiCoreScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Multi-Thread Speedup:</span>
                    <span className="font-mono tabular-nums text-white">{report.cpu.multiCoreSpeedup}x</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Mandelbrot Rate:</span>
                    <span className="font-mono tabular-nums text-white">{report.cpu.mandelbrotOpsSec.toLocaleString()} ops/s</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2">Test omitted from suite</div>
              )}
            </div>

            {/* GPU 3D WebGL */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
                <Zap className="h-4 w-4 text-emerald-400" />
                <span>GPU 3D Graphics</span>
              </div>
              {report.gpu ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Average FPS:</span>
                    <span className="font-mono tabular-nums text-white font-bold">{report.gpu.fpsAverage}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Min / Max Range:</span>
                    <span className="font-mono tabular-nums text-white">{report.gpu.fpsMin} - {report.gpu.fpsMax} FPS</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Frame Variance:</span>
                    <span className="font-mono tabular-nums text-emerald-400">{report.gpu.frameTimeVarianceMs} ms</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">GPU Score:</span>
                    <span className="font-mono tabular-nums text-white font-bold">{report.gpu.score.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2">Test omitted from suite</div>
              )}
            </div>

            {/* RAM & Storage */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
                <HardDrive className="h-4 w-4 text-purple-400" />
                <span>Memory & Storage I/O</span>
              </div>
              {report.memoryStorage ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">RAM Read Bandwidth:</span>
                    <span className="font-mono tabular-nums text-white">{report.memoryStorage.sequentialReadMBs.toLocaleString()} MB/s</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">RAM Write Bandwidth:</span>
                    <span className="font-mono tabular-nums text-white">{report.memoryStorage.sequentialWriteMBs.toLocaleString()} MB/s</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">IndexedDB IOPS:</span>
                    <span className="font-mono tabular-nums text-purple-400 font-bold">{report.memoryStorage.idbWriteIops.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 py-2">Test omitted from suite</div>
              )}
            </div>

            {/* Battery & Stability */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-white mb-2">
                <Battery className="h-4 w-4 text-amber-400" />
                <span>Battery & Stability</span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Thermal Retention:</span>
                  <span className="font-mono tabular-nums text-white font-bold">
                    {report.batteryThermal ? `${report.batteryThermal.thermalRetentionPercent}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Stability Grade:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {report.stability ? `Grade ${report.stability.grade}` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Web APIs Supported:</span>
                  <span className="font-mono tabular-nums text-white">
                    {report.stability ? `${report.stability.apisSupported} / ${report.stability.apisTotal}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyJson}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied JSON!' : 'Copy Raw JSON'}</span>
            </button>
            <button
              onClick={handleDownloadJson}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download .json</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
