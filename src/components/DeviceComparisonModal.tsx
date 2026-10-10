import React, { useState, useMemo } from 'react';
import { FullTestReport, ReferenceDevice } from '../types/benchmark';
import { REFERENCE_DEVICES } from '../data/referenceDevices';
import {
  X,
  Smartphone,
  Laptop,
  Cpu,
  Zap,
  Battery,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Flame,
  Gamepad2,
  FolderSync,
} from 'lucide-react';

interface DeviceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FullTestReport | null;
}

type CategoryFilter = 'All' | 'Mobiles' | 'Ultrabooks' | 'Gaming & Workstations';
type SortField = 'overallIndex' | 'cpuScore' | 'gpuScore' | 'efficiencyScore';

export const DeviceComparisonModal: React.FC<DeviceComparisonModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [filterOs, setFilterOs] = useState<'All' | 'Android' | 'Windows'>('All');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortField>('overallIndex');

  const currentCpuScore = report?.cpu?.singleCoreScore ?? 1800;
  const currentGpuScore = report?.gpu?.score ?? 3500;
  const currentEffScore = report?.batteryThermal?.efficiencyScore ?? 8200;
  const currentStabScore = report?.stability?.stabilityScore ?? 9200;
  const currentOverall = report?.overallIndexScore ?? 7200;

  const filteredAndSortedDevices = useMemo(() => {
    return REFERENCE_DEVICES.filter((d) => {
      // OS filter
      if (filterOs !== 'All' && d.os !== filterOs) return false;

      // Category filter
      if (categoryFilter === 'Mobiles') {
        if (!['Flagship Phone', 'Midrange Phone', 'Foldable Phone', 'Gaming Phone'].includes(d.category)) {
          return false;
        }
      } else if (categoryFilter === 'Ultrabooks') {
        if (!['Ultraportable Laptop', 'Performance Laptop'].includes(d.category)) {
          return false;
        }
      } else if (categoryFilter === 'Gaming & Workstations') {
        if (!['Gaming Laptop', 'Workstation'].includes(d.category)) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesChip = d.chipset.toLowerCase().includes(q);
        const matchesCat = d.category.toLowerCase().includes(q);
        const matchesSpecs = d.specsSummary.toLowerCase().includes(q);
        if (!matchesName && !matchesChip && !matchesCat && !matchesSpecs) return false;
      }

      return true;
    }).sort((a, b) => b[sortBy] - a[sortBy]);
  }, [filterOs, categoryFilter, searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-800 bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Flagship Device Benchmark Database
              </h2>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded">
                {REFERENCE_DEVICES.length} Reference Systems
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare your live device test metrics against the latest Android flagship smartphones, Copilot+ laptops, and workstation PCs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 sm:px-6 bg-slate-950/80 border-b border-slate-800 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search flagship (e.g. S24 Ultra, Pixel, XPS, ROG, Ryzen)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Current Device Score Callout */}
            <div className="flex items-center gap-3 shrink-0 text-xs text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
              <span className="text-slate-400">Your Tested Index:</span>
              <span className="text-cyan-400 font-mono font-bold text-sm tabular-nums">
                {currentOverall.toLocaleString()}
              </span>
              <span className="text-slate-500">· {report?.device?.osVersion || 'Current Device'}</span>
            </div>
          </div>

          {/* Filter Pills / Segments */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 mr-1">Category:</span>
              {(['All', 'Mobiles', 'Ultrabooks', 'Gaming & Workstations'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                    categoryFilter === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}

              <span className="text-slate-500 mx-1.5">|</span>

              <span className="text-slate-500 mr-1">OS:</span>
              {(['All', 'Android', 'Windows'] as const).map((os) => (
                <button
                  key={os}
                  onClick={() => setFilterOs(os)}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                    filterOs === os
                      ? 'bg-slate-800 text-white border border-slate-600'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {os}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-slate-400">
              <SlidersHorizontal className="h-3 w-3" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="overallIndex">Overall Index</option>
                <option value="cpuScore">CPU Single Core</option>
                <option value="gpuScore">GPU 3D WebGL</option>
                <option value="efficiencyScore">Battery Efficiency</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Device List Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {filteredAndSortedDevices.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              No reference devices match the selected filters. Try clearing your search query.
            </div>
          ) : (
            filteredAndSortedDevices.map((device) => {
              const diff = currentOverall - device.overallIndex;
              const isFaster = diff >= 0;

              return (
                <div
                  key={device.id}
                  className="p-4 sm:p-5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  {/* Device Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          device.os === 'Android'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                            : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/50'
                        }`}
                      >
                        {device.os === 'Android' ? (
                          <Smartphone className="h-5 w-5" />
                        ) : (
                          <Laptop className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-white text-sm sm:text-base">
                            {device.name}
                          </h4>
                          <span className="text-[11px] text-slate-400">· {device.category}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                            {device.os}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          {device.chipset}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Reference Index</div>
                        <div className="font-mono text-lg font-bold text-white tabular-nums">
                          {device.overallIndex.toLocaleString()}
                        </div>
                      </div>
                      <div
                        className={`text-xs font-mono font-semibold px-2.5 py-1 rounded ${
                          isFaster
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50'
                            : 'bg-rose-950/70 text-rose-300 border border-rose-700/50'
                        }`}
                        title={
                          isFaster
                            ? `Your device scores ${diff.toLocaleString()} points higher`
                            : `Your device scores ${Math.abs(diff).toLocaleString()} points lower`
                        }
                      >
                        {isFaster ? `+${diff.toLocaleString()}` : `${diff.toLocaleString()}`}
                      </div>
                    </div>
                  </div>

                  {/* Hardware Specs Summary */}
                  <div className="text-xs text-slate-400 py-2.5 flex items-center gap-1.5">
                    <span className="font-mono text-slate-500">Specs:</span>
                    <span>{device.specsSummary}</span>
                  </div>

                  {/* 4-Column Metric Sub-Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                    {/* CPU Single */}
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Cpu className="h-3 w-3 text-cyan-400" /> CPU Single
                        </span>
                        <span className="font-mono tabular-nums text-white font-semibold">
                          {device.cpuScore}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 transition-all"
                          style={{ width: `${Math.min(100, (device.cpuScore / 3800) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* GPU 3D */}
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3 text-emerald-400" /> GPU 3D
                        </span>
                        <span className="font-mono tabular-nums text-white font-semibold">
                          {device.gpuScore}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 transition-all"
                          style={{ width: `${Math.min(100, (device.gpuScore / 10000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Battery Efficiency */}
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <Battery className="h-3 w-3 text-amber-400" /> Efficiency
                        </span>
                        <span className="font-mono tabular-nums text-white font-semibold">
                          {device.efficiencyScore}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 transition-all"
                          style={{ width: `${Math.min(100, (device.efficiencyScore / 10000) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Software Stability */}
                    <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3 text-purple-400" /> Stability
                        </span>
                        <span className="font-mono tabular-nums text-white font-semibold">
                          {device.stabilityScore}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-400 transition-all"
                          style={{ width: `${Math.min(100, (device.stabilityScore / 10000) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Showing {filteredAndSortedDevices.length} of {REFERENCE_DEVICES.length} flagship systems
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
