import React, { useEffect, useState } from 'react';
import {
  PackagePlus,
  Save,
  X,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { Product, ProductCategory } from '../types';

export const CreateProductModal: React.FC = () => {
  const {
    isCreateProductModalOpen,
    setIsCreateProductModalOpen,
    editingProduct,
    setEditingProduct,
    addProduct,
    updateProduct,
    products,
  } = useWarehouse();

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Mực in');
  const [unit, setUnit] = useState('Hộp');
  const [costPrice, setCostPrice] = useState<number>(150000);
  const [sellingPrice, setSellingPrice] = useState<number>(250000);
  const [stockQuantity, setStockQuantity] = useState<number>(20);
  const [minStockAlert, setMinStockAlert] = useState<number>(10);
  const [warehouseLocation, setWarehouseLocation] = useState('Kệ A1-01');
  const [compatibleModels, setCompatibleModels] = useState('');
  const [notes, setNotes] = useState('');

  // Auto populate on edit
  useEffect(() => {
    if (editingProduct) {
      setSku(editingProduct.sku);
      setName(editingProduct.name);
      setCategory(editingProduct.category);
      setUnit(editingProduct.unit);
      setCostPrice(editingProduct.costPrice);
      setSellingPrice(editingProduct.sellingPrice);
      setStockQuantity(editingProduct.stockQuantity);
      setMinStockAlert(editingProduct.minStockAlert);
      setWarehouseLocation(editingProduct.warehouseLocation);
      setCompatibleModels(editingProduct.compatibleModels || '');
      setNotes(editingProduct.notes || '');
    } else {
      // Defaults for new product
      setSku(`SP-${Date.now().toString().slice(-4)}`);
      setName('');
      setCategory('Mực in');
      setUnit('Hộp');
      setCostPrice(150000);
      setSellingPrice(250000);
      setStockQuantity(20);
      setMinStockAlert(10);
      setWarehouseLocation('Kệ A1-01');
      setCompatibleModels('');
      setNotes('');
    }
  }, [editingProduct, isCreateProductModalOpen]);

  if (!isCreateProductModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sku.trim()) {
      alert('Vui lòng nhập đầy đủ Mã SKU và Tên sản phẩm');
      return;
    }

    const nums = [costPrice, sellingPrice, stockQuantity, minStockAlert].map(Number);
    if (nums.some((n) => !Number.isFinite(n) || n < 0)) {
      alert('Giá vốn, giá bán, tồn kho và tồn tối thiểu phải là số không âm.');
      return;
    }
    const skuUpper = sku.trim().toUpperCase();
    if (products.some((p) => p.sku.toUpperCase() === skuUpper && p.id !== editingProduct?.id)) {
      alert(`Mã SKU "${skuUpper}" đã tồn tại. Vui lòng dùng mã khác.`);
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        unit,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity),
        minStockAlert: Number(minStockAlert),
        warehouseLocation: warehouseLocation.trim(),
        compatibleModels: compatibleModels.trim(),
        notes: notes.trim(),
      });
    } else {
      addProduct({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        category,
        unit,
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        stockQuantity: Number(stockQuantity),
        minStockAlert: Number(minStockAlert),
        warehouseLocation: warehouseLocation.trim(),
        compatibleModels: compatibleModels.trim(),
        notes: notes.trim(),
      });
    }

    setIsCreateProductModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackagePlus className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs">
              {editingProduct ? 'Sửa Thông Tin Sản Phẩm' : 'Thêm Mới Mặt Hàng Vào Danh Mục'}
            </span>
          </div>
          <button
            onClick={() => {
              setIsCreateProductModalOpen(false);
              setEditingProduct(null);
            }}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-4 space-y-4 text-xs">
          {/* Row 1: Category & SKU */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Nhóm Hàng Hoá <span className="text-rose-500">*</span>:
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as ProductCategory;
                  setCategory(cat);
                  if (cat === 'Mực in') setUnit('Hộp');
                  else if (cat === 'Hộp mực đổ') setUnit('Chai');
                  else setUnit('Cái');
                }}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-medium"
              >
                <option value="Mực in">Mực in (Cartridge)</option>
                <option value="Hộp mực đổ">Hộp mực đổ (Mực nạp)</option>
                <option value="Linh kiện máy in máy tính">Linh kiện máy in máy tính</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold">
                  Mã Hàng (SKU) <span className="text-rose-500">*</span>:
                </label>
                <div className="flex items-center gap-1 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setSku('HM-')}
                    className="px-1 py-0.2 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                    title="Tiền tố Hộp Mực"
                  >
                    HM-
                  </button>
                  <button
                    type="button"
                    onClick={() => setSku('MD-')}
                    className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    title="Tiền tố Mực Đổ"
                  >
                    MD-
                  </button>
                  <button
                    type="button"
                    onClick={() => setSku('LK-')}
                    className="px-1 py-0.2 rounded bg-amber-100 text-amber-800 hover:bg-amber-200"
                    title="Tiền tố Linh Kiện"
                  >
                    LK-
                  </button>
                </div>
              </div>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="VD: HM-2900, MD-LASER, LK-BAC-2900..."
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono uppercase font-semibold focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Đơn Vị Tính <span className="text-rose-500">*</span>:
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
              >
                <option value="Hộp">Hộp</option>
                <option value="Chai">Chai</option>
                <option value="Cây">Cây (Trống, Trục)</option>
                <option value="Cái">Cái</option>
                <option value="Chiếc">Chiếc</option>
                <option value="Bộ">Bộ</option>
                <option value="Túi">Túi</option>
                <option value="Gói">Gói</option>
                <option value="Thanh">Thanh (RAM)</option>
                <option value="Sợi">Sợi (Dây cáp)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Product Name */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              Tên Sản Phẩm / Hàng Hoá <span className="text-rose-500">*</span>:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Hộp mực máy in Canon 2900 / Cartridge EP-303..."
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 text-slate-900"
            />
          </div>

          {/* Row 3: Pricing & Initial Stock */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
            <div>
              <label className="block text-slate-600 mb-1">Giá Vốn (đ):</label>
              <input
                type="number"
                min="0"
                step="any"
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-mono focus:outline-blue-500 text-right"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Giá Xuất / Bán (đ):</label>
              <input
                type="number"
                min="0"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-mono font-semibold text-blue-700 focus:outline-blue-500 text-right"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tồn Kho Thời Gian Thực:
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full bg-white border border-blue-400 rounded px-2 py-1.5 font-mono font-bold text-emerald-700 focus:outline-blue-500 text-right"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">Tồn Tối Thiểu (Báo động):</label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 font-mono focus:outline-blue-500 text-right"
              />
            </div>
          </div>

          {/* Row 4: Compatible Models & Warehouse Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">
                Dòng Máy In / Thiết Bị Tương Thích:
              </label>
              <input
                type="text"
                value={compatibleModels}
                onChange={(e) => setCompatibleModels(e.target.value)}
                placeholder="VD: Canon LBP 2900, 3000 / HP LaserJet 1020, P1102..."
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1">Vị Trí Kệ Kho:</label>
              <input
                type="text"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                placeholder="VD: Kệ A1-02, Hàng 3..."
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-slate-700 mb-1">Ghi Chú Kỹ Thuật / Bảo Hành:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Phôi mạ Mitsu, độ bền 3 chu kỳ nạp mực, bảo hành chính hãng..."
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsCreateProductModalOpen(false);
                setEditingProduct(null);
              }}
              className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{editingProduct ? 'Lưu Thay Đổi' : 'Lưu Sản Phẩm Mới'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
