
import React from 'react';
import { Order } from '../types';

interface InvoicePrintViewProps {
  order: Order;
}

const InvoicePrintView: React.FC<InvoicePrintViewProps> = ({ order }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Tính toán các con số thanh toán
  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = order.discount || 0;
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${order.id}&color=000000`;

  return (
    <div className="p-8 text-slate-900 bg-white font-serif max-w-[210mm] mx-auto min-h-[297mm]">
      {/* Header Hóa đơn */}
      <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-indigo-700 mb-1">FashionAdmin Pro</h1>
          <p className="text-sm font-bold text-slate-800">Cửa hàng thời trang phong cách quốc tế</p>
          <div className="text-[11px] mt-3 text-slate-600 space-y-0.5 font-medium">
            <p>📍 Địa chỉ: 123 Đường Thời Trang, Quận 1, TP. Hồ Chí Minh</p>
            <p>📞 Hotline: 1900 8888 | 🌐 Website: fashionadmin.pro</p>
            <p>📧 Email: support@fashionadmin.pro</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <img src={qrCodeUrl} alt="Order QR" className="w-24 h-24 mb-2 border p-1 bg-white" />
          <h2 className="text-2xl font-black uppercase mb-1">Hóa Đơn Bán Hàng</h2>
          <p className="text-sm font-bold bg-slate-100 px-2 py-0.5 rounded">Mã Đơn: <span className="text-indigo-700">{order.id}</span></p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Ngày in: {new Date().toLocaleString('vi-VN')}</p>
        </div>
      </div>

      {/* Thông tin khách hàng & Giao hàng */}
      <div className="grid grid-cols-2 gap-12 mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Thông tin người mua</h3>
          <p className="font-black text-lg text-slate-900">{order.customerName}</p>
          <p className="text-sm font-bold text-indigo-600 mt-0.5">{order.phone}</p>
          <p className="text-xs text-slate-500 mt-0.5">{order.email}</p>
        </div>
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-1">Địa chỉ nhận hàng</h3>
          <p className="text-sm font-medium leading-relaxed italic text-slate-700">
            {order.address}
          </p>
          {order.note && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-[9px] font-black text-amber-600 uppercase mb-0.5">⚠️ Ghi chú khách hàng:</p>
                <p className="text-xs italic font-bold">"{order.note}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <table className="w-full border-collapse mb-10">
        <thead>
          <tr className="border-y-2 border-slate-900 bg-slate-100">
            <th className="py-3 px-3 text-left text-[10px] font-black uppercase tracking-wider">Mô tả sản phẩm / SKU</th>
            <th className="py-3 px-2 text-center text-[10px] font-black uppercase tracking-wider w-24">Phân loại</th>
            <th className="py-3 px-2 text-right text-[10px] font-black uppercase tracking-wider w-32">Đơn giá</th>
            <th className="py-3 px-2 text-center text-[10px] font-black uppercase tracking-wider w-16">SL</th>
            <th className="py-3 px-3 text-right text-[10px] font-black uppercase tracking-wider w-36">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm">
          {order.items.map((item) => (
            <tr key={item.id} className="align-top">
              <td className="py-4 px-3">
                <div className="font-black text-slate-900">{item.name}</div>
                <div className="text-[10px] font-black text-indigo-600 mt-1 uppercase bg-indigo-50 inline-block px-1.5 py-0.5 rounded border border-indigo-100">
                  Mã SP: {item.id}
                </div>
              </td>
              <td className="py-4 px-2 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase">{item.color}</p>
                <p className="text-[10px] font-black text-slate-900 mt-0.5">SIZE {item.size}</p>
              </td>
              <td className="py-4 px-2 text-right font-medium">{formatCurrency(item.price)}</td>
              <td className="py-4 px-2 text-center font-bold">{item.quantity}</td>
              <td className="py-4 px-3 text-right font-black text-slate-900">{formatCurrency(item.price * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Tổng kết thanh toán */}
      <div className="flex justify-end pt-4">
        <div className="w-full max-w-[320px] space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="font-bold text-slate-500">Tạm tính:</span>
              <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
            </div>
            
            {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-rose-600">
                    <span className="font-black italic flex items-center gap-1 uppercase text-[10px]">
                      🏷️ Giảm giá {order.discountCode ? `(${order.discountCode})` : ''}:
                    </span>
                    <span className="font-black">-{formatCurrency(discountAmount)}</span>
                </div>
            )}
            
            <div className="flex justify-between text-2xl font-black border-t-4 border-slate-900 pt-3 mt-2">
              <span className="uppercase tracking-tighter">Tổng cộng:</span>
              <span className="text-indigo-700 drop-shadow-sm">{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="text-[9px] text-right text-slate-400 font-bold italic mt-1">
              (Bằng chữ: Một triệu hai trăm năm mươi ngàn đồng)
            </div>
        </div>
      </div>

      {/* Chính sách & Ký nhận */}
      <div className="mt-16 grid grid-cols-2 gap-12">
        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <h4 className="text-[10px] font-black uppercase mb-2">Chính sách đổi trả:</h4>
          <ul className="text-[9px] text-slate-500 space-y-1 list-disc pl-3 font-medium">
            <li>Quý khách vui lòng kiểm tra hàng trước khi thanh toán.</li>
            <li>Sản phẩm được đổi trả trong vòng 7 ngày nếu còn nguyên tem mác.</li>
            <li>Không áp dụng đổi trả với hàng giảm giá trên 50%.</li>
            <li>Vui lòng giữ lại hóa đơn này để được hỗ trợ bảo hành.</li>
          </ul>
        </div>
        <div className="flex flex-col items-center justify-between py-2">
          <p className="text-xs font-black uppercase">Người nhận hàng</p>
          <div className="h-20 w-full border-b border-slate-200 border-dashed"></div>
          <p className="text-[10px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
        </div>
      </div>

      {/* Footer bản in */}
      <div className="mt-auto pt-16 text-center">
        <p className="text-sm font-black text-slate-900 italic">Cảm ơn quý khách đã tin tưởng lựa chọn FashionAdmin!</p>
        <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest">Hóa đơn điện tử khởi tạo từ hệ thống Quản lý FashionAdmin Pro</p>
      </div>
    </div>
  );
};

export default InvoicePrintView;
