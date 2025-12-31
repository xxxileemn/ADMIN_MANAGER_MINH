
import React from 'react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  newOrdersCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose, newOrdersCount = 0 }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊' },
    { id: 'orders', label: 'Đơn hàng', icon: '🛍️', badge: newOrdersCount },
    { id: 'inventory', label: 'Kho hàng', icon: '🏬' },
    { id: 'products', label: 'Sản phẩm', icon: '👕' },
    { id: 'customers', label: 'Khách hàng', icon: '👥' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-screen bg-white border-r border-slate-100 flex flex-col z-50 transition-transform duration-300 w-60
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 flex justify-between items-center border-b border-slate-50">
          <div>
            <h1 className="text-xl font-black tracking-tighter text-indigo-600">FASHION<span className="text-slate-900">PRO</span></h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Management System</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`text-lg transition-transform group-hover:scale-110 ${activeTab === item.id ? 'grayscale-0' : 'grayscale opacity-70'}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-[13px]">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className={`flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-lg ${
                  activeTab === item.id ? 'bg-indigo-600 text-white' : 'bg-rose-500 text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-50">
          <div className="flex items-center space-x-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md">AD</div>
            <div className="min-w-0">
              <p className="text-[12px] font-black text-slate-900 truncate">Quản trị viên</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cửa hàng trưởng</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
