
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from './StatCard';
import { SALES_STATS } from '../constants';
import { Order } from '../types';
import { analyzeOrders } from '../services/geminiService';

interface DashboardHomeProps {
  orders: Order[];
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ orders }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [errorType, setErrorType] = useState<'NONE' | 'QUOTA' | 'GENERIC'>('NONE');

  const fetchAnalysis = async () => {
    setIsLoadingAi(true);
    setErrorType('NONE');
    const result = await analyzeOrders(orders);
    
    if (result === "ERROR_QUOTA_EXHAUSTED") {
      setErrorType('QUOTA');
      setAiAnalysis("");
    } else if (result === "ERROR_GENERIC") {
      setErrorType('GENERIC');
      setAiAnalysis("");
    } else {
      setAiAnalysis(result || "Không có dữ liệu phân tích.");
      setErrorType('NONE');
    }
    setIsLoadingAi(false);
  };

  useEffect(() => {
    fetchAnalysis();
  }, [orders.length]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Bảng điều khiển</h2>
        <div className="text-xs md:text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase font-medium">Cập nhật: 10:30 Hôm nay</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Doanh thu tháng" value="452.8M ₫" change="12.5%" isPositive={true} icon="💰" />
        <StatCard title="Đơn hàng mới" value={orders.length.toLocaleString()} change="8.2%" isPositive={true} icon="📦" />
        <StatCard title="Tỷ lệ hoàn trả" value="2.1%" change="1.4%" isPositive={false} icon="🔄" />
        <StatCard title="Khách hàng mới" value="+482" change="15.3%" isPositive={true} icon="✨" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-base md:text-lg font-bold mb-6 flex items-center gap-2">
            <span className="p-1 bg-indigo-50 rounded-lg text-indigo-600 text-sm">📈</span>
            Xu hướng doanh thu (7 ngày qua)
          </h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_STATS}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-sm relative overflow-hidden flex flex-col">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl animate-pulse">✨</span>
              <h3 className="text-lg font-bold">Trợ lý AI Phân tích</h3>
            </div>
            
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 text-sm overflow-y-auto max-h-64 sm:max-h-none scrollbar-hide border border-white/10 min-h-[220px]">
              {isLoadingAi ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  <p className="text-xs font-medium uppercase tracking-widest opacity-80 text-center">Đang phân tích dữ liệu kho...</p>
                </div>
              ) : errorType === 'QUOTA' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-3 animate-in fade-in zoom-in duration-300">
                  <span className="text-4xl">💎</span>
                  <div>
                    <p className="font-black text-rose-300 uppercase text-xs tracking-tighter mb-1">Hạn mức AI đã hết</p>
                    <p className="text-[11px] opacity-70 leading-relaxed px-2">Hệ thống AI hiện đang đạt giới hạn yêu cầu. Vui lòng quay lại sau ít phút hoặc kiểm tra lại gói dịch vụ của bạn.</p>
                  </div>
                </div>
              ) : errorType === 'GENERIC' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-3 animate-in fade-in zoom-in duration-300">
                  <span className="text-4xl">📡</span>
                  <div>
                    <p className="font-black text-slate-300 uppercase text-xs tracking-tighter mb-1">Không thể kết nối</p>
                    <p className="text-[11px] opacity-70 leading-relaxed px-2">Gặp sự cố khi liên lạc với trí tuệ nhân tạo. Hãy nhấn làm mới để thử kết nối lại.</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none animate-in fade-in duration-500">
                   {aiAnalysis.split('\n').map((line, i) => (
                     <p key={i} className="mb-2 leading-relaxed opacity-90 text-[13px]">{line}</p>
                   ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={fetchAnalysis}
              disabled={isLoadingAi}
              className={`w-full bg-white text-indigo-900 font-black py-3.5 rounded-xl transition-all active:scale-95 shadow-xl ${isLoadingAi ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-50 hover:shadow-white/10'}`}
            >
              {isLoadingAi ? 'Đang phân tích...' : 'Làm mới phân tích'}
            </button>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
