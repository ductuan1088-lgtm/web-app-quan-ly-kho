import React, { useEffect, useState } from 'react';
import {
  Ban,
  Calendar,
  Package,
  Plus,
  Printer,
  Save,
  Search,
  Trash2,
} from 'lucide-react';
import { useWarehouse } from '../context/WarehouseContext';
import { StockIssueItem, StockIssueOrder } from '../types';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { HOSPITAL_DEPARTMENTS } from './CustomersModal';

export const CreateIssueOrderModal: React.FC = () => {
  const {
    products,
    customers,
    warehouses,
    createIssueOrder,
    updateIssueOrder,
    editingIssueOrder,
    setEditingIssueOrder,
    setSubTabXuattKho,
    setSelectedVoucherForPrint,
    companyInfo,
    currentUser,
    issueOrderCreators,
    defaultIssueCreator,
    setIsVoucherSignatoriesModalOpen,
    hasPermission,
    getAvailableStock,
    devices,
  } = useWarehouse();

  // Form states
  const [code, setCode] = useState('');
  const [date, setDate] = useState('');
  
  // 3 Key Recipient fields according to Customer Directory:
  // 1. Tên người nhận, 2. Tên khoa phòng, 3. Số điện thoại
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [departmentName, setDepartmentName] = useState('Ban Giám đốc');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isCustomRecipient, setIsCustomRecipient] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [warehouseName, setWarehouseName] = useState('Kho IT - Thiết Bị Tin Học & Mực In');
  const [reason, setReason] = useState('Xuất cấp phát vật tư mực in & linh kiện máy tính');
  const [createdBy, setCreatedBy] = useState(defaultIssueCreator || currentUser?.name || 'Nguyễn Tuấn');
  const [paymentStatus, setPaymentStatus] = useState<
    'Đã thanh toán' | 'Chưa thanh toán' | 'Ghi công nợ'
  >('Đã thanh toán');
  const [notes, setNotes] = useState('');
  const [deviceId, setDeviceId] = useState('');


  // Items table
  const [items, setItems] = useState<StockIssueItem[]>([]);

  // Search product dropdown inside row
  const [productSearchTerm, setProductSearchTerm] = useState('');

  // Initialize or load edit data
  useEffect(() => {
    if (editingIssueOrder) {
      setCode(editingIssueOrder.code);
      setDate(editingIssueOrder.date);
      setWarehouseName(editingIssueOrder.warehouseName || 'Kho IT - Thiết Bị Tin Học & Mực In');
      setReason(editingIssueOrder.reason || 'Xuất cấp phát vật tư mực in & linh kiện máy tính');
      setCreatedBy(editingIssueOrder.createdBy || 'Nguyễn Văn Tuấn');
      
      const recName = editingIssueOrder.receiverName || editingIssueOrder.customerName || '';
      setReceiverName(recName);
      setCustomerName(recName);
      
      const dept = editingIssueOrder.customerAddress || 'Ban Giám đốc';
      setDepartmentName(dept);
      setCustomerAddress(dept);
      setCustomerPhone(editingIssueOrder.customerPhone || '');
      
      const found = customers.find(
        (c) => c.id === editingIssueOrder.customerId || c.name.toLowerCase() === recName.toLowerCase()
      );
      if (found) {
        setSelectedCustomerId(found.id);
        setIsCustomRecipient(false);
      } else {
        setSelectedCustomerId('CUSTOM');
        setIsCustomRecipient(true);
      }

      setPaymentStatus(editingIssueOrder.paymentStatus as any);
      setNotes(editingIssueOrder.notes || '');
      setDeviceId(editingIssueOrder.deviceId || '');
      setItems(editingIssueOrder.items);
    } else {
      // Auto generate code PXK-YYYYMMDD-XXXX
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const randNum = String(Math.floor(1000 + Math.random() * 9000));
      const autoCode = `PXK-${dateStr.replace(/-/g, '')}-${randNum}`;

      setCode(autoCode);
      setDate(dateStr);
      setWarehouseName('Kho IT - Thiết Bị Tin Học & Mực In');
      setReason('Xuất cấp phát vật tư mực in & linh kiện máy tính');
      setCreatedBy(defaultIssueCreator || currentUser?.name || 'Nguyễn Tuấn');
      setPaymentStatus('Đã thanh toán');
      setNotes('');
      setDeviceId('');

      if (customers.length > 0) {
        const firstCust = customers[0];
        setSelectedCustomerId(firstCust.id);
        setReceiverName(firstCust.name);
        setCustomerName(firstCust.name);
        const dept = firstCust.group || firstCust.address || 'Ban Giám đốc';
        setDepartmentName(dept);
        setCustomerAddress(dept);
        setCustomerPhone(firstCust.phone || '');
        setIsCustomRecipient(false);
      } else {
        setSelectedCustomerId('CUSTOM');
        setReceiverName('');
        setDepartmentName('Khoa Khám bệnh');
        setCustomerAddress('Khoa Khám bệnh');
        setCustomerPhone('');
        setIsCustomRecipient(true);
      }

      // Add 1 default empty item row
      if (products.length > 0) {
        const firstProd = products[0];
        setItems([
          {
            id: 'item-' + Date.now(),
            productId: firstProd.id,
            sku: firstProd.sku,
            name: firstProd.name,
            unit: firstProd.unit,
            quantity: 1,
            unitPrice: firstProd.sellingPrice,
            discountPercent: 0,
            totalPrice: firstProd.sellingPrice,
            stockAvailableBefore: firstProd.stockQuantity,
          },
        ]);
      }
    }
  }, [editingIssueOrder]);

  const handleCustomerChange = (custId: string) => {
    setSelectedCustomerId(custId);
    if (custId === 'CUSTOM') {
      setIsCustomRecipient(true);
      return;
    }
    const found = customers.find((c) => c.id === custId);
    if (found) {
      setIsCustomRecipient(false);
      setReceiverName(found.name);
      setCustomerName(found.name);
      const dept = found.group || found.address || 'Khoa Khám bệnh';
      setDepartmentName(dept);
      setCustomerAddress(dept);
      setCustomerPhone(found.phone || '');
    }
  };

  // Add Item Row
  const handleAddItem = (productId?: string) => {
    const targetProd = productId ? products.find((p) => p.id === productId) : products[0];
    if (!targetProd) return;

    const newItem: StockIssueItem = {
      id: 'item-' + Date.now() + Math.random().toString().slice(2, 5),
      productId: targetProd.id,
      sku: targetProd.sku,
      name: targetProd.name,
      unit: targetProd.unit,
      quantity: 1,
      unitPrice: targetProd.sellingPrice,
      discountPercent: 0,
      totalPrice: targetProd.sellingPrice,
      stockAvailableBefore: targetProd.stockQuantity,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (items.length <= 1) {
      alert('Phiếu xuất kho phải có ít nhất 1 dòng hàng hóa!');
      return;
    }
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleItemProductChange = (itemId: string, newProductId: string) => {
    const prod = products.find((p) => p.id === newProductId);
    if (!prod) return;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const qty = it.quantity || 1;
          const price = prod.sellingPrice;
          const disc = it.discountPercent || 0;
          const total = qty * price * (1 - disc / 100);
          return {
            ...it,
            productId: prod.id,
            sku: prod.sku,
            name: prod.name,
            unit: prod.unit,
            unitPrice: price,
            stockAvailableBefore: prod.stockQuantity,
            totalPrice: total,
          };
        }
        return it;
      })
    );
  };

  const handleItemFieldChange = (
    itemId: string,
    field: 'quantity' | 'unitPrice' | 'discountPercent',
    value: number
  ) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          const updated = { ...it, [field]: value };
          const qty = field === 'quantity' ? value : updated.quantity;
          const price = field === 'unitPrice' ? value : updated.unitPrice;
          const disc = field === 'discountPercent' ? value : updated.discountPercent;
          updated.totalPrice = Math.round(qty * price * (1 - disc / 100));
          return updated;
        }
        return it;
      })
    );
  };

  // Calculations
  const totalQuantity = items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  const subtotalAmount = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0
  );
  const finalAmount = items.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0);
  const discountAmount = Math.max(0, subtotalAmount - finalAmount);

  // Kiểm tra tồn kho: gộp số lượng theo mặt hàng (nhiều dòng cùng mã), cộng lại số đã xuất khi đang sửa phiếu
  const requestedByProduct = new Map<string, number>();
  items.forEach((it) =>
    requestedByProduct.set(it.productId, (requestedByProduct.get(it.productId) || 0) + (Number(it.quantity) || 0))
  );
  const availableOf = (productId: string) => getAvailableStock(productId, editingIssueOrder?.id);
  const isProductDeficit = (productId: string) =>
    (requestedByProduct.get(productId) || 0) > availableOf(productId);
  const hasStockDeficit = Array.from(requestedByProduct.keys()).some(isProductDeficit);

  // Hết hàng (tồn = 0) hoặc thiếu hàng: chặn cứng, không cho lưu
  const isHardBlocked = hasStockDeficit;
  const canSave = !isHardBlocked;

  const departmentDevices = devices.filter(
    (d) => d.status !== 'Đã thanh lý' && (d.department === departmentName || d.id === deviceId)
  );

  const handleSaveOrder = (andPrint: boolean = false) => {
    const selectedDevice = devices.find((d) => d.id === deviceId);
    if (!customerName.trim()) {
      alert('Vui lòng nhập tên khách hàng / đơn vị nhận');
      return;
    }
    if (items.length === 0) {
      alert('Vui lòng chọn ít nhất 1 mặt hàng để xuất kho');
      return;
    }
    for (const it of items) {
      if (it.quantity <= 0) {
        alert(`Số lượng xuất của mặt hàng "${it.name}" phải lớn hơn 0`);
        return;
      }
    }

    if (isHardBlocked) {
      alert(
        'KHÔNG THỂ LƯU: Có mặt hàng vượt tồn kho (hoặc tồn = 0). Vui lòng giảm số lượng hoặc nhập thêm hàng.'
      );
      return;
    }

    const orderPayload = {
      code,
      date,
      customerId: isCustomRecipient ? 'cust-custom' : (selectedCustomerId || 'cust-custom'),
      customerName: receiverName.trim() || departmentName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: departmentName.trim(), // Tên khoa phòng
      warehouseName,
      reason: reason.trim(),
      createdBy: createdBy.trim(),
      receiverName: receiverName.trim() || customerName.trim(),
      items,
      totalQuantity,
      subtotalAmount,
      discountAmount,
      taxAmount: 0,
      finalAmount,
      paymentStatus,
      paidAmount: paymentStatus === 'Đã thanh toán' ? finalAmount : 0,
      status: 'Đã xuất kho' as const,
      notes: notes.trim(),
      deviceId: selectedDevice?.id,
      deviceName: selectedDevice?.name,
      deviceSerial: selectedDevice?.serialNumber,
    };

    let savedOrder: StockIssueOrder;
    try {
      if (editingIssueOrder) {
        updateIssueOrder(editingIssueOrder.id, orderPayload);
        savedOrder = { ...editingIssueOrder, ...orderPayload };
      } else {
        savedOrder = createIssueOrder(orderPayload);
      }
    } catch (err) {
      alert((err as Error).message);
      return;
    }

    if (andPrint) {
      setSelectedVoucherForPrint(savedOrder);
    }

    setEditingIssueOrder(null);
    setSubTabXuattKho('DANH_SACH');
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-hidden">
      {/* Top action bar */}
      <div className="bg-slate-200 border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 uppercase tracking-wide">
            {editingIssueOrder ? `Sửa Phiếu Xuất Kho: ${editingIssueOrder.code}` : 'Lập Phiếu Xuất Kho Mới'}
          </span>
          <span className="text-slate-500">
            (Hệ thống tự động trừ tồn kho theo thời gian thực)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingIssueOrder(null);
              setSubTabXuattKho('DANH_SACH');
            }}
            className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white transition"
          >
            Đóng / Trở Về
          </button>
          <button
            onClick={() => handleSaveOrder(false)}
            disabled={!canSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu Phiếu Xuất</span>
          </button>
          <button
            onClick={() => handleSaveOrder(true)}
            disabled={!canSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Lưu & In Ngay</span>
          </button>
        </div>
      </div>

      {/* Cảnh báo / phê duyệt xuất âm */}
      {isHardBlocked && (
        <div className="bg-rose-50 border-b border-rose-300 px-4 py-2 text-xs text-rose-800 flex items-start gap-2">
          <Ban className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <strong>Không thể lưu phiếu:</strong> có mặt hàng vượt tồn kho hoặc hết hàng (tồn = 0). Hãy giảm số lượng
            hoặc nhập thêm hàng.
          </div>
        </div>
      )}

      {/* Main form body */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Section 1: Voucher Metadata */}
        <div className="bg-white p-4 rounded border border-slate-300 shadow-2xs text-xs">
          <div className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Thông Tin Chứng Từ Xuất Kho</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Số Chứng Từ (PXK):</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 font-mono font-bold text-blue-700"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Ngày Chứng Từ:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono focus:outline-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1 font-medium">Kho Xuất Hàng:</label>
              <select
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-medium"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-600 font-medium">Người Lập Phiếu:</label>
                <button
                  type="button"
                  onClick={() => setIsVoucherSignatoriesModalOpen(true)}
                  className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  title="Cài đặt danh sách người lập phiếu và người nhận hàng"
                >
                  ⚙ Cài đặt ({issueOrderCreators.length})
                </button>
              </div>
              <input
                type="text"
                list="creators-datalist"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-medium"
                placeholder="Chọn hoặc nhập tên người lập phiếu..."
              />
              <datalist id="creators-datalist">
                {issueOrderCreators.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Customer / Recipient selection row: Exactly 3 fields as requested: Tên người nhận, Tên khoa phòng, Số điện thoại */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 pt-3 border-t border-slate-100">
            {/* Field 1: Tên Người Nhận */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-700 font-semibold flex items-center gap-1">
                  <span>Tên Người Nhận:</span>
                  <span className="text-red-500">*</span>
                </label>
                {isCustomRecipient ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomRecipient(false);
                      if (customers.length > 0) handleCustomerChange(customers[0].id);
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Chọn từ danh mục ({customers.length})
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomRecipient(true);
                      setSelectedCustomerId('CUSTOM');
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Nhập tên khác
                  </button>
                )}
              </div>

              {!isCustomRecipient ? (
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-semibold text-slate-900 text-xs shadow-2xs cursor-pointer"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => {
                    setReceiverName(e.target.value);
                    setCustomerName(e.target.value);
                  }}
                  placeholder="Nhập họ và tên người nhận hàng..."
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-semibold text-slate-900 text-xs shadow-2xs"
                  autoFocus
                />
              )}
            </div>

            {/* Field 2: Tên Khoa Phòng */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Tên Khoa Phòng: <span className="text-red-500">*</span>
              </label>
              <select
                value={departmentName}
                onChange={(e) => {
                  setDepartmentName(e.target.value);
                  setCustomerAddress(e.target.value);
                }}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-medium text-slate-900 text-xs shadow-2xs cursor-pointer"
              >
                {HOSPITAL_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Field 3: Số Điện Thoại */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Số Điện Thoại:
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="VD: 0912450553"
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono text-xs focus:outline-blue-500 shadow-2xs"
              />
            </div>
          </div>


          <div className="mt-3">
            <label className="block text-slate-600 mb-1 font-medium">
              Thiết Bị Nhận Vật Tư (Serial / Model máy):
            </label>
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 text-xs"
            >
              <option value="">— Không gắn thiết bị —</option>
              {departmentDevices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.code} · {d.name} · S/N {d.serialNumber}
                </option>
              ))}
            </select>
            {departmentDevices.length === 0 && (
              <div className="text-[11px] text-slate-400 mt-1">Chưa có thiết bị nào đăng ký cho khoa phòng này.</div>
            )}
          </div>

          <div className="mt-3">
            <label className="block text-slate-600 mb-1 font-medium">Lý Do Xuất Kho:</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Xuất cấp phát mực in, linh kiện máy tính cho khoa phòng khám chữa bệnh..."
              className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 text-xs"
            />
          </div>
        </div>

        {/* Section 2: Items Grid */}
        <div className="bg-white rounded border border-slate-300 shadow-2xs overflow-hidden text-xs">
          <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-slate-800">
                Chi Tiết Hàng Hóa Xuất Kho ({items.length} mặt hàng)
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleAddItem()}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Dòng Hàng Hóa</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold text-[11px]">
                <tr>
                  <th className="py-2 px-3 w-8 text-center">STT</th>
                  <th className="py-2 px-3 min-w-[280px]">Mặt Hàng (Mực in / Đổ / Linh kiện)</th>
                  <th className="py-2 px-3 text-center w-20">ĐVT</th>
                  <th className="py-2 px-3 text-right w-24">Tồn Kho Hiện Tại</th>
                  <th className="py-2 px-3 text-right w-24">Số Lượng Xuất</th>
                  <th className="py-2 px-3 text-right w-28">Đơn Giá Xuất</th>
                  <th className="py-2 px-3 text-right w-20">CK (%)</th>
                  <th className="py-2 px-3 text-right w-32">Thành Tiền (đ)</th>
                  <th className="py-2 px-3 text-center w-12">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((it, idx) => {
                  const currentProd = products.find((p) => p.id === it.productId);
                  const effectiveStock = availableOf(it.productId);
                  const isExceeding = isProductDeficit(it.productId);

                  return (
                    <tr key={it.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3">
                        <select
                          value={it.productId}
                          onChange={(e) => handleItemProductChange(it.id, e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-blue-500 font-medium text-slate-800"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              [{p.sku}] - {p.name} (Tồn: {getAvailableStock(p.id, editingIssueOrder?.id)} {p.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600 font-medium">
                        {it.unit}
                      </td>
                      {/* Live Stock display */}
                      <td className="py-2 px-3 text-right font-mono text-slate-700 font-bold bg-slate-50">
                        {formatNumber(effectiveStock)}
                      </td>
                      {/* Quantity input */}
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="1"
                          required
                          value={it.quantity}
                          onChange={(e) =>
                            handleItemFieldChange(it.id, 'quantity', Number(e.target.value))
                          }
                          className={`w-20 text-right font-mono font-bold px-2 py-1 border rounded focus:outline-blue-500 ${
                            isExceeding
                              ? 'border-rose-500 text-rose-700 bg-rose-50'
                              : 'border-slate-300 text-slate-900 bg-white'
                          }`}
                        />
                        {isExceeding && (
                          <div className="text-[10px] text-rose-600 font-medium mt-0.5 whitespace-nowrap">
                            {effectiveStock <= 0 ? 'Hết hàng (tồn 0)' : `Vượt tồn (${effectiveStock})`}
                          </div>
                        )}
                      </td>
                      {/* Unit price */}
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={it.unitPrice}
                          onChange={(e) =>
                            handleItemFieldChange(it.id, 'unitPrice', Number(e.target.value))
                          }
                          className="w-24 text-right font-mono px-2 py-1 border border-slate-300 rounded focus:outline-blue-500"
                        />
                      </td>
                      {/* Discount % */}
                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={it.discountPercent}
                          onChange={(e) =>
                            handleItemFieldChange(
                              it.id,
                              'discountPercent',
                              Number(e.target.value)
                            )
                          }
                          className="w-16 text-right font-mono px-2 py-1 border border-slate-300 rounded focus:outline-blue-500"
                        />
                      </td>
                      {/* Total line price */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(it.totalPrice)}
                      </td>
                      {/* Remove action */}
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Xóa dòng này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Add By Category Buttons */}
          <div className="bg-slate-50 p-2.5 border-t border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-slate-500 text-[11px] font-medium mr-1">Thêm nhanh mẫu:</span>
            {products.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAddItem(p.id)}
                className="px-2 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 rounded text-[11px] transition"
              >
                + [{p.sku}] {p.name.slice(0, 24)}...
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Bottom Payment & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border border-slate-300 shadow-2xs text-xs space-y-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Phương Thức Thanh Toán / Công Nợ:
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:outline-blue-500 font-medium"
              >
                <option value="Đã thanh toán">Đã thanh toán (Tiền mặt / Chuyển khoản ngay)</option>
                <option value="Ghi công nợ">Ghi công nợ (Tự động cộng nợ vào khách hàng)</option>
                <option value="Chưa thanh toán">Chưa thanh toán (Chờ thanh toán khi giao)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Ghi Chú Chứng Từ:</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú điều kiện giao nhận hàng, xuất hóa đơn VAT điện tử..."
                className="w-full bg-white border border-slate-300 rounded p-2 text-xs focus:outline-blue-500"
              />
            </div>
          </div>

          {/* Summary calculations */}
          <div className="bg-white p-4 rounded border border-slate-300 shadow-2xs text-xs flex flex-col justify-between">
            <div className="space-y-2 border-b border-slate-200 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Tổng số lượng hàng xuất:</span>
                <span className="font-mono font-bold text-slate-800">
                  {formatNumber(totalQuantity)} sản phẩm
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cộng tiền hàng (chưa trừ CK):</span>
                <span className="font-mono">{formatCurrency(subtotalAmount)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Tổng tiền chiết khấu giảm giá:</span>
                <span className="font-mono">-{formatCurrency(discountAmount)}</span>
              </div>
            </div>

            <div className="pt-3">
              <div className="flex justify-between items-baseline mb-3">
                <span className="font-bold text-sm text-slate-900">TỔNG CỘNG THANH TOÁN:</span>
                <span className="font-mono font-bold text-xl text-emerald-700">
                  {formatCurrency(finalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingIssueOrder(null);
                    setSubTabXuattKho('DANH_SACH');
                  }}
                  className="px-4 py-2 rounded border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveOrder(false)}
                  disabled={!canSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Lưu Phiếu Xuất
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveOrder(true)}
                  disabled={!canSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Printer className="w-4 h-4" />
                  <span>Lưu & In Ngay</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
