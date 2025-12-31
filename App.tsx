
import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import OrderTable from './components/OrderTable';
import CustomerManagement from './components/CustomerManagement';
import InventoryManagement from './components/InventoryManagement';
import InvoicePrintView from './components/InvoicePrintView';
import QRScanner from './components/QRScanner';
import { Order, OrderStatus, InventoryItem, MovementType, StockMovement, StatusLog } from './types';
import { MOCK_ORDERS, MOCK_INVENTORY } from './constants';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedOrder, setScannedOrder] = useState<Order | null>(null);
  
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);

  const newOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === OrderStatus.PENDING).length;
  }, [orders]);

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, reason?: string) => {
    setOrders(prevOrders => {
      const orderToUpdate = prevOrders.find(o => o.id === orderId);
      if (!orderToUpdate) return prevOrders;

      if (newStatus === OrderStatus.PROCESSING && orderToUpdate.status !== OrderStatus.PROCESSING) {
        updateInventoryFromOrder(orderToUpdate);
      }

      return prevOrders.map(o => {
        if (o.id === orderId) {
          const newLog: StatusLog = {
            status: newStatus,
            updatedAt: new Date().toISOString(),
            updatedBy: 'Admin',
            note: reason
          };
          const updated = { 
            ...o, 
            status: newStatus, 
            returnReason: reason || o.returnReason,
            statusHistory: [...(o.statusHistory || []), newLog] 
          };
          if (scannedOrder?.id === orderId) setScannedOrder(updated);
          return updated;
        }
        return o;
      });
    });
  };

  const updateInventoryFromOrder = (order: Order) => {
    setInventory(prevInv => {
      return prevInv.map(invItem => {
        const itemInOrder = order.items.find(item => item.id === invItem.id);
        if (itemInOrder) {
          const quantityToDeduct = itemInOrder.quantity;
          const newStock = Math.max(0, invItem.stock - quantityToDeduct);
          
          const movement: StockMovement = {
            id: `MOV-SALE-${order.id}-${invItem.id}`,
            productId: invItem.id,
            type: MovementType.SALE,
            quantity: -quantityToDeduct,
            before: invItem.stock,
            after: newStock,
            note: `Xuất kho cho đơn hàng ${order.id}`,
            createdAt: new Date().toISOString(),
            user: 'Hệ thống tự động'
          };

          return {
            ...invItem,
            stock: newStock,
            lastUpdated: new Date().toISOString(),
            status: newStock === 0 ? 'Out of Stock' : newStock <= invItem.minStock ? 'Low Stock' : 'In Stock',
            movements: [...(invItem.movements || []), movement]
          };
        }
        return invItem;
      });
    });
  };

  const handleScanOrder = (orderId: string) => {
    const found = orders.find(o => o.id === orderId);
    if (found) {
        setScannedOrder(found);
        setIsScanning(false);
    } else {
        alert("Không tìm thấy đơn hàng: " + orderId);
    }
  };

  useEffect(() => {
    if (orderToPrint) {
      const timer = setTimeout(() => {
        try { window.print(); } catch (error) { console.error(error); }
        setOrderToPrint(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [orderToPrint]);

  const getPageTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Tổng Quan Hệ Thống';
      case 'orders': return 'Quản Lý Đơn Hàng';
      case 'inventory': return 'Tồn Kho & XNT';
      case 'customers': return 'Khách Hàng Thân Thiết';
      default: return 'Bảng Điều Khiển';
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] relative text-slate-900 overflow-x-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        newOrdersCount={newOrdersCount}
      />

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'blur-sm sm:blur-none opacity-50' : ''} lg:ml-60 p-4 md:p-6 min-h-screen max-w-7xl mx-auto w-full`}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:text-indigo-600 transition-colors">
              <span className="text-xl">☰</span>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {getPageTitle()}
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hôm nay, {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={() => setIsScanning(true)} className="flex-1 sm:flex-none px-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-sm hover:border-indigo-600 transition-all flex items-center justify-center gap-2 active:scale-95">
                <span className="text-sm">📷</span> Quét QR
            </button>
            <div className="hidden sm:flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-2"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Hệ thống: Live</span>
            </div>
          </div>
        </header>

        <div className="relative">
          {activeTab === 'dashboard' && <DashboardHome orders={orders} />}
          {activeTab === 'orders' && (
            <OrderTable 
              orders={orders} 
              onUpdateStatus={handleUpdateOrderStatus} 
              onPrintOrder={setOrderToPrint} 
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryManagement 
              inventory={inventory} 
              setInventory={setInventory} 
            />
          )}
          {activeTab === 'customers' && <CustomerManagement />}
        </div>
      </main>

      {isScanning && <QRScanner onScan={handleScanOrder} onClose={() => setIsScanning(false)} />}

      {orderToPrint && ReactDOM.createPortal(
        <InvoicePrintView order={orderToPrint} />,
        document.getElementById('print-section')!
      )}
    </div>
  );
};

export default App;
