export type DiffMode = 'OPEN' | 'LOCKED' | 'ADAPTIVE';
export type SurfaceType = 'DRY' | 'WET' | 'SNOW';

export interface SimulationParams {
  steeringAngle: number; // -45 to 45 degrees
  throttle: number; // 0 to 1
  surfaceFriction: number; // mu
  diffMode: DiffMode;
  targetSpeed: number; // km/h
}

export interface VehicleState {
  x: number;
  y: number;
  heading: number; // radians
  speed: number; // m/s
  yawRate: number; // rad/s
  
  // Wheel specific
  slipLeft: number; // 0 to 1 (1 is 100% slip)
  slipRight: number; // 0 to 1
  torqueLeft: number; // Nm
  torqueRight: number; // Nm
  rpmLeft: number;
  rpmRight: number;
  
  // E-Diff internal
  lockingRatio: number; // 0 to 1
  lateralG: number;
}

export interface TelemetryPoint {
  time: number;
  yawRate: number;
  slipLeft: number;
  slipRight: number;
  lockingRatio: number;
}

export const SCENARIOS: Record<SurfaceType, { label: string; mu: number; color: string }> = {
  DRY: { label: 'Dry Tarmac', mu: 1.0, color: 'text-emerald-400' },
  WET: { label: 'Wet Asphalt', mu: 0.6, color: 'text-blue-400' },
  SNOW: { label: 'Snow/Ice', mu: 0.3, color: 'text-sky-200' },
};
