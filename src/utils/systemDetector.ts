import { SystemSpecs } from '../types/benchmark';

export async function detectSystemSpecs(): Promise<SystemSpecs> {
  const ua = navigator.userAgent;
  let os: SystemSpecs['os'] = 'Unknown';
  let osVersion = 'Unknown';
  let architecture = 'x86_64 / Unknown';

  // Check userAgentData if available (modern Chromium on Android and Windows)
  const navAny = navigator as unknown as {
    userAgentData?: {
      platform: string;
      getHighEntropyValues?: (hints: string[]) => Promise<{
        architecture?: string;
        bitness?: string;
        platform?: string;
        platformVersion?: string;
        model?: string;
      }>;
    };
    deviceMemory?: number;
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
    };
    getBattery?: () => Promise<{
      level: number;
      charging: boolean;
      chargingTime: number;
      dischargingTime: number;
      addEventListener: (type: string, listener: () => void) => void;
      removeEventListener: (type: string, listener: () => void) => void;
    }>;
  };

  // OS detection
  if (/Android/i.test(ua)) {
    os = 'Android';
    const match = ua.match(/Android\s([0-9.]+)/i);
    osVersion = match ? `Android ${match[1]}` : 'Android (Modern)';
    architecture = /arm64|aarch64/i.test(ua) ? 'ARM64' : 'ARM / 64-bit';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
    if (/Windows NT 10.0/i.test(ua)) {
      osVersion = 'Windows 10 / 11';
    } else if (/Windows NT 6.3/i.test(ua)) {
      osVersion = 'Windows 8.1';
    } else {
      osVersion = 'Windows NT';
    }
    architecture = /Win64|x64|WOW64/i.test(ua) ? 'x86_64' : 'x86_32';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    os = 'macOS';
    osVersion = 'macOS';
    architecture = 'Apple Silicon / ARM64';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
    osVersion = 'Linux Kernel';
    architecture = 'x86_64';
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    os = 'iOS';
    osVersion = 'iOS';
    architecture = 'Apple ARM64';
  }

  // Attempt client hints high entropy values for Windows 11 vs 10 distinction and ARM64
  if (navAny.userAgentData?.getHighEntropyValues) {
    try {
      const highEntropy = await navAny.userAgentData.getHighEntropyValues([
        'architecture',
        'bitness',
        'platform',
        'platformVersion',
        'model',
      ]);
      if (highEntropy.platform === 'Windows' && highEntropy.platformVersion) {
        const majorVersion = parseInt(highEntropy.platformVersion.split('.')[0] || '0', 10);
        // Windows 11 platformVersion starts at 13.0.0 or higher
        if (majorVersion >= 13) {
          osVersion = 'Windows 11 (build ' + highEntropy.platformVersion + ')';
        } else {
          osVersion = 'Windows 10 (build ' + highEntropy.platformVersion + ')';
        }
      }
      if (highEntropy.architecture) {
        architecture = highEntropy.architecture.toUpperCase();
        if (highEntropy.bitness) {
          architecture += ` (${highEntropy.bitness}-bit)`;
        }
      }
      if (highEntropy.platform === 'Android' && highEntropy.model) {
        osVersion += ` [${highEntropy.model}]`;
      }
    } catch {
      // Ignore client hints failure
    }
  }

  // Browser detection
  let browser = 'Unknown';
  let browserVersion = '';
  let engine = 'Blink / Chromium';

  if (/Edg\/([0-9.]+)/i.test(ua)) {
    browser = 'Microsoft Edge';
    browserVersion = ua.match(/Edg\/([0-9.]+)/i)?.[1] || '';
  } else if (/Chrome\/([0-9.]+)/i.test(ua)) {
    browser = 'Google Chrome';
    browserVersion = ua.match(/Chrome\/([0-9.]+)/i)?.[1] || '';
  } else if (/Firefox\/([0-9.]+)/i.test(ua)) {
    browser = 'Mozilla Firefox';
    browserVersion = ua.match(/Firefox\/([0-9.]+)/i)?.[1] || '';
    engine = 'Gecko';
  } else if (/Safari\/([0-9.]+)/i.test(ua) && !/Chrome/i.test(ua)) {
    browser = 'Apple Safari';
    browserVersion = ua.match(/Version\/([0-9.]+)/i)?.[1] || '';
    engine = 'WebKit';
  }

  // GPU info via WebGL
  let gpuVendor = 'Generic / Integrated';
  let gpuRenderer = 'Hardware Accelerated';
  let hasWebGL2 = false;

  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    hasWebGL2 = !!gl2;
    const gl = gl2 || canvas.getContext('webgl');

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gpuVendor;
        gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
      } else {
        gpuVendor = gl.getParameter(gl.VENDOR) || gpuVendor;
        gpuRenderer = gl.getParameter(gl.RENDERER) || gpuRenderer;
      }
    }
  } catch {
    // Canvas context error fallback
  }

  // WebGPU check
  const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;

  // Battery Status
  let batterySupported = false;
  let batteryLevel: number | null = null;
  let batteryCharging: boolean | null = null;
  let batteryChargingTime: number | null = null;
  let batteryDischargingTime: number | null = null;

  if (typeof navAny.getBattery === 'function') {
    try {
      const battery = await navAny.getBattery();
      batterySupported = true;
      batteryLevel = Math.round(battery.level * 100);
      batteryCharging = battery.charging;
      batteryChargingTime = battery.chargingTime;
      batteryDischargingTime = battery.dischargingTime;
    } catch {
      batterySupported = false;
    }
  }

  // Refresh Rate Measurement (quick 30-frame sampling)
  const refreshRateHz = await measureRefreshRate();

  // Audio Context check
  let audioSampleRate = 48000;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      audioSampleRate = ctx.sampleRate;
      void ctx.close();
    }
  } catch {
    // Audio context fallback
  }

  // Screen specs
  const dpr = window.devicePixelRatio || 1;
  const screenResolution = `${window.screen.width * dpr} × ${window.screen.height * dpr} (Viewport: ${window.innerWidth}×${window.innerHeight})`;

  return {
    os,
    osVersion,
    isMobile: /Mobi|Android/i.test(ua) || navigator.maxTouchPoints > 1,
    browser,
    browserVersion,
    engine,
    cpuCores: navigator.hardwareConcurrency || 4,
    deviceMemoryGB: navAny.deviceMemory || null,
    architecture,
    screenResolution,
    devicePixelRatio: Number(dpr.toFixed(2)),
    colorDepth: window.screen.colorDepth || 24,
    refreshRateHz,
    gpuVendor,
    gpuRenderer,
    hasWebGPU,
    hasWebGL2,
    batterySupported,
    batteryLevel,
    batteryCharging,
    batteryChargingTime,
    batteryDischargingTime,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    audioSampleRate,
    networkType: navAny.connection?.effectiveType?.toUpperCase() || 'BROADBAND / WI-FI',
    networkDownlinkMbps: navAny.connection?.downlink || null,
    networkRttMs: navAny.connection?.rtt || null,
    userAgent: ua,
  };
}

async function measureRefreshRate(): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0;
    let startTime = 0;
    const maxFrames = 40;

    function step(timestamp: number) {
      if (frameCount === 0) {
        startTime = timestamp;
      }
      frameCount++;

      if (frameCount < maxFrames) {
        requestAnimationFrame(step);
      } else {
        const totalDurationMs = timestamp - startTime;
        const avgFrameMs = totalDurationMs / (maxFrames - 1);
        const estimatedHz = Math.round(1000 / avgFrameMs);

        // Snap to standard refresh rates
        if (Math.abs(estimatedHz - 60) <= 5) resolve(60);
        else if (Math.abs(estimatedHz - 75) <= 4) resolve(75);
        else if (Math.abs(estimatedHz - 90) <= 5) resolve(90);
        else if (Math.abs(estimatedHz - 120) <= 6) resolve(120);
        else if (Math.abs(estimatedHz - 144) <= 7) resolve(144);
        else if (Math.abs(estimatedHz - 165) <= 7) resolve(165);
        else if (Math.abs(estimatedHz - 240) <= 10) resolve(240);
        else resolve(estimatedHz > 30 ? estimatedHz : 60);
      }
    }

    requestAnimationFrame(step);
  });
}
