
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InventoryItem } from '../types';

interface ImportItem {
  productId: string;
  quantity: number;
}

interface CreateImportModalProps {
  inventory: InventoryItem[];
  onClose: () => void;
  onConfirm: (items: ImportItem[], note: string) => void;
}

const CreateImportModal: React.FC<CreateImportModalProps> = ({ inventory, onClose, onConfirm }) => {
  const [selectedItems, setSelectedItems] = useState<ImportItem[]>([]);
  const [note, setNote] = useState('Nhập hàng bổ sung');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Lọc sản phẩm theo tên hoặc SKU, nếu query trống thì trả về toàn bộ
  const filteredProducts = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return inventory;
    return inventory.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.sku.toLowerCase().includes(term)
    );
  }, [searchQuery, inventory]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleItemSelection = (productId: string) => {
    const isSelected = selectedItems.some(item => item.productId === productId);
    if (isSelected) {
      setSelectedItems(selectedItems.filter(item => item.productId !== productId));
    } else {
      setSelectedItems([...selectedItems, { productId, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    setSelectedItems(selectedItems.map(item => 
      item.productId === productId ? { ...item, quantity: Math.max(1, qty) } : item
    ));
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm!");
      return;
    }
    onConfirm(selectedItems, note);
  };

  const totalQuantity = selectedItems.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-emerald-100 text-emerald-600 rounded-xl text-lg shadow-sm">📥</span>
            <div>
              <h3 className="text-xl font-black text-slate-900 leading-tight">Tạo phiếu nhập hàng</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhập nhiều mã hàng cùng lúc</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-hide">
          {/* Search Section */}
          <div className="space-y-3 relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tìm kiếm & Thêm sản phẩm</label>
            <div className="relative">
              <input 
                type="text"
                value={searchQuery}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Click để chọn sản phẩm hoặc tìm theo tên, SKU..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all focus:bg-white"
              />
              <span className="absolute left-4 top-3.5 text-slate-400 text-lg">🔍</span>
            </div>

            {/* Results Dropdown with Checkboxes */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[160] max-h-[350px] overflow-y-auto p-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase border-b border-slate-50 mb-1">
                  {searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : "Tất cả sản phẩm"} ({filteredProducts.length})
                </div>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map(item => {
                    const isSelected = selectedItems.some(si => si.productId === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item.id)}
                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group ${isSelected ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-50'}`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 group-hover:border-indigo-400'}`}>
                          {isSelected && <span className="text-white text-[10px]">✓</span>}
                        </div>
                        <img src={item.image} className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold truncate ${isSelected ? 'text-indigo-700' : 'text-slate-900'}`}>{item.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.sku} • Tồn: {item.stock}</p>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-black text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-100">ĐÃ CHỌN</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 italic text-sm">Không tìm thấy sản phẩm...</div>
                )}
              </div>
            )}
          </div>

          {/* Selected Items List */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex justify-between items-center">
              <span>Danh sách chờ nhập ({selectedItems.length})</span>
              {selectedItems.length > 0 && (
                <button type="button" onClick={() => setSelectedItems([])} className="text-rose-500 hover:underline hover:font-bold transition-all">Xóa tất cả</button>
              )}
            </h4>

            {selectedItems.length > 0 ? (
              <div className="space-y-3">
                {selectedItems.map(item => {
                  const product = inventory.find(p => p.id === item.productId);
                  if (!product) return null;
                  return (
                    <div key={item.productId} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl animate-in slide-in-from-left-2 transition-all">
                      <img src={product.image} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{product.name}</p>
                        <p className="text-[10px] font-bold text-indigo-600 uppercase mt-0.5">{product.sku}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-bold">Tồn: {product.stock}</span>
                          <span className="text-[10px] text-emerald-600 font-black">➔ Sau nhập: {product.stock + item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                          <button 
                            type="button" 
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            className="px-3 py-2 hover:bg-slate-50 text-slate-500 font-black border-r border-slate-100"
                          >-</button>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            className="w-14 text-center text-base font-bold text-slate-900 focus:outline-none bg-white"
                          />
                          <button 
                            type="button" 
                            onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            className="px-3 py-2 hover:bg-slate-50 text-slate-500 font-black border-l border-slate-100"
                          >+</button>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveItem(item.productId)}
                          className="w-9 h-9 flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <span className="text-4xl mb-3 opacity-30">📦</span>
                <p className="text-slate-400 font-bold text-sm">Chưa chọn sản phẩm nào từ danh sách trên</p>
              </div>
            )}
          </div>

          {/* Overall Note */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ghi chú phiếu nhập</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[80px] resize-none focus:bg-white"
              placeholder="VD: Nhập hàng bổ sung từ NCC..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Mã hàng chọn</p>
              <p className="text-xl font-black text-slate-900">{selectedItems.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tổng số lượng</p>
              <p className="text-xl font-black text-slate-900">{totalQuantity}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-all active:scale-95"
            >
              Hủy bỏ
            </button>
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={selectedItems.length === 0}
              className={`flex-[2] py-4 rounded-2xl font-black text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${selectedItems.length === 0 ? 'bg-slate-300 text-white cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'}`}
            >
              Lưu phiếu nhập {selectedItems.length > 0 && `(${selectedItems.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateImportModal;
