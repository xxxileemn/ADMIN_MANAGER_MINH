
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
      // Logic tìm kiếm toàn diện: Tên, Mã đơn, SĐT, Mã giảm giá
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

  const toggleSelectOrder = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleExportExcel = (onlySelected: boolean = false) => {
    const targetOrders = onlySelected ? orders.filter(o => selectedIds.has(o.id)) : filteredOrders;
    if (targetOrders.length === 0) return;
    const data = targetOrders.map(o => ({ 
      'Mã': o.id, 
      'Khách': o.customerName, 
      'SĐT': o.phone,
      'Thực thu': o.totalAmount, 
      'Voucher': o.discountCode || '',
      'Số giảm': o.discount || 0,
      'Trạng thái': o.status 
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `DonHang_${new Date().getTime()}.xlsx`);
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-50 text-amber-700 border-amber-200';
      case OrderStatus.PROCESSING: return 'bg-blue-50 text-blue-700 border-blue-200';
      case OrderStatus.SHIPPED: return 'bg-sky-50 text-sky-700 border-sky-200';
      case OrderStatus.DELIVERED: return 'bg-green-50 text-green-700 border-green-200';
      case OrderStatus.EXCHANGE_RETURN: return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-40">
      {/* 1. Status Tabs */}
      <div className="bg-white/50 p-1.5 rounded-3xl border border-slate-100 sm:bg-transparent sm:p-0 sm:border-none">
        <div className="grid grid-cols-2 xs:grid-cols-3 gap-1.5 sm:flex sm:flex-wrap sm:gap-2">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button 
              key={key}
              onClick={() => setFilterStatus(key)} 
              className={`px-2 py-2.5 sm:px-4 sm:py-2.5 rounded-2xl text-[10px] sm:text-[11px] font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border shadow-sm ${
                filterStatus === key 
                  ? `${config.activeBg} text-white border-transparent scale-[1.02] z-10 shadow-indigo-200` 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className="text-sm sm:text-base">{config.icon}</span>
              <span className="text-center truncate w-full sm:w-auto px-1">{config.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black shrink-0 ${filterStatus === key ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                {orders.filter(o => key === 'all' || o.status === key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Search & Time Filters */}
      <div className="flex flex-col lg:flex-row gap-2">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Tìm theo Tên, SĐT, Mã đơn, Mã giảm giá..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none shadow-sm transition-all" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <span className="absolute left-3.5 top-3.5 text-slate-400">🔍</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 min-w-[140px] grid grid-cols-2 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
            <select className="bg-transparent px-1 py-2 text-[10px] font-black outline-none border-r border-slate-100" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
              <option value="all">Tháng</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className="bg-transparent px-1 py-2 text-[10px] font-black outline-none" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
              <option value="all">Năm</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={() => handleExportExcel(false)} className="px-4 py-3 bg-emerald-600 text-white rounded-2xl text-[10px] font-black shadow-lg shadow-emerald-100 active:scale-95 transition-all flex items-center gap-1.5">
            <span>📥</span> EXCEL
          </button>
        </div>
      </div>

      {/* 3. Mobile Display Cards */}
      <div className="sm:hidden space-y-2">
        {filteredOrders.length > 0 ? filteredOrders.map(order => (
          <div 
            key={order.id} 
            onClick={() => setSelectedOrderId(order.id)}
            className={`bg-white p-3.5 rounded-3xl border transition-all active:scale-[0.98] relative overflow-hidden ${selectedIds.has(order.id) ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-100 shadow-sm'}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded-lg border-2 text-indigo-600" 
                  checked={selectedIds.has(order.id)} 
                  onClick={(e) => e.stopPropagation()} 
                  onChange={() => toggleSelectOrder(order.id)} 
                />
                <div>
                   <span className="text-xs font-black text-indigo-600">#{order.id}</span>
                   <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black border uppercase ${getStatusStyle(order.status)}`}>
                {order.status}
              </span>
            </div>
            
            <div className="flex justify-between items-end bg-slate-50 p-2.5 rounded-2xl">
              <div className="min-w-0 pr-2">
                <p className="font-black text-slate-900 text-sm truncate">{order.customerName}</p>
                {order.discountCode && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">🎟️ {order.discountCode}</span>
                    <span className="text-[9px] text-rose-600 font-black">-{formatCurrency(order.discount || 0)}</span>
                  </div>
                )}
                {order.note && <p className="text-[10px] text-amber-600 font-bold mt-1 line-clamp-1">💬 Có ghi chú</p>}
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{order.items.length} món</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
             <p className="text-slate-400 font-bold text-sm">Trống 📭</p>
          </div>
        )}
      </div>

      {/* 4. Desktop View */}
      <div className="hidden sm:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-50">
              <th className="px-6 py-4 w-12"><input type="checkbox" className="w-4 h-4 rounded text-indigo-600" /></th>
              <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã đơn</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Voucher</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thực thu</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tác vụ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleSelectOrder(order.id)} className="w-4 h-4 rounded text-indigo-600 cursor-pointer" />
                </td>
                <td className="px-4 py-4 font-bold text-indigo-600 text-sm">{order.id}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
                      <p className="text-[11px] text-slate-400">{order.phone}</p>
                    </div>
                    {order.note && <span className="text-amber-500 animate-pulse" title="Có ghi chú">💬</span>}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {order.discountCode ? (
                    <div>
                      <span className="text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-1.5 py-0.5 rounded-lg font-black uppercase tracking-tight">{order.discountCode}</span>
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5">-{formatCurrency(order.discount || 0)}</p>
                    </div>
                  ) : <span className="text-slate-300">-</span>}
                </td>
                <td className="px-6 py-4 font-black text-slate-900 text-sm">{formatCurrency(order.totalAmount)}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button onClick={() => setSelectedOrderId(order.id)} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all">👁️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Detail Modal */}
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
