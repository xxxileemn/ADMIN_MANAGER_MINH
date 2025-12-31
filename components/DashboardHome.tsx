
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
    // Ngăn chặn spam request (giới hạn 30 giây giữa các lần nhấn làm mới)
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Bảng điều khiển</h2>
        <div className="text-xs md:text-sm text-slate-500 bg-white border border-slate-100 px-3 py-1 rounded-full uppercase font-bold tracking-tight shadow-sm">
          Cập nhật: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Doanh thu tháng" value="452.8M ₫" change="12.5%" isPositive={true} icon="💰" />
        <StatCard title="Đơn hàng mới" value={orders.length.toLocaleString()} change="8.2%" isPositive={true} icon="📦" />
        <StatCard title="Tỷ lệ hoàn trả" value="2.1%" change="1.4%" isPositive={false} icon="🔄" />
        <StatCard title="Khách hàng mới" value="+482" change="15.3%" isPositive={true} icon="✨" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <h3 className="text-base md:text-lg font-black mb-6 flex items-center gap-2 text-slate-900">
            <span className="p-2 bg-indigo-50 rounded-xl text-indigo-600 text-sm">📈</span>
            Xu hướng doanh thu (7 ngày)
          </h3>
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_STATS}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col border border-slate-800">
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-pulse">🪄</span>
                <h3 className="text-lg font-black tracking-tight">AI Insights</h3>
              </div>
              {isLoadingAi && <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>}
            </div>
            
            <div className="flex-1 bg-white/5 backdrop-blur-sm rounded-2xl p-4 mb-4 text-sm overflow-y-auto max-h-64 sm:max-h-none border border-white/10 min-h-[200px]">
              {isLoadingAi ? (
                <div className="flex flex-col items-center justify-center h-full space-y-3 py-10 opacity-60">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-center">Đang phân tích dữ liệu...</p>
                </div>
              ) : errorType === 'QUOTA' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <span className="text-4xl">⏳</span>
                  <div>
                    <p className="font-black text-rose-400 uppercase text-[10px] tracking-widest mb-1">API Limit Reached</p>
                    <p className="text-[11px] opacity-60 leading-relaxed">Bạn đã sử dụng hết lượt miễn phí của Gemini API hôm nay. Vui lòng thử lại sau.</p>
                  </div>
                </div>
              ) : errorType === 'GENERIC' ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-3 animate-in fade-in">
                  <span className="text-4xl">⚠️</span>
                  <div>
                    <p className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-1">Service Error</p>
                    <p className="text-[11px] opacity-60 leading-relaxed">Không thể kết nối với trí tuệ nhân tạo. Kiểm tra lại kết nối mạng của bạn.</p>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none animate-in fade-in duration-500">
                   {aiAnalysis ? aiAnalysis.split('\n').map((line, i) => (
                     <p key={i} className="mb-2 leading-relaxed opacity-80 text-[13px] font-medium">{line}</p>
                   )) : (
                     <p className="text-center text-slate-500 italic mt-10">Chưa có phân tích dữ liệu.</p>
                   )}
                </div>
              )}
            </div>
            
            <button 
              onClick={fetchAnalysis}
              disabled={isLoadingAi}
              className={`w-full bg-indigo-600 text-white font-black py-3.5 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 ${isLoadingAi ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
            >
              <span>{isLoadingAi ? '⌛' : '🔄'}</span>
              {isLoadingAi ? 'ĐANG PHÂN TÍCH...' : 'LÀM MỚI PHÂN TÍCH'}
            </button>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
