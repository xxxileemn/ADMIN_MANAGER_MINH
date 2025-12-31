
import React from 'react';
import { Order } from '../types';

interface InvoicePrintViewProps {
  order: Order;
}

const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ order }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.id}&color=000000`;

  return (
    <div className="p-10 text-slate-900 bg-white">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-indigo-700">FashionAdmin Pro</h1>
          <div className="text-sm mt-2 text-slate-600 font-medium">
            <p>Địa chỉ: 123 Đường Thời Trang, Quận 1, TP. Hồ Chí Minh</p>
            <p>Hotline: 1900 8888 | Website: fashionadmin.pro</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <img src={qrCodeUrl} alt="Order QR" className="w-24 h-24 mb-3 border p-1" />
          <h2 className="text-2xl font-bold uppercase mb-2">Hóa Đơn Bán Hàng</h2>
          <p className="text-sm font-bold">Mã Đơn: <span className="text-indigo-600 text-lg">{order.id}</span></p>
          <p className="text-xs text-slate-400">Ngày in: {new Date().toLocaleString('vi-VN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b">Người mua hàng</h3>
          <p className="font-bold text-lg">{order.customerName}</p>
          <p className="text-sm">{order.phone}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b">Địa chỉ giao nhận</h3>
          <p className="text-sm italic leading-relaxed">{order.address}</p>
        </div>
      </div>

      <table className="w-full border-collapse mb-10">
        <thead>
          <tr className="border-y-2 border-slate-900 bg-slate-50">
            <th className="py-3 px-2 text-left text-xs font-bold uppercase">Sản phẩm</th>
            <th className="py-3 px-2 text-left text-xs font-bold uppercase">Phân loại</th>
            <th className="py-3 px-2 text-right text-xs font-bold uppercase">Đơn giá</th>
            <th className="py-3 px-2 text-center text-xs font-bold uppercase">SL</th>
            <th className="py-3 px-2 text-right text-xs font-bold uppercase">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {order.items.map((item) => (
            <tr key={item.id}>
              <td className="py-4 px-2 font-bold">{item.name}</td>
              <td className="py-4 px-2 uppercase text-[10px] font-bold text-slate-400">{item.color} / {item.size}</td>
              <td className="py-4 px-2 text-right">{formatCurrency(item.price)}</td>
              <td className="py-4 px-2 text-center">{item.quantity}</td>
              <td className="py-4 px-2 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-1/3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính:</span>
              <span className="font-bold">{formatCurrency(subtotal)}</span>
            </div>
            {order.discount && (
                <div className="flex justify-between text-sm text-rose-600">
                    <span>Chiết khấu ({order.discountCode}):</span>
                    <span className="font-bold">-{formatCurrency(order.discount)}</span>
                </div>
            )}
            <div className="flex justify-between text-xl font-black border-t-2 border-slate-900 pt-2">
              <span>TỔNG CỘNG:</span>
              <span className="text-indigo-700">{formatCurrency(order.totalAmount)}</span>
            </div>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-2 text-center text-sm font-bold uppercase">
        <div>Người lập hóa đơn</div>
        <div>Khách hàng ký nhận</div>
      </div>
    </div>
  );
};

export default InvoicePrintView;
