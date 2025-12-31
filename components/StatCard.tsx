
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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        <p className={`text-xs font-semibold mt-2 flex items-center ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isPositive ? '↑' : '↓'} {change}
          <span className="text-slate-400 font-normal ml-1">so với tháng trước</span>
        </p>
      </div>
      <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl">
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
