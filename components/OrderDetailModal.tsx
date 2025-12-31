
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

  useEffect(() => {
    setSelectedStatus(order.status);
    setReason(order.returnReason || '');
    setShowReasonInput(order.status === OrderStatus.EXCHANGE_RETURN);
  }, [order]);

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${order.id}&color=4f46e5`;

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

  const handleConfirmUpdate = () => {
    onUpdateStatus(order.id, selectedStatus, reason);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const calculatedSubtotal = useMemo(() => {
    return order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [order.items]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-4xl h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 md:px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <div className="p-1 bg-white border rounded shadow-sm hidden sm:block">
                <img src={qrCodeUrl} alt="QR" className="w-10 h-10" />
             </div>
             <div>
                <div className="flex items-center gap-2">
                    <h3 className="text-lg md:text-xl font-black text-slate-900">Đơn hàng {order.id}</h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-widest ${getStatusStyle(order.status)}`}>{order.status}</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-xl">✕</button>
        </div>

        <div className="flex-1 px-6 md:px-8 py-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 mb-2">Khách hàng</h4>
                <p className="font-black text-slate-900">{order.customerName}</p>
                <p className="text-indigo-600 font-bold">{order.phone}</p>
                <p className="text-slate-500 text-xs">{order.email}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1 mb-2">Giao đến</h4>
                <p className="text-slate-600 italic leading-relaxed">{order.address}</p>
              </div>
            </div>

            {/* Ghi chú khách hàng - ĐÃ KHÔI PHỤC VÀ LÀM NỔI BẬT */}
            {order.note && (
              <div className="p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl flex gap-3 items-start animate-in slide-in-from-top-1 shadow-sm">
                <span className="text-xl">💬</span>
                <div>
                  <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Ghi chú từ khách hàng</h4>
                  <p className="text-sm text-slate-700 italic font-bold">"{order.note}"</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Sản phẩm</h4>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover shadow-sm border" />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-tight">
                          Mã SP: {item.id}
                        </span>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                          {item.color} • Size {item.size}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-indigo-600">{formatCurrency(item.price)}</p>
                      <p className="text-[10px] text-slate-400 font-bold">x{item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thanh toán Summary - ĐÃ BỎ Ô MÀU ĐEN, DÙNG TÔNG SÁNG SANG TRỌNG */}
            <div className="p-6 bg-white rounded-3xl border-2 border-indigo-50 space-y-4 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.1)]">
                <div className="flex justify-between items-center text-sm text-slate-500 font-bold">
                   <span className="uppercase tracking-widest text-[10px]">Tạm tính hàng hóa:</span>
                   <span className="text-slate-800">{formatCurrency(calculatedSubtotal)}</span>
                </div>
                
                {order.discountCode && (
                  <div className="flex justify-between items-center animate-in slide-in-from-left-2 p-3 bg-indigo-50/30 rounded-2xl border border-indigo-100/50">
                    <div className="flex items-center gap-2">
                       <span className="text-lg">🎟️</span>
                       <div>
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Voucher áp dụng</p>
                          <p className="text-sm font-black text-indigo-700">{order.discountCode}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none">Số tiền giảm</p>
                       <p className="text-sm font-black text-rose-600">-{formatCurrency(order.discount || 0)}</p>
                    </div>
                  </div>
                )}

                {!order.discountCode && order.discount && order.discount > 0 ? (
                  <div className="flex justify-between items-center text-sm text-rose-600 border-t border-indigo-50 pt-3">
                     <span className="font-black uppercase tracking-widest text-[10px]">Chiết khấu trực tiếp:</span>
                     <span className="font-black">-{formatCurrency(order.discount)}</span>
                  </div>
                ) : null}

                <div className="pt-4 border-t border-indigo-100 flex justify-between items-center">
                   <div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block leading-none mb-1">Thực thu thanh toán</span>
                      <span className="text-[10px] text-slate-400 font-bold italic">Giá đã bao gồm VAT và Khuyến mãi</span>
                   </div>
                   <span className="text-3xl font-black text-indigo-600 drop-shadow-sm">{formatCurrency(order.totalAmount)}</span>
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 shadow-sm">
              <h4 className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-3">Cập nhật trạng thái</h4>
              <select 
                value={selectedStatus}
                onChange={(e) => {
                    const status = e.target.value as OrderStatus;
                    setSelectedStatus(status);
                    setShowReasonInput(status === OrderStatus.EXCHANGE_RETURN);
                }}
                className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-bold mb-4 outline-none shadow-sm focus:ring-2 focus:ring-indigo-500/20"
              >
                {Object.values(OrderStatus).map(status => <option key={status} value={status}>{status}</option>)}
              </select>

              {showReasonInput && (
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Lý do đổi trả hoặc ghi chú xử lý..."
                  className="w-full p-3 bg-white border border-rose-200 rounded-xl text-xs min-h-[80px] mb-4 outline-none"
                />
              )}

              <button 
                onClick={handleConfirmUpdate}
                className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all mb-3 hover:bg-indigo-700"
              >
                Cập nhật ngay
              </button>
              <button onClick={() => onPrint(order)} className="w-full py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold active:scale-95 hover:bg-indigo-50">In hóa đơn</button>
            </div>

            <div className="space-y-4 pb-10 sm:pb-0">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-1">Lịch sử xử lý</h4>
              <div className="space-y-5">
                {order.statusHistory?.slice().reverse().map((log, index) => (
                  <div key={index} className="flex gap-3 relative">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></div>
                    <div className="text-xs flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-black text-slate-700 uppercase tracking-tight">{log.status}</p>
                        <span className="text-[9px] text-slate-400 font-bold">{log.updatedBy}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mb-1">{new Date(log.updatedAt).toLocaleString('vi-VN')}</p>
                      {log.note && (
                        <div className="mt-2 p-3 bg-indigo-50/50 border-l-4 border-indigo-400 rounded-r-xl shadow-sm animate-in slide-in-from-left-1">
                          <p className="text-[12px] text-slate-900 font-bold leading-relaxed">{log.note}</p>
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
    </div>
  );
};

export default OrderDetailModal;
