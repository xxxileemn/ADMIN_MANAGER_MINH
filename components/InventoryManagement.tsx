
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { InventoryItem, MovementType, StockMovement } from '../types';
import CreateImportModal from './CreateImportModal';

type InventoryTab = 'stock' | 'movements' | 'audit';
type StatusFilter = 'all' | 'low' | 'out';

interface InventoryManagementProps {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ inventory, setInventory }) => {
  const [activeSubTab, setActiveSubTab] = useState<InventoryTab>('stock');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(i => i.stock <= i.minStock && i.stock > 0).length;
    const outOfStockItems = inventory.filter(i => i.stock === 0).length;
    const totalValue = inventory.reduce((acc, curr) => acc + (curr.stock * curr.costPrice), 0);
    return { totalItems, lowStockItems, outOfStockItems, totalValue };
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === 'low') {
        matchesStatus = item.stock <= item.minStock && item.stock > 0;
      } else if (statusFilter === 'out') {
        matchesStatus = item.stock === 0;
      }

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, inventory, statusFilter]);

  const allMovements = useMemo(() => {
    const movements: StockMovement[] = [];
    inventory.forEach(item => {
      if (item.movements) movements.push(...item.movements);
    });
    return movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [inventory]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const extractOrderId = (note: string) => {
    const match = note.match(/ORD-\d+/);
    return match ? match[0] : null;
  };

  const handleCreateImport = (itemsToImport: { productId: string, quantity: number }[], note: string) => {
    setInventory(prevInv => {
      const timestamp = Date.now();
      return prevInv.map(item => {
        const importData = itemsToImport.find(ii => ii.productId === item.id);
        if (importData) {
          const newStock = item.stock + importData.quantity;
          const newMovement: StockMovement = {
            id: `MOV-IMP-${timestamp}-${item.id}`,
            productId: item.id,
            type: MovementType.IMPORT,
            quantity: importData.quantity,
            before: item.stock,
            after: newStock,
            note: note,
            createdAt: new Date().toISOString(),
            user: 'Admin_Manager'
          };
          return {
            ...item,
            stock: newStock,
            lastUpdated: new Date().toISOString(),
            status: newStock === 0 ? 'Out of Stock' : newStock <= item.minStock ? 'Low Stock' : 'In Stock',
            movements: [...(item.movements || []), newMovement]
          };
        }
        return item;
      });
    });
    setIsImportModalOpen(false);
    setActiveSubTab('movements');
  };

  const currentSelectedProduct = useMemo(() => {
    if (!selectedProduct) return null;
    return inventory.find(i => i.id === selectedProduct.id) || null;
  }, [inventory, selectedProduct]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng giá trị kho</p>
          <p className="text-xl font-black text-indigo-600">{formatCurrency(stats.totalValue)}</p>
        </div>
        
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/20' : 'bg-white border-slate-100 shadow-sm hover:border-indigo-200'}`}
        >
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${statusFilter === 'all' ? 'text-indigo-600' : 'text-slate-400'}`}>Mã hàng tồn</p>
          <p className="text-xl font-black text-slate-900">{stats.totalItems}</p>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'low' ? 'all' : 'low')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${statusFilter === 'low' ? 'bg-amber-100 border-amber-300 ring-2 ring-amber-500/20 shadow-md scale-[1.02]' : 'bg-amber-50 border-amber-100 shadow-sm hover:border-amber-300'}`}
        >
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Sắp hết hàng</p>
            {statusFilter === 'low' && <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-amber-600 font-black">ĐANG LỌC</span>}
          </div>
          <p className="text-xl font-black text-amber-700">{stats.lowStockItems} SP</p>
        </div>

        <div 
          onClick={() => setStatusFilter(statusFilter === 'out' ? 'all' : 'out')}
          className={`p-5 rounded-3xl border transition-all cursor-pointer ${statusFilter === 'out' ? 'bg-rose-100 border-rose-300 ring-2 ring-rose-500/20 shadow-md scale-[1.02]' : 'bg-rose-50 border-rose-100 shadow-sm hover:border-rose-300'}`}
        >
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Hết hàng</p>
            {statusFilter === 'out' && <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-rose-600 font-black">ĐANG LỌC</span>}
          </div>
          <p className="text-xl font-black text-rose-700">{stats.outOfStockItems} SP</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex gap-1 w-full md:w-auto">
          <button 
            onClick={() => setActiveSubTab('stock')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeSubTab === 'stock' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            📦 Danh sách tồn
          </button>
          <button 
            onClick={() => setActiveSubTab('movements')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-black text-xs transition-all ${activeSubTab === 'movements' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            🔄 Lịch sử XNT
          </button>
        </div>
        <div className="flex gap-2 w-full md:w-auto p-1">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>📥</span> Tạo phiếu nhập
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {activeSubTab === 'stock' && (
          <div className="overflow-x-auto">
             <div className="p-4 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                   <input 
                      type="text" placeholder="Tìm tên SP, SKU..." 
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white transition-all"
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                   />
                   <span className="absolute left-3.5 top-2.5 text-slate-400">🔍</span>
                </div>
                {statusFilter !== 'all' && (
                  <button 
                    onClick={() => setStatusFilter('all')}
                    className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition-all uppercase tracking-widest"
                  >
                    Hủy bộ lọc: {statusFilter === 'low' ? 'Sắp hết' : 'Hết hàng'} ✕
                  </button>
                )}
             </div>
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sản phẩm</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tồn kho</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Thao tác</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {filteredInventory.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                               <img src={item.image} className="w-12 h-12 rounded-xl object-cover" alt={item.name} />
                               <div>
                                  <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-black">{item.sku}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`text-lg font-black ${item.stock <= item.minStock ? 'text-rose-600' : 'text-slate-900'}`}>{item.stock}</span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => { setSelectedProduct(item); setActiveSubTab('movements'); }}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            >
                               👁️ Xem thẻ kho
                            </button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {filteredInventory.length === 0 && (
               <div className="py-20 text-center">
                 <p className="text-slate-400 font-medium italic">Không tìm thấy sản phẩm nào khớp với điều kiện lọc.</p>
               </div>
             )}
          </div>
        )}

        {activeSubTab === 'movements' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-slate-900">
                 {currentSelectedProduct ? `Thẻ kho: ${currentSelectedProduct.name}` : "Nhật ký biến động kho"}
               </h3>
               {currentSelectedProduct && (
                 <button onClick={() => setSelectedProduct(null)} className="text-xs font-bold text-indigo-600">Xem tất cả</button>
               )}
            </div>
            <div className="space-y-4">
               {(currentSelectedProduct ? currentSelectedProduct.movements || [] : allMovements).map(mov => {
                 const product = inventory.find(p => p.id === mov.productId);
                 const orderId = extractOrderId(mov.note);
                 return (
                    <div key={mov.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${mov.type === MovementType.SALE ? 'bg-blue-100 text-blue-600' : mov.type === MovementType.IMPORT ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                            {mov.type === MovementType.SALE ? '🛍️' : mov.type === MovementType.IMPORT ? '📥' : '🔄'}
                        </div>
                        <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-[10px] font-black uppercase text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">{mov.type}</span>
                                <span className="text-[10px] text-slate-500 font-bold">{new Date(mov.createdAt).toLocaleString('vi-VN')}</span>
                                {orderId && (
                                    <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black ml-auto sm:ml-0 shadow-sm">
                                        Đơn hàng: {orderId}
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                <p className="text-sm font-black text-slate-900">{product?.name || "SP đã xóa"}</p>
                                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">{product?.sku || mov.productId}</span>
                            </div>

                            <p className="text-xs text-slate-500 italic">"{mov.note}"</p>
                        </div>
                        <div className="text-right shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-2 sm:pt-0 flex sm:block justify-between items-center">
                            <p className={`font-black text-base ${mov.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {mov.quantity > 0 ? `+${mov.quantity}` : mov.quantity}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold">Tồn cuối: {mov.after}</p>
                        </div>
                    </div>
                 );
               })}
            </div>
          </div>
        )}
      </div>

      {isImportModalOpen && (
        <CreateImportModal 
          inventory={inventory}
          onClose={() => setIsImportModalOpen(false)}
          onConfirm={handleCreateImport}
        />
      )}
    </div>
  );
};

export default InventoryManagement;
