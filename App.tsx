import React, { useState, useEffect, useRef } from 'react';
import { VehicleState, DiffMode, SurfaceType, SCENARIOS, TelemetryPoint } from './types';
import { calculateNextState } from './services/physicsEngine';
import SimulationCanvas from './components/SimulationCanvas';
import TorqueVisualizer from './components/TorqueVisualizer';
import Controls from './components/Controls';
import TelemetryCharts from './components/TelemetryCharts';
import { Info } from 'lucide-react';

const INITIAL_STATE: VehicleState = {
  x: 0,
  y: 0,
  heading: 0,
  speed: 0,
  yawRate: 0,
  slipLeft: 0,
  slipRight: 0,
  torqueLeft: 0,
  torqueRight: 0,
  rpmLeft: 0,
  rpmRight: 0,
  lockingRatio: 0,
  lateralG: 0
};

const App: React.FC = () => {
  // --- State ---
  const [vehicleState, setVehicleState] = useState<VehicleState>(INITIAL_STATE);
  
  // Simulation Inputs
  const [steeringAngle, setSteeringAngle] = useState(0);
  const [targetSpeed, setTargetSpeed] = useState(50);
  const [diffMode, setDiffMode] = useState<DiffMode>('OPEN');
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('DRY');
  
  // Telemetry History
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  
  // Refs for animation loop
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  
  // --- Simulation Loop ---
  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      // Logic runs here
      // 1. Determine throttle input (Simple PID-ish for demo: if speed < target, throttle = 1)
      // Note: We access state via functional updates or refs in real app, but for this loop scope we need latest values.
      // Since this is a React loop, we need to be careful with closure staleness.
      // However, for this demo structure, we will rely on the state being updated in the next frame render cycle 
      // or use refs for mutable physics state to avoid React overhead on every frame.
    }
    
    // Actually, let's use a simpler `useEffect` interval for physics updates 
    // to keep it React-friendly without complex ref management for the user demo.
    // 60FPS interval
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const interval = setInterval(() => {
        setVehicleState(prevState => {
            // Determine Throttle: simple Cruise Control logic
            const speedError = targetSpeed - (prevState.speed * 3.6);
            let throttle = 0;
            if (speedError > 2) throttle = 1.0;
            else if (speedError > 0) throttle = 0.3;
            else throttle = 0; // Coasting

            const nextState = calculateNextState(prevState, {
                steeringAngle,
                throttle,
                surfaceFriction: SCENARIOS[surfaceType].mu,
                diffMode,
                targetSpeed
            });

            // Update Telemetry
            setTelemetry(prev => {
                const now = Date.now();
                const newPoint: TelemetryPoint = {
                    time: now,
                    yawRate: nextState.yawRate,
                    slipLeft: nextState.slipLeft,
                    slipRight: nextState.slipRight,
                    lockingRatio: nextState.lockingRatio
                };
                const newHistory = [...prev, newPoint];
                if (newHistory.length > 50) newHistory.shift();
                return newHistory;
            });

            return nextState;
        });
    }, 16); // ~60Hz

    return () => clearInterval(interval);
  }, [steeringAngle, targetSpeed, diffMode, surfaceType]);

  const handleReset = () => {
      setVehicleState({ ...INITIAL_STATE, x: 0, y: 0, heading: 0, speed: 0 });
      setTelemetry([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                    E
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                    Virtual<span className="text-blue-400">Diff</span> Simulator
                </h1>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
                <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-wider mb-0.5">Scenario</span>
                    <span className={SCENARIOS[surfaceType].color}>{SCENARIOS[surfaceType].label}</span>
                </div>
                <div className="h-8 w-px bg-slate-800"></div>
                <div className="flex flex-col items-end">
                    <span className="text-xs uppercase tracking-wider mb-0.5">Mode</span>
                    <span className="text-white">{diffMode}</span>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column: Visuals */}
        <div className="xl:col-span-8 flex flex-col gap-6">
            
            {/* Main Canvas Area */}
            <div className="bg-slate-900 rounded-2xl p-1 border border-slate-800 shadow-2xl shadow-black/50">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950">
                    <SimulationCanvas state={vehicleState} steeringAngle={steeringAngle} />
                    
                    {/* Overlay Stats */}
                    <div className="absolute bottom-4 left-4 flex gap-4">
                        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg min-w-[100px]">
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Speed</div>
                            <div className="text-2xl font-mono font-bold text-white">
                                {(vehicleState.speed * 3.6).toFixed(0)} <span className="text-sm text-slate-500">km/h</span>
                            </div>
                        </div>
                        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-lg min-w-[100px]">
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Lat G</div>
                            <div className="text-2xl font-mono font-bold text-white">
                                {Math.abs(vehicleState.lateralG).toFixed(2)} <span className="text-sm text-slate-500">g</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="py-6">
                    <TorqueVisualizer state={vehicleState} />
                </div>
            </div>

            {/* Telemetry Charts */}
            <TelemetryCharts data={telemetry} />

        </div>

        {/* Right Column: Controls & Info */}
        <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Instructions Card */}
            <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl flex gap-3">
                <Info className="text-blue-400 shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-slate-300 space-y-2">
                    <p><strong>Experiment:</strong> Set steering to ~30°, speed to 80km/h.</p>
                    <ul className="list-disc pl-4 space-y-1 text-slate-400">
                        <li><strong>OPEN:</strong> Inner wheel spins (red), car slows down.</li>
                        <li><strong>LOCKED:</strong> Car path widens (understeer), outer wheel drags.</li>
                        <li><strong>E-DIFF:</strong> Optimizes torque. Keeps speed up while maintaining tight line.</li>
                    </ul>
                </div>
            </div>

            <Controls 
                steering={steeringAngle} setSteering={setSteeringAngle}
                speed={targetSpeed} setSpeed={setTargetSpeed}
                mode={diffMode} setMode={setDiffMode}
                surface={surfaceType} setSurface={setSurfaceType}
                reset={handleReset}
            />

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    System Logic
                </h3>
                <div className="space-y-4 text-xs font-mono text-slate-400">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span>Δω (Wheel Speed Diff)</span>
                        <span className="text-slate-200">
                             {(((vehicleState.rpmRight - vehicleState.rpmLeft)).toFixed(0))} rpm
                        </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span>Heading</span>
                        <span className="text-slate-200">{(vehicleState.heading * (180/Math.PI) % 360).toFixed(1)}°</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                        <span>Yaw Rate</span>
                        <span className="text-slate-200">{vehicleState.yawRate.toFixed(3)} rad/s</span>
                    </div>
                    <div className="mt-4 p-3 bg-slate-950 rounded border border-slate-800 text-emerald-400/80">
                        {diffMode === 'OPEN' && "// Logic: Equal Torque\nif (torque > grip_min) slip();"}
                        {diffMode === 'LOCKED' && "// Logic: Equal Speed\nomega_left == omega_right;\n// Forces slip in turns"}
                        {diffMode === 'ADAPTIVE' && "// Logic: Dynamic Locking\nL = f(steering, slip, mu);\nTorque_outer += Torque_inner * L;"}
                    </div>
                </div>
            </div>
            
        </div>

      </main>
    </div>
  );
};

export default App;
