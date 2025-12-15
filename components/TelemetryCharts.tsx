import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TelemetryPoint } from '../types';

interface Props {
  data: TelemetryPoint[];
}

const TelemetryCharts: React.FC<Props> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-64">
        
        {/* Yaw Rate Chart */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Yaw Rate (Rotation Speed)</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[-2, 2]} hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }}
                            itemStyle={{ color: '#94a3b8' }}
                            labelStyle={{ display: 'none' }}
                        />
                        <Line type="monotone" dataKey="yawRate" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Wheel Slip Chart */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Wheel Slip Ratio</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 1]} hide />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px' }} 
                            labelStyle={{ display: 'none' }}
                        />
                        <Line name="Left Slip" type="monotone" dataKey="slipLeft" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                        <Line name="Right Slip" type="monotone" dataKey="slipRight" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

    </div>
  );
};

export default TelemetryCharts;
