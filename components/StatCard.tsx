
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => {
  return (
    <div className="group bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-start justify-between transition-all hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 cursor-default relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150 group-hover:bg-indigo-50/50 duration-700"></div>
      
      <div className="relative z-10">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:scale-105 transition-transform origin-left">{value}</h3>
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black mt-3 ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          <span>{isPositive ? '↗' : '↘'}</span>
          {change}
        </div>
      </div>
      
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative z-10 transition-all group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12 duration-500">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
