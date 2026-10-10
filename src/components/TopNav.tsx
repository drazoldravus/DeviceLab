import React from 'react';
import { Play, Loader2 } from 'lucide-react';

export type NavTab = 'overview' | 'hardware' | 'battery' | 'stability' | 'display';

interface TopNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onRunAll: () => void;
  isRunningAll: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onRunAll,
  isRunningAll,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onTabChange('overview')}
          className="text-left cursor-pointer transition-opacity hover:opacity-90 shrink-0"
        >
          <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
            DeviceLab
          </span>
        </button>

        {/* Zone 2: Single-line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onTabChange('overview')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'overview'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            System Overview
          </button>
          <button
            onClick={() => onTabChange('hardware')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'hardware'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hardware Benchmarks
          </button>
          <button
            onClick={() => onTabChange('battery')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'battery'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Battery & Thermals
          </button>
          <button
            onClick={() => onTabChange('stability')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'stability'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Software Stability
          </button>
          <button
            onClick={() => onTabChange('display')}
            className={`cursor-pointer whitespace-nowrap transition-colors py-1 ${
              activeTab === 'display'
                ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Display & Touch
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onRunAll}
            disabled={isRunningAll}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap shadow-sm shadow-cyan-500/20"
          >
            {isRunningAll ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Suite...</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" />
                <span>Run Full Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden overflow-x-auto border-t border-slate-800/80 px-4 py-2.5 gap-2 scrollbar-none">
        <button
          onClick={() => onTabChange('overview')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'overview' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onTabChange('hardware')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'hardware' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Hardware
        </button>
        <button
          onClick={() => onTabChange('battery')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'battery' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Battery & Thermals
        </button>
        <button
          onClick={() => onTabChange('stability')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'stability' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Stability
        </button>
        <button
          onClick={() => onTabChange('display')}
          className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'display' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Display & Touch
        </button>
      </div>
    </header>
  );
};
