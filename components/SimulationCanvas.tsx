import React, { useRef, useEffect } from 'react';
import { VehicleState } from '../types';
import { PHYSICS } from '../constants';

interface Props {
  state: VehicleState;
  steeringAngle: number;
}

const SimulationCanvas: React.FC<Props> = ({ state, steeringAngle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trailRef = useRef<{x: number, y: number, slip: number}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center view on car but keep relative to world
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Update trail
    trailRef.current.push({ x: state.x, y: state.y, slip: Math.max(state.slipLeft, state.slipRight) });
    if (trailRef.current.length > 200) trailRef.current.shift();

    // 1. Draw Grid (Static background effect)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    const gridSize = 50;
    const offsetX = (state.x * 10) % gridSize;
    const offsetY = (state.y * 10) % gridSize;

    for (let i = 0; i < canvas.width + gridSize; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(i - offsetX, 0);
      ctx.lineTo(i - offsetX, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height + gridSize; i += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, i - offsetY);
      ctx.lineTo(canvas.width, i - offsetY);
      ctx.stroke();
    }

    // 2. Draw Trail (Relative to car)
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    // Draw path relative to car's current position being center
    for (let i = 0; i < trailRef.current.length - 1; i++) {
        const point = trailRef.current[i];
        const nextPoint = trailRef.current[i+1];
        
        // Transform world coords to screen coords relative to car
        const sx = centerX + (point.x - state.x) * 10; // 10px per meter
        const sy = centerY + (point.y - state.y) * 10;
        const nx = centerX + (nextPoint.x - state.x) * 10;
        const ny = centerY + (nextPoint.y - state.y) * 10;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(nx, ny);
        
        // Color based on slip
        const slip = point.slip;
        if (slip > 0.4) ctx.strokeStyle = `rgba(239, 68, 68, ${0.1 + i/200})`; // Red
        else ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 + i/200})`; // Green
        
        ctx.stroke();
    }

    // 3. Draw Car
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(state.heading + Math.PI / 2); // Adjust so 0 heading is up

    // Chassis
    const carWidth = 40; // px
    const carLength = 80; // px
    
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(-carWidth/2 + 5, -carLength/2 + 5, carWidth, carLength);

    // Body
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(-carWidth/2, -carLength/2, carWidth, carLength, 8);
    ctx.fill();
    
    // Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-carWidth/2 + 5, -carLength/4, carWidth - 10, carLength/5);

    // 4. Draw Wheels
    const wheelWidth = 8;
    const wheelLength = 18;
    const wheelOffsetX = carWidth / 2;
    const wheelOffsetY = carLength / 2 - 10;

    // Draw Wheel Helper
    const drawWheel = (x: number, y: number, angle: number, slip: number, torque: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Tire color changes with slip
      ctx.fillStyle = slip > 0.4 ? '#ef4444' : '#1e293b';
      ctx.fillRect(-wheelWidth/2, -wheelLength/2, wheelWidth, wheelLength);
      
      // Torque indicator (yellow rim)
      if (torque > 10) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(-wheelWidth/2, -wheelLength/2, wheelWidth, wheelLength);
      }
      
      ctx.restore();
    };

    const steerRad = steeringAngle * (Math.PI / 180);

    // Front Left
    drawWheel(-wheelOffsetX, -wheelOffsetY, steerRad, 0, 0); // Fronts don't drive in this RWD model for simplicity, or we can pretend AWD
    // Front Right
    drawWheel(wheelOffsetX, -wheelOffsetY, steerRad, 0, 0);
    // Rear Left
    drawWheel(-wheelOffsetX, wheelOffsetY, 0, state.slipLeft, state.torqueLeft);
    // Rear Right
    drawWheel(wheelOffsetX, wheelOffsetY, 0, state.slipRight, state.torqueRight);

    // E-Diff Indicator (Center of rear axle)
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(0, wheelOffsetY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Lock indicator color
    ctx.fillStyle = `rgba(245, 158, 11, ${state.lockingRatio})`; // Amber opacity based on lock
    ctx.beginPath();
    ctx.arc(0, wheelOffsetY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

  }, [state, steeringAngle]);

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-800">
        <canvas ref={canvasRef} width={600} height={400} className="w-full h-full object-cover" />
        <div className="absolute top-4 left-4 bg-slate-900/80 p-2 rounded text-xs font-mono text-slate-300 pointer-events-none">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Good Grip
            </div>
            <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div> Slipping
            </div>
        </div>
    </div>
  );
};

export default SimulationCanvas;
