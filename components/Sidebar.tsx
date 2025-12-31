
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
    { id: 'inventory', label: 'Kho Hàng', icon: '🏬' },
    { id: 'products', label: 'Sản phẩm', icon: '👕' },
    { id: 'customers', label: 'Khách hàng', icon: '👥' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed left-0 top-0 h-screen bg-slate-900 text-white flex flex-col z-50 transition-transform duration-300 w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-indigo-400">FashionAdmin</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Management Pro</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <span className="text-xl">✕</span>
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-semibold text-sm">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className={`flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse ${
                  activeTab === item.id ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
                }`}>
                  {item.badge} <span className="opacity-80">MỚI</span>
                </span>
              )}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold shadow-inner group-hover:scale-105 transition-transform">AD</div>
            <div>
              <p className="text-sm font-bold">Admin User</p>
              <p className="text-[10px] text-slate-400 uppercase">Manager</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
