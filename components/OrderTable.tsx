
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
    [OrderStatus.PROCESSING]: { label: 'Đang gói hàng', icon: '📦', color: 'text-blue-600', activeBg: 'bg-blue-600' },
    [OrderStatus.SHIPPED]: { label: 'Đã giao cho VC', icon: '🚚', color: 'text-sky-600', activeBg: 'bg-sky-600' },
    [OrderStatus.DELIVERED]: { label: 'Giao thành công', icon: '✅', color: 'text-green-600', activeBg: 'bg-green-600' },
    [OrderStatus.EXCHANGE_RETURN]: { label: 'Đổi/Trả', icon: '🔄', color: 'text-rose-600', activeBg: 'bg-rose-600' },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      const matchesSearch = 
        order.customerName.toLowerCase().includes(term) || 
        order.id.toLowerCase().includes(term) ||
        order.email.toLowerCase().includes(term) ||
        order.phone.includes(searchTerm) ||
        (order.discountCode && order.discountCode.toLowerCase().includes(term));

      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesMonth = filterMonth === 'all' || (orderDate.getMonth() + 1).toString() === filterMonth;
      const matchesYear = filterYear === 'all' || orderDate.getFullYear().toString() === filterYear;
      return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    });
  }, [orders, searchTerm, filterStatus, filterMonth, filterYear]);

  // Đồng bộ selectedOrder nếu có sự thay đổi từ bên ngoài (App)
  const currentSelectedOrder = useMemo(() => {
    if (!selectedOrder) return null;
    return orders.find(o => o.id === selectedOrder.id) || null;
  }, [orders, selectedOrder]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length && filteredOrders.length > 0) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredOrders.map(o => o.id)));
  };

  const toggleSelectOrder = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleExportExcel = (onlySelected: boolean = false) => {
    const targetOrders = onlySelected ? filteredOrders.filter(o => selectedIds.has(o.id)) : filteredOrders;
    if (targetOrders.length === 0) return alert("Không có dữ liệu.");
    
    const data = targetOrders.map(o => ({
      'Mã Đơn': o.id, 
      'Khách': o.customerName, 
      'SĐT': o.phone,
      'Tổng Tiền': o.totalAmount, 
      'Mã Giảm Giá': o.discountCode || 'Không',
      'Trạng Thái': o.status, 
      'Ngày': new Date(o.createdAt).toLocaleDateString('vi-VN'), 
      'Lý do Đổi trả': o.returnReason || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `FashionOrders_${new Date().toLocaleDateString()}.xlsx`);
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
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {Object.entries(statusConfig).map(([key, config]) => (
            <button 
              key={key}
              onClick={() => setFilterStatus(key)} 
              className={`px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 whitespace-nowrap shadow-sm border ${
                filterStatus === key 
                  ? `${config.activeBg} text-white border-transparent scale-105 z-10` 
                  : `bg-white ${config.color} border-slate-100 hover:border-slate-300`
              }`}
            >
              <span>{config.icon}</span>
              {config.label}
              {filterStatus === key && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                  {filteredOrders.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              <select className="bg-transparent px-3 py-1.5 text-xs font-bold cursor-pointer" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                <option value="all">Tháng</option>
                {months.map(m => <option key={m} value={m}>T.{m}</option>)}
              </select>
              <div className="h-4 w-px bg-slate-300"></div>
              <select className="bg-transparent px-3 py-1.5 text-xs font-bold cursor-pointer" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                <option value="all">Năm</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <input type="text" placeholder="Mã đơn, khách, mã giảm giá..." className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 w-full text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
            <button onClick={() => handleExportExcel(false)} className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold text-xs shadow-lg shadow-emerald-100 active:scale-95 whitespace-nowrap">📊 Xuất Excel</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 cursor-pointer" checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length} onChange={toggleSelectAll} />
                </th>
                <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mã đơn</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày đặt</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Giá trị đơn</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Mã giảm giá</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const dateObj = new Date(order.createdAt);
                const isNew = order.status === OrderStatus.PENDING;
                return (
                  <tr key={order.id} className={`hover:bg-slate-50/80 transition-colors ${isNew ? 'bg-amber-50/30' : ''}`}>
                    <td className="px-6 py-4">
                      <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 cursor-pointer" checked={selectedIds.has(order.id)} onChange={() => toggleSelectOrder(order.id)} />
                    </td>
                    <td className="px-4 py-4 font-bold text-indigo-600 text-sm">
                      <div className="flex items-center gap-2">
                        {order.id}
                        {isNew && (
                          <span className="px-1.5 py-0.5 bg-rose-500 text-white text-[8px] font-black rounded uppercase animate-pulse">MỚI</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm truncate">{order.customerName}</p>
                          {order.note && <span className="text-amber-500" title={order.note}>💬</span>}
                        </div>
                        <p className="text-[11px] text-indigo-600 font-semibold mt-0.5 leading-none">
                          {order.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <p className="text-xs text-slate-600 font-medium leading-none">
                          {dateObj.toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 leading-none">
                          {dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-slate-900 text-sm">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {order.discountCode ? (
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold border border-indigo-100">
                          {order.discountCode}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black border uppercase ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setSelectedOrder(order)} className="p-2 rounded-lg border border-slate-200 text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90">👁️</button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                    Không tìm thấy đơn hàng nào phù hợp với điều kiện lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {currentSelectedOrder && (
        <OrderDetailModal 
          order={currentSelectedOrder} 
          onUpdateStatus={onUpdateStatus} 
          onPrint={onPrintOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </div>
  );
};

export default OrderTable;
