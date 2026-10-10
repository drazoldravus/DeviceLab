import React, { useState, useRef, useEffect } from 'react';
import { TouchPointData } from '../services/displayTouchTester';
import { Monitor, Smartphone, Maximize2, RefreshCw, Hand, Activity, Check } from 'lucide-react';

export const DisplayTouchView: React.FC = () => {
  // Touch pad state
  const touchCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTouches, setActiveTouches] = useState<TouchPointData[]>([]);
  const [maxTouchesObserved, setMaxTouchesObserved] = useState<number>(0);

  // Polling rate state
  const [pollingHz, setPollingHz] = useState<number>(0);
  const [maxPollingHz, setMaxPollingHz] = useState<number>(0);
  const pointerEventsRef = useRef<number[]>([]);

  // Refresh rate live monitor
  const [liveFps, setLiveFps] = useState<number>(60);
  const [detectedHz, setDetectedHz] = useState<number>(60);
  const rafCountRef = useRef<number>(0);
  const rafStartRef = useRef<number>(performance.now());

  // Dead pixel full-screen mode
  const [deadPixelActive, setDeadPixelActive] = useState<boolean>(false);
  const [deadPixelColorIndex, setDeadPixelColorIndex] = useState<number>(0);
  const deadPixelColors = [
    { name: 'Pure Red (Sub-pixel check)', color: '#FF0000', text: 'text-white' },
    { name: 'Pure Green (Sub-pixel check)', color: '#00FF00', text: 'text-black' },
    { name: 'Pure Blue (Sub-pixel check)', color: '#0000FF', text: 'text-white' },
    { name: 'Pure White (Backlight / Dead pixel)', color: '#FFFFFF', text: 'text-black' },
    { name: 'Pure Black (OLED Black / Stuck pixels)', color: '#000000', text: 'text-white' },
    { name: '50% Neutral Gray (Uniformity)', color: '#808080', text: 'text-white' },
  ];

  // RAF monitor loop
  useEffect(() => {
    let animId: number;

    const measureLoop = (now: number) => {
      rafCountRef.current++;
      const elapsed = now - rafStartRef.current;

      if (elapsed >= 1000) {
        const fps = Math.round((rafCountRef.current * 1000) / elapsed);
        setLiveFps(fps);
        if (fps > 45) {
          setDetectedHz(fps);
        }
        rafCountRef.current = 0;
        rafStartRef.current = now;
      }

      animId = requestAnimationFrame(measureLoop);
    };

    animId = requestAnimationFrame(measureLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Multi-touch & pointer tracking
  useEffect(() => {
    const canvas = touchCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderPad = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw active touches
      activeTouches.forEach((t, i) => {
        // Outer pulsing ring
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(30, t.radius * 1.5), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Inner center
        ctx.beginPath();
        ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillText(`P${i + 1} (${Math.round(t.x)}, ${Math.round(t.y)})`, t.x + 15, t.y - 10);
      });
    };

    renderPad();
  }, [activeTouches]);

  // Touch handlers
  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = touchCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    const touches: TouchPointData[] = [];
    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      touches.push({
        id: t.identifier,
        x: t.clientX - rect.left,
        y: t.clientY - rect.top,
        radius: (t as unknown as { radiusX?: number }).radiusX || 25,
        force: (t as unknown as { force?: number }).force || 1.0,
      });
    }

    setActiveTouches(touches);
    if (touches.length > maxTouchesObserved) {
      setMaxTouchesObserved(touches.length);
    }

    // Measure input polling rate
    const now = performance.now();
    pointerEventsRef.current.push(now);
    updatePollingRate();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = touchCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    if (e.buttons > 0) {
      setActiveTouches([
        {
          id: 0,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          radius: 20,
          force: e.pressure || 0.5,
        },
      ]);
    }

    const now = performance.now();
    pointerEventsRef.current.push(now);
    updatePollingRate();
  };

  const updatePollingRate = () => {
    const now = performance.now();
    // keep only events within the last 500ms
    pointerEventsRef.current = pointerEventsRef.current.filter((t) => now - t <= 500);
    const count = pointerEventsRef.current.length;
    if (count > 2) {
      const rateHz = Math.round(count * 2); // 500ms window * 2
      setPollingHz(rateHz);
      if (rateHz > maxPollingHz) {
        setMaxPollingHz(rateHz);
      }
    }
  };

  // Keyboard navigation for dead pixel test
  useEffect(() => {
    if (!deadPixelActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDeadPixelActive(false);
      } else if (e.key === ' ' || e.key === 'ArrowRight') {
        setDeadPixelColorIndex((prev) => (prev + 1) % deadPixelColors.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deadPixelActive]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Display & Input Diagnostics Lab
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time display refresh rate verification, multi-touch digitizer accuracy, input polling rate (Hz), and dead pixel inspection.
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              setDeadPixelColorIndex(0);
              setDeadPixelActive(true);
            }}
            className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition-colors border border-slate-700"
          >
            <Maximize2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>Launch Fullscreen Dead Pixel Test</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Refresh Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Live Display Refresh Rate</span>
            <Monitor className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-white flex items-baseline gap-2">
            <span>{liveFps} FPS</span>
            <span className="text-sm font-normal text-slate-400">({detectedHz} Hz VSync)</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Measured via requestAnimationFrame hardware pacing
          </div>
        </div>

        {/* Input Polling Rate */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Input Polling Rate</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-white flex items-baseline gap-2">
            <span>{pollingHz} Hz</span>
            <span className="text-sm font-normal text-slate-400">(Peak: {maxPollingHz} Hz)</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Drag mouse or touch pad below to sample
          </div>
        </div>

        {/* Multi-Touch Points */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Simultaneous Touch Points</span>
            <Hand className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-white flex items-baseline gap-2">
            <span>{activeTouches.length} Active</span>
            <span className="text-sm font-normal text-slate-400">(Max: {maxTouchesObserved})</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Hardware supports: {navigator.maxTouchPoints || 0} points
          </div>
        </div>
      </div>

      {/* Interactive Touch & Pointer Canvas */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="font-semibold text-white">
              Digitizer & Multi-Touch Testing Surface
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Place multiple fingers simultaneously (on Android or Windows touchscreens) or rapidly drag your mouse to check coordinate tracking.
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTouches([]);
              setMaxTouchesObserved(0);
              setMaxPollingHz(0);
            }}
            className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 rounded transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset Surface</span>
          </button>
        </div>

        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-[21/9] sm:aspect-[24/9]">
          <canvas
            ref={touchCanvasRef}
            width={800}
            height={320}
            onTouchStart={handleTouch}
            onTouchMove={handleTouch}
            onTouchEnd={() => setActiveTouches([])}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setActiveTouches([])}
            className="w-full h-full cursor-crosshair touch-none"
          />

          {activeTouches.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-xs text-slate-500">
                <Hand className="h-8 w-8 mx-auto mb-2 opacity-30 text-cyan-400" />
                <p>Touch with up to 10 fingers or drag cursor across grid</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dead Pixel Fullscreen Modal */}
      {deadPixelActive && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-between p-6 cursor-pointer"
          style={{ backgroundColor: deadPixelColors[deadPixelColorIndex].color }}
          onClick={() => {
            setDeadPixelColorIndex((prev) => (prev + 1) % deadPixelColors.length);
          }}
        >
          <div className="flex justify-between items-center bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-lg max-w-xl mx-auto border border-slate-800 text-xs text-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                {deadPixelColors[deadPixelColorIndex].name}
              </span>
              <span className="text-slate-400">
                ({deadPixelColorIndex + 1} of {deadPixelColors.length})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Click to advance</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeadPixelActive(false);
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-mono cursor-pointer"
              >
                ESC / Close
              </button>
            </div>
          </div>

          <div className="text-center bg-slate-950/70 backdrop-blur-md px-4 py-1.5 rounded-lg max-w-sm mx-auto border border-slate-800 text-[11px] text-slate-400">
            Inspect panel for unlit (dead) or permanently lit (stuck) sub-pixels.
          </div>
        </div>
      )}
    </div>
  );
};
