
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

  return (
    <div className="min-h-screen flex bg-slate-50 relative text-slate-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        newOrdersCount={newOrdersCount}
      />

      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'blur-sm sm:blur-none' : ''} lg:ml-64 p-4 md:p-8 min-h-screen`}>
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 text-xl">☰</button>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activeTab === 'dashboard' ? 'Tổng Quan' : activeTab === 'orders' ? 'Đơn Hàng' : activeTab === 'inventory' ? 'Kho Hàng' : 'Thành Viên'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsScanning(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-200 flex items-center gap-2 active:scale-95 transition-all">
                <span>📷</span> Quét QR
            </button>
          </div>
        </header>

        <div className="animate-in fade-in duration-500">
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
