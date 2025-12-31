
import React, { useState, useEffect, useMemo } from 'react';
import { Order, OrderStatus } from '../types';

interface OrderDetailModalProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, reason?: string) => void;
  onPrint: (order: Order) => void;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onUpdateStatus, onPrint, onClose }) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [reason, setReason] = useState(order.returnReason || '');
  const [showReasonInput, setShowReasonInput] = useState(order.status === OrderStatus.EXCHANGE_RETURN);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    setSelectedStatus(order.status);
    setReason(order.returnReason || '');
    setShowReasonInput(order.status === OrderStatus.EXCHANGE_RETURN);
  }, [order]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${order.id}&color=4f46e5`;

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case OrderStatus.PROCESSING: return 'bg-blue-100 text-blue-700 border-blue-200';
      case OrderStatus.SHIPPED: return 'bg-sky-100 text-sky-700 border-sky-200';
      case OrderStatus.DELIVERED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case OrderStatus.EXCHANGE_RETURN: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-stretch sm:items-center justify-center sm:justify-end p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xl transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white w-full max-w-2xl h-full sm:h-[95vh] rounded-t-[3rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-5">
             <div className="p-2 bg-indigo-50 rounded-2xl hidden sm:block">
                <img src={qrCodeUrl} alt="QR" className="w-12 h-12" />
             </div>
             <div>
                <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">#{order.id}</h3>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(order.status)}`}>{order.status}</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Đơn hàng mới tạo</p>
             </div>
          </div>
          <button onClick={handleClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all text-2xl">✕</button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 px-8 py-8 overflow-y-auto space-y-8 scrollbar-hide">
          {/* Customer & Shipping Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Thông tin khách hàng</h4>
              <p className="text-lg font-black text-slate-900">{order.customerName}</p>
              <p className="text-indigo-600 font-bold text-sm mt-1">{order.phone}</p>
              <p className="text-slate-500 text-xs mt-0.5">{order.email}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Địa chỉ giao hàng</h4>
              <p className="text-slate-700 text-sm italic leading-relaxed">{order.address}</p>
            </div>
          </div>

          {/* Customer Note */}
          {order.note && (
            <div className="p-6 bg-amber-50/50 border-2 border-amber-100 border-dashed rounded-[2rem] flex gap-4 items-start">
              <span className="text-2xl">💬</span>
              <div>
                <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Yêu cầu từ khách</h4>
                <p className="text-sm text-slate-800 font-bold italic leading-relaxed">"{order.note}"</p>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Sản phẩm trong đơn</h4>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-5 p-4 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-all group">
                  <div className="relative shrink-0">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                    <span className="absolute -top-2 -right-2 w-7 h-7 bg-indigo-600 text-white flex items-center justify-center rounded-full text-xs font-black shadow-lg">x{item.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-base mb-1 truncate">{item.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100 uppercase">{item.size}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.color}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-slate-900">{formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="p-8 bg-indigo-600 text-white rounded-[2.5rem] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center text-sm opacity-80 font-bold">
                 <span className="uppercase tracking-widest text-[10px]">Tiền hàng:</span>
                 <span>{formatCurrency(order.totalAmount + (order.discount || 0))}</span>
              </div>
              {order.discountCode && (
                <div className="flex justify-between items-center p-3 bg-white/10 rounded-2xl border border-white/20">
                  <span className="text-[10px] font-black uppercase tracking-widest">🎟️ {order.discountCode}</span>
                  <span className="font-black">-{formatCurrency(order.discount || 0)}</span>
                </div>
              )}
              <div className="pt-4 border-t border-white/20 flex justify-between items-end">
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none mb-2">Thực thu thanh toán</p>
                    <p className="text-sm font-bold opacity-80 italic">Đã bao gồm VAT</p>
                 </div>
                 <span className="text-4xl font-black">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="pt-4 space-y-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Xử lý đơn hàng</h4>
            <div className="grid grid-cols-1 gap-4">
              <select 
                value={selectedStatus}
                onChange={(e) => {
                    const status = e.target.value as OrderStatus;
                    setSelectedStatus(status);
                    setShowReasonInput(status === OrderStatus.EXCHANGE_RETURN);
                }}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-black outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
              >
                {Object.values(OrderStatus).map(status => <option key={status} value={status}>{status}</option>)}
              </select>

              {showReasonInput && (
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ghi chú lý do..."
                  className="w-full p-6 bg-slate-50 border border-rose-100 rounded-[1.5rem] text-sm font-medium min-h-[100px] outline-none animate-in zoom-in duration-300"
                />
              )}

              <div className="flex gap-3">
                 <button 
                  onClick={() => onUpdateStatus(order.id, selectedStatus, reason)}
                  className="flex-[2] py-4.5 bg-indigo-600 text-white rounded-[1.5rem] text-sm font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all uppercase tracking-widest"
                >
                  Xác nhận lưu
                </button>
                <button 
                  onClick={() => onPrint(order)}
                  className="flex-1 py-4.5 bg-slate-900 text-white rounded-[1.5rem] text-sm font-black hover:bg-slate-800 transition-all uppercase tracking-widest"
                >
                  In
                </button>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="space-y-6 pb-20">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Lịch sử vết đơn</h4>
            <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {order.statusHistory?.slice().reverse().map((log, index) => (
                <div key={index} className="flex gap-6 relative z-10">
                  <div className={`w-6 h-6 rounded-full mt-1 shrink-0 shadow-lg ${index === 0 ? 'bg-indigo-600 scale-125 border-4 border-white' : 'bg-slate-300 border-2 border-white'}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className={`text-sm font-black ${index === 0 ? 'text-indigo-600' : 'text-slate-600'}`}>{log.status}</p>
                      <span className="text-[10px] text-slate-400 font-bold">{new Date(log.updatedAt).toLocaleTimeString('vi-VN')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium mb-2">{new Date(log.updatedAt).toLocaleDateString('vi-VN')} • Xử lý bởi: {log.updatedBy}</p>
                    {log.note && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-left-2">
                        <p className="text-xs text-slate-800 font-bold italic leading-relaxed">"{log.note}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
