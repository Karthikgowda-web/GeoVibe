import React from 'react';
import { Activity, Users, Globe, Zap } from 'lucide-react';

const DashboardStats = () => {
  const stats = [
    { label: 'Active Nodes', value: '1,048', icon: <Globe size={20} />, trend: '+12%', color: 'text-brand-primary' },
    { label: 'Events Handled', value: '84k', icon: <Activity size={20} />, trend: '+4%', color: 'text-brand-accent' },
    { label: 'Connected Agents', value: '342', icon: <Users size={20} />, trend: '-2%', color: 'text-purple-400' },
    { label: 'System Load', value: '24%', icon: <Zap size={20} />, trend: 'Stable', color: 'text-amber-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-dark-surface p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition duration-500"></div>
          <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${stat.color}`}>
              {stat.icon}
            </div>
            <span className={`text-xs font-mono px-2 py-1 rounded-full ${
              stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-400' : 
              stat.trend.startsWith('-') ? 'bg-red-500/10 text-red-400' : 
              'bg-slate-500/10 text-slate-400'
            }`}>
              {stat.trend}
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-light text-white tracking-tight mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-400">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
