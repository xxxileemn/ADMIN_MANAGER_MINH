
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
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchAnalysis = async () => {
    const now = Date.now();
    if (now - lastFetchTime < 10000 && errorType === 'NONE' && aiAnalysis) return;

    setIsLoadingAi(true);
    setErrorType('NONE');
    
    try {
      const result = await analyzeOrders(orders);
      setLastFetchTime(now);
      
      if (result === "ERROR_QUOTA_EXHAUSTED") {
        setErrorType('QUOTA');
      } else if (result === "ERROR_GENERIC" || result === "ERROR_NO_KEY") {
        setErrorType('GENERIC');
      } else {
        setAiAnalysis(result);
        setErrorType('NONE');
      }
    } catch (e) {
      setErrorType('GENERIC');
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      fetchAnalysis();
    }
  }, [orders.length]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Chào buổi sáng, Admin! 👋</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Đây là những gì đang diễn ra với cửa hàng của bạn hôm nay.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <div className="px-3 py-1.5 bg-indigo-50 rounded-xl">
             <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Thời gian thực</span>
           </div>
           <span className="text-sm font-bold text-slate-700 pr-2">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Doanh thu" value="452.8M ₫" change="12.5%" isPositive={true} icon="💰" />
        <StatCard title="Đơn hàng" value={orders.length.toLocaleString()} change="8.2%" isPositive={true} icon="📦" />
        <StatCard title="Hoàn trả" value="2.1%" change="1.4%" isPositive={false} icon="🔄" />
        <StatCard title="Khách mới" value="+482" change="15.3%" isPositive={true} icon="✨" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="text-9xl grayscale">📊</span>
          </div>
          <h3 className="text-lg font-black mb-8 flex items-center gap-3 text-slate-900 relative z-10">
            <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">📈</span>
            Biểu đồ tăng trưởng
          </h3>
          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_STATS}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} />
                <Tooltip 
                  cursor={{stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5'}}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid #f1f5f9', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: '800' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Card - Liquid/Glass Style */}
        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col group border border-slate-800">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -mr-32 -mt-32 group-hover:bg-indigo-500/30 transition-colors"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-500/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-2xl border border-white/10 shadow-inner">🪄</div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">AI Insights</h3>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Powered by Gemini 3</p>
                </div>
              </div>
              {isLoadingAi && <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>}
            </div>
            
            <div className="flex-1 bg-white/5 backdrop-blur-md rounded-3xl p-6 mb-6 text-sm overflow-y-auto border border-white/10 shadow-inner scrollbar-hide min-h-[280px]">
              {isLoadingAi ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-10 opacity-60">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs">✨</div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-center animate-pulse">Đang giải mã dữ liệu...</p>
                </div>
              ) : errorType === 'QUOTA' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-4 animate-in zoom-in duration-300">
                  <span className="text-5xl">🕒</span>
                  <div>
                    <p className="font-black text-rose-400 uppercase text-[10px] tracking-widest mb-1">Hết lượt truy cập</p>
                    <p className="text-[12px] opacity-60 leading-relaxed font-medium">Bạn đã đạt giới hạn yêu cầu AI. Hệ thống cần nghỉ ngơi một chút.</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none animate-in fade-in duration-1000">
                   {aiAnalysis ? aiAnalysis.split('\n').map((line, i) => (
                     <p key={i} className="mb-3 leading-relaxed opacity-90 text-[14px] font-medium tracking-tight">{line}</p>
                   )) : (
                     <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                        <span className="text-4xl mb-2">📥</span>
                        <p>Sẵn sàng phân tích...</p>
                     </div>
                   )}
                </div>
              )}
            </div>
            
            <button 
              onClick={fetchAnalysis}
              disabled={isLoadingAi}
              className={`group w-full bg-white text-slate-900 font-black py-4 rounded-[1.5rem] transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 relative overflow-hidden ${isLoadingAi ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-white/10 hover:bg-indigo-50'}`}
            >
              <span className={`text-xl transition-transform group-hover:rotate-180 duration-500 ${isLoadingAi ? 'animate-spin' : ''}`}>
                {isLoadingAi ? '⌛' : '✨'}
              </span>
              <span className="text-xs uppercase tracking-widest">
                {isLoadingAi ? 'Đang xử lý...' : 'Phân tích thông minh'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
