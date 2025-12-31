
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Order, OrderStatus } from '../types';
import OrderDetailModal from './OrderDetailModal';

interface OrderTableProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, reason?: string) => void;
  onPrintOrder: (order: Order) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onUpdateStatus, onPrintOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const activeOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId) || null;
  }, [selectedOrderId, orders]);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2023;
    const yearsArr = [];
    for (let y = currentYear; y >= startYear; y--) yearsArr.push(y.toString());
    return yearsArr;
  }, []);

  const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  const statusConfig: Record<string, { label: string, icon: string, color: string, activeBg: string }> = {
    'all': { label: 'Tất cả', icon: '📋', color: 'text-slate-600', activeBg: 'bg-indigo-600' },
    [OrderStatus.PENDING]: { label: 'Chờ xác nhận', icon: '🕒', color: 'text-amber-600', activeBg: 'bg-amber-500' },
    [OrderStatus.PROCESSING]: { label: 'Đang gói', icon: '📦', color: 'text-blue-600', activeBg: 'bg-blue-600' },
    [OrderStatus.SHIPPED]: { label: 'Đã giao VC', icon: '🚚', color: 'text-sky-600', activeBg: 'bg-sky-600' },
    [OrderStatus.DELIVERED]: { label: 'Thành công', icon: '✅', color: 'text-green-600', activeBg: 'bg-green-600' },
    [OrderStatus.EXCHANGE_RETURN]: { label: 'Đổi/Trả', icon: '🔄', color: 'text-rose-600', activeBg: 'bg-rose-600' },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      const matchesSearch = 
        order.customerName.toLowerCase().includes(term) || 
        order.id.toLowerCase().includes(term) ||
        order.phone.includes(term) ||
        (order.discountCode && order.discountCode.toLowerCase().includes(term));
        
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesMonth = filterMonth === 'all' || (orderDate.getMonth() + 1).toString() === filterMonth;
      const matchesYear = filterYear === 'all' || orderDate.getFullYear().toString() === filterYear;
      return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    });
  }, [orders, searchTerm, filterStatus, filterMonth, filterYear]);

  const summaryStats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const totalDiscount = filteredOrders.reduce((acc, curr) => acc + (curr.discount || 0), 0);
    const orderCount = filteredOrders.length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
    return { totalRevenue, totalDiscount, orderCount, avgOrderValue };
  }, [filteredOrders]);

  const toggleSelectOrder = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleExportExcel = () => {
    if (filteredOrders.length === 0) return;
    const data = filteredOrders.map(o => ({ 
      'Mã': o.id, 
      'Khách': o.customerName, 
      'SĐT': o.phone,
      'Thực thu': o.totalAmount, 
      'Voucher': o.discountCode || '',
      'Trạng thái': o.status 
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `FashPro_Orders_${new Date().getTime()}.xlsx`);
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-100';
      case OrderStatus.PROCESSING: return 'bg-blue-50 text-blue-700 border-blue-100';
      case OrderStatus.SHIPPED: return 'bg-sky-50 text-sky-700 border-sky-100';
      case OrderStatus.DELIVERED: return 'bg-green-50 text-green-700 border-green-100';
      case OrderStatus.EXCHANGE_RETURN: return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* 1. Summary Ribbon */}
      <div className="bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center justify-between gap-y-4">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Doanh thu</p>
            <p className="text-lg font-black text-slate-900">{formatCurrency(summaryStats.totalRevenue)}</p>
          </div>
          <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Số đơn</p>
            <p className="text-lg font-black text-slate-900">{summaryStats.orderCount} <span className="text-slate-300 text-xs font-bold">hợp lệ</span></p>
          </div>
          <div className="h-8 w-px bg-slate-100 hidden sm:block"></div>
          <div className="hidden lg:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Voucher/Giảm giá</p>
            <p className="text-lg font-black text-rose-500">{formatCurrency(summaryStats.totalDiscount)}</p>
          </div>
        </div>
        <button onClick={handleExportExcel} className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center gap-2">
          <span>📊</span> Xuất báo cáo
        </button>
      </div>

      {/* 2. Compact Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex gap-2">
           <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="Tìm tên, SĐT, mã đơn..." 
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <span className="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
          </div>
          <div className="flex bg-white border border-slate-200 p-0.5 rounded-xl shadow-sm">
            <select className="bg-transparent px-2 py-1.5 text-[11px] font-black outline-none cursor-pointer border-r border-slate-100" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
              <option value="all">Tháng</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="bg-transparent px-2 py-1.5 text-[11px] font-black outline-none cursor-pointer" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="all">Năm</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        
        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button 
              key={key}
              onClick={() => setFilterStatus(key)} 
              className={`whitespace-nowrap px-3 py-2 rounded-xl text-[11px] font-black transition-all border ${
                filterStatus === key 
                  ? 'bg-indigo-600 text-white border-transparent shadow-md shadow-indigo-100' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
              }`}
            >
              {config.label}
              <span className={`ml-1.5 opacity-60 text-[10px] font-black`}>
                {orders.filter(o => key === 'all' || o.status === key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Streamlined Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hidden sm:block">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-5 py-3.5 w-10"><input type="checkbox" className="w-4 h-4 rounded text-indigo-600 border-slate-300" /></th>
              <th className="px-2 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-12 text-center">STT</th>
              <th className="px-4 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn hàng</th>
              <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
              <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thanh toán</th>
              <th className="px-5 py-3.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
              <th className="px-5 py-3.5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map((order, index) => (
              <tr key={order.id} className="hover:bg-slate-50/40 transition-colors group">
                <td className="px-5 py-3.5">
                  <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleSelectOrder(order.id)} className="w-4 h-4 rounded text-indigo-600 cursor-pointer" />
                </td>
                <td className="px-2 py-3.5 text-center">
                  <span className="text-[11px] font-bold text-slate-400">{index + 1}</span>
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-black text-slate-900 text-[13px]">{order.id}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-[13px] leading-none mb-1">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400 font-medium leading-none">{order.phone}</p>
                    </div>
                    {order.note && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Có ghi chú"></span>}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-black text-slate-900 text-[13px]">{formatCurrency(order.totalAmount)}</p>
                  {order.discountCode ? (
                    <span className="text-[9px] text-indigo-500 font-black uppercase tracking-tight">🎟️ {order.discountCode}</span>
                  ) : (
                    <span className="text-[9px] text-slate-300 font-bold italic">Không voucher</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button onClick={() => setSelectedOrderId(order.id)} className="px-3 py-1.5 text-indigo-600 text-[11px] font-black hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 uppercase tracking-widest">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-slate-400 font-bold text-[13px]">Không có đơn hàng nào 📭</p>
          </div>
        )}
      </div>

      {/* Mobile Streamlined View */}
      <div className="sm:hidden space-y-2">
        {filteredOrders.map((order, index) => (
          <div 
            key={order.id} 
            onClick={() => setSelectedOrderId(order.id)}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-300 italic">#{index + 1}</span>
                <span className="text-[12px] font-black text-indigo-600">#{order.id}</span>
              </div>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="flex justify-between items-end">
               <div>
                  <p className="text-[13px] font-black text-slate-900 leading-none mb-1">{order.customerName}</p>
                  <p className="text-[11px] text-slate-400 font-bold">{order.phone}</p>
               </div>
               <div className="text-right">
                  <p className="text-[14px] font-black text-slate-900 leading-none">{formatCurrency(order.totalAmount)}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      {activeOrder && (
        <OrderDetailModal 
          order={activeOrder} 
          onUpdateStatus={onUpdateStatus} 
          onPrint={onPrintOrder} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
};

export default OrderTable;
