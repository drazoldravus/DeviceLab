/**
 * DeviceLab - Benchmark & Diagnostic Type Definitions
 */

export interface SystemSpecs {
  os: 'Android' | 'Windows' | 'macOS' | 'Linux' | 'iOS' | 'Unknown';
  osVersion: string;
  isMobile: boolean;
  browser: string;
  browserVersion: string;
  engine: string;
  cpuCores: number;
  deviceMemoryGB: number | null;
  architecture: string;
  screenResolution: string;
  devicePixelRatio: number;
  colorDepth: number;
  refreshRateHz: number;
  gpuVendor: string;
  gpuRenderer: string;
  hasWebGPU: boolean;
  hasWebGL2: boolean;
  batterySupported: boolean;
  batteryLevel: number | null;
  batteryCharging: boolean | null;
  batteryChargingTime: number | null;
  batteryDischargingTime: number | null;
  maxTouchPoints: number;
  audioSampleRate: number;
  networkType: string;
  networkDownlinkMbps: number | null;
  networkRttMs: number | null;
  userAgent: string;
}

export interface CPUBenchmarkResult {
  singleCoreScore: number;
  multiCoreScore: number;
  multiCoreSpeedup: number;
  singleCoreOpsSec: number;
  primeSieveMs: number;
  mandelbrotOpsSec: number;
  hashThroughputMBs: number;
  completedAt: string;
}

export interface GPUBenchmarkResult {
  fpsAverage: number;
  fpsMin: number;
  fpsMax: number;
  frameTimeVarianceMs: number;
  percentile99FrameTimeMs: number;
  drawCallsPerSec: number;
  score: number;
  completedAt: string;
}

export interface MemoryStorageResult {
  sequentialReadMBs: number;
  sequentialWriteMBs: number;
  randomAccessLatencyUs: number;
  idbWriteIops: number;
  idbReadThroughputMBs: number;
  idbTransactionLatencyMs: number;
  overallScore: number;
  completedAt: string;
}

export interface BatteryThermalResult {
  batteryLevelStart: number | null;
  batteryLevelEnd: number | null;
  isCharging: boolean | null;
  testDurationSeconds: number;
  initialThroughputOps: number;
  finalThroughputOps: number;
  thermalRetentionPercent: number; // e.g. 94% indicates 6% throttling
  throttlingDetected: boolean;
  estimatedDrainPerHour: number | null; // % per hour
  efficiencyScore: number;
  samples: Array<{ timeSec: number; ops: number; fps: number; batteryLevel: number | null }>;
  completedAt: string;
}

export interface StabilityResult {
  longTasksCount: number;
  totalBlockingTimeMs: number;
  maxEventLoopJitterMs: number;
  eventLoopJitterP95Ms: number;
  memoryLeakDetected: boolean;
  heapInitialMB: number | null;
  heapFinalMB: number | null;
  heapDeltaMB: number | null;
  apisSupported: number;
  apisTotal: number;
  apiResults: Record<string, { supported: boolean; details?: string }>;
  stabilityScore: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  completedAt: string;
}

export interface FullTestReport {
  timestamp: string;
  device: SystemSpecs;
  cpu?: CPUBenchmarkResult;
  gpu?: GPUBenchmarkResult;
  memoryStorage?: MemoryStorageResult;
  batteryThermal?: BatteryThermalResult;
  stability?: StabilityResult;
  overallIndexScore: number; // 0 - 10000
}

export interface ReferenceDevice {
  id: string;
  name: string;
  os: 'Android' | 'Windows';
  chipset: string;
  category:
    | 'Flagship Phone'
    | 'Midrange Phone'
    | 'Foldable Phone'
    | 'Gaming Phone'
    | 'Performance Laptop'
    | 'Ultraportable Laptop'
    | 'Gaming Laptop'
    | 'Workstation';
  cpuScore: number;
  gpuScore: number;
  efficiencyScore: number;
  stabilityScore: number;
  overallIndex: number;
  specsSummary: string;
}
