import React from 'react';
import { VehicleState } from '../types';

interface Props {
  state: VehicleState;
}

const TorqueVisualizer: React.FC<Props> = ({ state }) => {
  const maxTorque = 400; // Visual max

  // Calculate percentages
  const leftWidth = Math.min((state.torqueLeft / maxTorque) * 100, 100);
  const rightWidth = Math.min((state.torqueRight / maxTorque) * 100, 100);

  return (
    <div className="flex flex-col gap-4 w-full px-4">
      {/* Rear Axle Visualization */}
      <div className="flex items-center justify-between gap-4">
        
        {/* Left Wheel */}
        <div className="flex-1 flex flex-col items-end">
          <div className="text-xs text-slate-400 mb-1">REAR LEFT</div>
          <div className="flex items-center gap-2 w-full justify-end">
            <div className={`text-xs font-bold ${state.slipLeft > 0.3 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
              {state.slipLeft > 0.3 ? 'SLIP' : 'GRIP'}
            </div>
            <div className="h-4 bg-slate-800 w-full max-w-[120px] rounded-l overflow-hidden relative border border-slate-700">
               <div 
                 className="h-full bg-gradient-to-r from-blue-600 to-blue-400 absolute right-0 transition-all duration-100"
                 style={{ width: `${leftWidth}%` }}
               />
            </div>
          </div>
          <div className="text-lg font-mono font-bold text-white tabular-nums">
            {state.torqueLeft.toFixed(0)} <span className="text-xs text-slate-500">Nm</span>
          </div>
        </div>

        {/* Diff Icon Center */}
        <div className="flex flex-col items-center justify-center w-24">
            <div className={`text-xl font-bold mb-1 ${state.lockingRatio > 0.8 ? 'text-amber-500' : 'text-slate-400'}`}>
                {(state.lockingRatio * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-600">Lock Ratio</div>
            
            {/* Visual Lock mechanism */}
            <div className="mt-2 w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-amber-500 transition-all duration-200"
                    style={{ width: `${state.lockingRatio * 100}%`, margin: '0 auto' }}
                ></div>
            </div>
        </div>

        {/* Right Wheel */}
        <div className="flex-1 flex flex-col items-start">
          <div className="text-xs text-slate-400 mb-1">REAR RIGHT</div>
          <div className="flex items-center gap-2 w-full">
            <div className="h-4 bg-slate-800 w-full max-w-[120px] rounded-r overflow-hidden relative border border-slate-700">
               <div 
                 className="h-full bg-gradient-to-l from-blue-600 to-blue-400 absolute left-0 transition-all duration-100"
                 style={{ width: `${rightWidth}%` }}
               />
            </div>
            <div className={`text-xs font-bold ${state.slipRight > 0.3 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
              {state.slipRight > 0.3 ? 'SLIP' : 'GRIP'}
            </div>
          </div>
          <div className="text-lg font-mono font-bold text-white tabular-nums">
            {state.torqueRight.toFixed(0)} <span className="text-xs text-slate-500">Nm</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TorqueVisualizer;
