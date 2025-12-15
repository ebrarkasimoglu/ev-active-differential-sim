import React from 'react';
import { DiffMode, SurfaceType, SCENARIOS } from '../types';
import { Activity, Zap, Lock, CloudRain, Sun, CloudSnow, RotateCcw } from 'lucide-react';

interface Props {
  steering: number;
  setSteering: (v: number) => void;
  speed: number;
  setSpeed: (v: number) => void;
  mode: DiffMode;
  setMode: (m: DiffMode) => void;
  surface: SurfaceType;
  setSurface: (s: SurfaceType) => void;
  reset: () => void;
}

const Controls: React.FC<Props> = ({ 
    steering, setSteering, 
    speed, setSpeed, 
    mode, setMode, 
    surface, setSurface,
    reset 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
        
        {/* Driving Inputs */}
        <div className="space-y-6">
            <div>
                <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Target Speed</label>
                    <span className="text-sm font-mono text-emerald-400">{speed} km/h</span>
                </div>
                <input 
                    type="range" min="0" max="120" step="5"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
            </div>

            <div>
                <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-300">Steering Angle</label>
                    <span className="text-sm font-mono text-blue-400">{steering}°</span>
                </div>
                <input 
                    type="range" min="-45" max="45" step="1"
                    value={steering}
                    onChange={(e) => setSteering(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Left</span>
                    <span>Center</span>
                    <span>Right</span>
                </div>
            </div>
            
             <button 
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-md text-sm transition-colors w-fit"
            >
                <RotateCcw size={14} /> Reset Position
            </button>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
            
            {/* Diff Mode Selector */}
            <div>
                <label className="text-sm font-medium text-slate-300 mb-3 block">Differential Mode</label>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => setMode('OPEN')}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${mode === 'OPEN' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                    >
                        <Activity size={20} />
                        <span className="text-xs font-bold">OPEN</span>
                    </button>
                    <button 
                        onClick={() => setMode('LOCKED')}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${mode === 'LOCKED' ? 'bg-amber-600/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                    >
                        <Lock size={20} />
                        <span className="text-xs font-bold">LOCKED</span>
                    </button>
                    <button 
                        onClick={() => setMode('ADAPTIVE')}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${mode === 'ADAPTIVE' ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                    >
                        <Zap size={20} />
                        <span className="text-xs font-bold">E-DIFF</span>
                    </button>
                </div>
                <div className="mt-2 text-xs text-slate-400 h-8">
                    {mode === 'OPEN' && "Standard diff. Comfortable, but inner wheel spins on turns, losing power."}
                    {mode === 'LOCKED' && "Wheels locked 1:1. Great traction in straight lines, but understeers and hops in corners."}
                    {mode === 'ADAPTIVE' && "E-Diff Logic. Monitors slip & yaw. Sends torque to outer wheel to help turn-in while preventing slip."}
                </div>
            </div>

            {/* Surface Selector */}
            <div>
                 <label className="text-sm font-medium text-slate-300 mb-3 block">Surface Conditions</label>
                 <div className="flex gap-2">
                    {(Object.keys(SCENARIOS) as SurfaceType[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSurface(s)}
                            className={`flex-1 py-2 px-3 rounded text-xs font-bold border transition-all flex items-center justify-center gap-2 ${surface === s ? `${SCENARIOS[s].color} border-current bg-slate-700` : 'text-slate-500 border-slate-700 bg-slate-800 hover:bg-slate-750'}`}
                        >
                            {s === 'DRY' && <Sun size={14} />}
                            {s === 'WET' && <CloudRain size={14} />}
                            {s === 'SNOW' && <CloudSnow size={14} />}
                            {s}
                        </button>
                    ))}
                 </div>
            </div>

        </div>
    </div>
  );
};

export default Controls;
