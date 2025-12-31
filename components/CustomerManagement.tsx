
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { MOCK_CUSTOMERS } from '../constants';
import { Customer } from '../types';

const CustomerManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const levels = ["Bạc", "Vàng", "Kim cương"];

  const filteredCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return MOCK_CUSTOMERS.filter(c => {
      const birthMonth = new Date(c.dob).getMonth() + 1;
      
      const matchesSearch = 
        c.name.toLowerCase().includes(term) || 
        c.phone.includes(searchTerm) ||
        c.id.toLowerCase().includes(term);

      const matchesMonth = filterMonth === 'all' || birthMonth.toString() === filterMonth;
      const matchesLevel = filterLevel === 'all' || c.membershipLevel === filterLevel;

      return matchesSearch && matchesMonth && matchesLevel;
    });
  }, [searchTerm, filterMonth, filterLevel]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getMembershipStyle = (level: string) => {
    switch (level) {
      case 'Kim cương': return 'bg-indigo-600 text-white shadow-indigo-100';
      case 'Vàng': return 'bg-amber-400 text-amber-950 shadow-amber-100';
      default: return 'bg-slate-200 text-slate-700 shadow-slate-100';
    }
  };

  const handleExportExcel = () => {
    if (filteredCustomers.length === 0) {
      alert("Không có dữ liệu để xuất!");
      return;
    }

    const dataToExport = filteredCustomers.map(c => ({
      "Mã KH": c.id,
      "Họ Tên": c.name,
      "SĐT": c.phone,
      "Email": c.email,
      "Ngày sinh": c.dob,
      "Địa chỉ": c.address,
      "Cấp bậc": c.membershipLevel,
      "Tổng chi tiêu": c.totalSpent,
      "Số đơn": c.orderCount,
      "Mã đơn hàng": c.orderIds.join(", ")
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KhachHang");
    
    // Tự động điều chỉnh độ rộng cột
    const max_width = dataToExport.reduce((w, r) => Math.max(w, r["Họ Tên"].length), 10);
    worksheet["!cols"] = [ { wch: 10 }, { wch: max_width + 5 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 40 }, { wch: 12 }, { wch: 15 }, { wch: 8 }, { wch: 30 } ];

    XLSX.writeFile(workbook, `DanhSachKhachHang_${new Date().getTime()}.xlsx`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Thanh tiêu đề & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quản lý Khách hàng</h2>
          <p className="text-slate-500 text-sm font-medium">Hệ thống Membership & Chăm sóc khách hàng tập trung.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
        >
          <span>📥</span> Xuất Excel Thành viên
        </button>
      </div>

      {/* Bộ lọc nâng cao */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Tên, SĐT, Mã KH..." 
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <span className="text-[10px] font-black text-slate-400 uppercase">Tháng sinh:</span>
          <select 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-transparent text-xs font-bold text-indigo-600 outline-none flex-1 cursor-pointer"
          >
            <option value="all">Tất cả</option>
            {months.map(m => <option key={m} value={m}>Tháng {m}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <span className="text-[10px] font-black text-slate-400 uppercase">Cấp bậc:</span>
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-transparent text-xs font-bold text-indigo-600 outline-none flex-1 cursor-pointer"
          >
            <option value="all">Tất cả</option>
            {levels.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-end">
          <span className="text-xs font-bold text-slate-400">Hiển thị: <span className="text-indigo-600">{filteredCustomers.length}</span> kết quả</span>
        </div>
      </div>

      {/* Danh sách khách hàng */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCustomers.map((customer) => (
          <div 
            key={customer.id} 
            className={`bg-white rounded-2xl border transition-all duration-300 ${selectedCustomerId === customer.id ? 'border-indigo-500 shadow-xl ring-1 ring-indigo-500' : 'border-slate-100 shadow-sm hover:shadow-md'}`}
          >
            <div 
              className="p-5 flex flex-col lg:flex-row items-start lg:items-center gap-6 cursor-pointer"
              onClick={() => setSelectedCustomerId(selectedCustomerId === customer.id ? null : customer.id)}
            >
              <div className="relative">
                <img src={customer.avatar} alt={customer.name} className="w-16 h-16 rounded-2xl object-cover shadow-inner" />
                <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter shadow-sm border-2 border-white ${getMembershipStyle(customer.membershipLevel)}`}>
                  {customer.membershipLevel}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-slate-900 truncate text-lg">{customer.name}</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">{customer.id}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 text-xs text-slate-500">
                  <p className="flex items-center gap-1.5 font-bold text-indigo-600">📱 {customer.phone}</p>
                  <p className="flex items-center gap-1.5"><span className="opacity-60 text-lg">🎂</span> {new Date(customer.dob).toLocaleDateString('vi-VN')}</p>
                  <p className="flex items-center gap-1.5 truncate"><span className="opacity-60 text-lg">📍</span> {customer.address}</p>
                </div>
              </div>

              <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Tổng chi tiêu</p>
                  <p className="text-xl font-black text-indigo-600 leading-none">{formatCurrency(customer.totalSpent)}</p>
                </div>
                <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black">
                  {customer.orderCount} đơn hàng
                </div>
              </div>
            </div>

            {selectedCustomerId === customer.id && (
              <div className="px-5 pb-5 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Mã đơn hàng đã mua */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      🎫 Lịch sử mã đơn hàng
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {customer.orderIds.map(id => (
                        <span key={id} className="px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sản phẩm mua nhiều */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      🛍️ Sản phẩm mua nhiều nhất
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {customer.purchasedProducts.map((product) => (
                        <div key={product.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <img src={product.image} className="w-10 h-10 rounded-lg object-cover" alt={product.name} />
                          <div>
                            <p className="text-[11px] font-bold text-slate-800 truncate max-w-[120px]">{product.name}</p>
                            <p className="text-[10px] text-slate-500">Mua {product.totalQuantity} lần • {new Date(product.lastPurchased).toLocaleDateString('vi-VN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Thông tin Marketing bổ sung */}
                <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <p className="text-xs font-bold text-indigo-900">Email Marketing</p>
                        <p className="text-[10px] text-indigo-600">{customer.email}</p>
                      </div>
                   </div>
                   <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-colors">
                     Gửi Ưu đãi Sinh Nhật
                   </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredCustomers.length === 0 && (
          <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-slate-200">
             <span className="text-5xl mb-4 block">🧐</span>
             <p className="text-slate-500 font-bold">Không tìm thấy khách hàng nào khớp với bộ lọc.</p>
             <button 
              onClick={() => {setSearchTerm(''); setFilterMonth('all'); setFilterLevel('all');}}
              className="mt-4 text-indigo-600 font-bold text-sm underline"
             >
               Đặt lại tất cả bộ lọc
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
