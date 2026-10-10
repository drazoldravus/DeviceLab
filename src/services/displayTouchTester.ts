export interface TouchPointData {
  id: number;
  x: number;
  y: number;
  radius: number;
  force: number;
}

export interface InputSamplingRateResult {
  currentHz: number;
  averageHz: number;
  maxHz: number;
  samplesCount: number;
}
