import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ActiveTab,
  AppUser,
  CompanyInfo,
  Customer,
  HistoryViewMode,
  HospitalDevice,
  IssueApprovalRequest,
  Product,
  ProductCategory,
  StockAuditOrder,
  StockCardRecord,
  StockIssueItem,
  StockIssueOrder,
  StockReceiptOrder,
  SubTabXuattKho,
  Supplier,
  UserPermissions,
  UserRole,
  Warehouse,
  WarrantyItem,
} from '../types';
import {
  INITIAL_APPROVAL_REQUESTS,
  INITIAL_AUDIT_ORDERS,
  INITIAL_COMPANY,
  INITIAL_CUSTOMERS,
  INITIAL_DEVICES,
  INITIAL_ISSUE_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_RECEIPT_ORDERS,
  INITIAL_SUPPLIERS,
  INITIAL_USERS,
  INITIAL_WAREHOUSES,
  INITIAL_WARRANTIES,
  ROLE_PRESET_PERMISSIONS,
} from '../data/initialData';

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface WarehouseContextType {
  products: Product[];
  issueOrders: StockIssueOrder[];
  receiptOrders: StockReceiptOrder[];
  customers: Customer[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  companyInfo: CompanyInfo;
  updateCompanyInfo: (updates: Partial<CompanyInfo>) => void;
  systemLogs: SystemLog[];

  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  subTabXuattKho: SubTabXuattKho;
  setSubTabXuattKho: (subTab: SubTabXuattKho) => void;
  historyViewMode: HistoryViewMode;
  setHistoryViewMode: (mode: HistoryViewMode) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;

  selectedVoucherForPrint: StockIssueOrder | null;
  setSelectedVoucherForPrint: (order: StockIssueOrder | null) => void;
  editingIssueOrder: StockIssueOrder | null;
  setEditingIssueOrder: (order: StockIssueOrder | null) => void;
  editingProduct: Product | null;
  setEditingProduct: (product: Product | null) => void;
  isCreateProductModalOpen: boolean;
  setIsCreateProductModalOpen: (open: boolean) => void;
  isCreateReceiptModalOpen: boolean;
  setIsCreateReceiptModalOpen: (open: boolean) => void;
  isBackupModalOpen: boolean;
  setIsBackupModalOpen: (open: boolean) => void;
  isCustomerModalOpen: boolean;
  setIsCustomerModalOpen: (open: boolean) => void;
  isSupplierModalOpen: boolean;
  setIsSupplierModalOpen: (open: boolean) => void;
  isKhoITSyncModalOpen: boolean;
  setIsKhoITSyncModalOpen: (open: boolean) => void;
  isUserManagementModalOpen: boolean;
  setIsUserManagementModalOpen: (open: boolean) => void;
  isSwitchUserModalOpen: boolean;
  setIsSwitchUserModalOpen: (open: boolean) => void;
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  isCompanySettingsModalOpen: boolean;
  setIsCompanySettingsModalOpen: (open: boolean) => void;
  isVoucherSignatoriesModalOpen: boolean;
  setIsVoucherSignatoriesModalOpen: (open: boolean) => void;

  issueOrderCreators: string[];
  defaultIssueCreator: string;
  addIssueOrderCreator: (name: string) => void;
  removeIssueOrderCreator: (name: string) => void;
  setDefaultIssueCreator: (name: string) => void;

  users: AppUser[];
  currentUser: AppUser;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => { success: boolean; message: string; user?: AppUser };
  logout: () => void;
  changePassword: (userId: string, newPassword: string) => { success: boolean; message: string };
  isChangePasswordModalOpen: boolean;
  setIsChangePasswordModalOpen: (open: boolean) => void;
  setCurrentUser: (user: AppUser) => void;
  addUser: (userData: Omit<AppUser, 'id'>) => AppUser;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  deleteUser: (id: string) => { success: boolean; message: string };
  switchUser: (userId: string) => boolean;
  hasPermission: (permissionKey: keyof UserPermissions) => boolean;

  addProduct: (product: Omit<Product, 'id' | 'updatedAt'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => { success: boolean; message: string };
  quickAdjustStock: (productId: string, newStock: number, reason: string) => void;

  createIssueOrder: (orderData: Omit<StockIssueOrder, 'id' | 'createdAt'>) => StockIssueOrder;
  updateIssueOrder: (id: string, updatedData: Partial<StockIssueOrder>) => void;
  deleteIssueOrder: (id: string) => void;
  getAvailableStock: (productId: string, editingOrderId?: string | null) => number;

  devices: HospitalDevice[];
  addDevice: (data: Omit<HospitalDevice, 'id'>) => HospitalDevice;
  updateDevice: (id: string, updates: Partial<HospitalDevice>) => void;
  deleteDevice: (id: string) => void;

  auditOrders: StockAuditOrder[];
  createAuditOrder: (data: Omit<StockAuditOrder, 'id' | 'createdAt'>) => StockAuditOrder;
  balanceAuditOrder: (id: string) => { success: boolean; message: string };
  deleteAuditOrder: (id: string) => void;

  approvalRequests: IssueApprovalRequest[];
  createApprovalRequest: (
    data: Omit<IssueApprovalRequest, 'id' | 'code' | 'createdAt' | 'status'>
  ) => IssueApprovalRequest;
  reviewApprovalRequest: (id: string, approve: boolean, notes: string) => { success: boolean; message: string };
  convertApprovalToIssue: (id: string) => { success: boolean; message: string };

  warranties: WarrantyItem[];
  addWarranty: (data: Omit<WarrantyItem, 'id'>) => WarrantyItem;
  updateWarranty: (id: string, updates: Partial<WarrantyItem>) => void;
  deleteWarranty: (id: string) => void;

  createReceiptOrder: (receiptData: Omit<StockReceiptOrder, 'id' | 'createdAt'>) => StockReceiptOrder;
  deleteReceiptOrder: (id: string) => void;

  addCustomer: (cust: Omit<Customer, 'id' | 'code'> & { code?: string }) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  resetCustomersToDefault: () => void;

  addSupplier: (supp: Omit<Supplier, 'id' | 'code'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => { success: boolean; message: string };

  exportBackupJson: () => string;
  importBackupJson: (jsonData: string) => boolean;
  resetToDefaultData: () => void;

  getProductStockLedger: (productId: string) => StockCardRecord[];
  getOverallStats: () => {
    totalProducts: number;
    totalStockCount: number;
    totalStockValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalIssueOrders: number;
    totalIssueRevenue: number;
  };
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'wms_vietphat_products_v2',
  ISSUE_ORDERS: 'wms_vietphat_issue_orders_v2',
  RECEIPT_ORDERS: 'wms_vietphat_receipt_orders_v2',
  CUSTOMERS: 'wms_vpmed_customers_208_v4',
  SUPPLIERS: 'wms_vietphat_suppliers_v2',
  WAREHOUSES: 'wms_vietphat_warehouses_v2',
  COMPANY: 'wms_vietphat_company_v2',
  LOGS: 'wms_vietphat_logs_v2',
  USERS: 'wms_vpmed_users_v2',
  CURRENT_USER_ID: 'wms_vpmed_current_user_id_v2',
  IS_AUTHENTICATED: 'wms_vpmed_is_authenticated_v2',
  CREATORS: 'wms_vpmed_creators_v1',
  DEFAULT_CREATOR: 'wms_vpmed_default_creator_v1',
  DEVICES: 'wms_vpmed_devices_v1',
  AUDITS: 'wms_vpmed_audits_v1',
  APPROVALS: 'wms_vpmed_approvals_v1',
  WARRANTIES: 'wms_vpmed_warranties_v1',
  SIDEBAR_COLLAPSED: 'wms_vpmed_sidebar_collapsed_v1',
};

const API_BASE_URL = `http://${window.location.hostname}:5000/api`;

function loadList<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [issueOrders, setIssueOrders] = useState<StockIssueOrder[]>(() => {
    try {
      const skuMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p.sku]));
      const saved = localStorage.getItem(STORAGE_KEYS.ISSUE_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].customerName?.includes('Nam Việt')) {
          let list = parsed;
          if (parsed.length < INITIAL_ISSUE_ORDERS.length) {
            const existingCodes = new Set(parsed.map((o: StockIssueOrder) => o.code));
            const newDefaults = INITIAL_ISSUE_ORDERS.filter((o) => !existingCodes.has(o.code));
            list = [...parsed, ...newDefaults];
          }
          return list.map((order: StockIssueOrder) => ({
            ...order,
            items: order.items.map((it) => {
              const newSku = skuMap.get(it.productId);
              return newSku ? { ...it, sku: newSku } : it;
            }),
          }));
        }
      }
      return INITIAL_ISSUE_ORDERS;
    } catch {
      return INITIAL_ISSUE_ORDERS;
    }
  });

  const [receiptOrders, setReceiptOrders] = useState<StockReceiptOrder[]>(() => {
    try {
      const skuMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p.sku]));
      const saved = localStorage.getItem(STORAGE_KEYS.RECEIPT_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INITIAL_RECEIPT_ORDERS.length) {
          return parsed.map((order: StockReceiptOrder) => ({
            ...order,
            items: order.items.map((it) => {
              const newSku = skuMap.get(it.productId);
              return newSku ? { ...it, sku: newSku } : it;
            }),
          }));
        }
      }
      return INITIAL_RECEIPT_ORDERS;
    } catch {
      return INITIAL_RECEIPT_ORDERS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
    } catch {
      return INITIAL_SUPPLIERS;
    }
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
      return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
    } catch {
      return INITIAL_WAREHOUSES;
    }
  });

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.name?.includes('VPMED')) {
          if (parsed.phone && parsed.phone.includes('0988.123.456')) {
            parsed.phone = parsed.phone.replace(/0988\.123\.456/g, '0982.558.699');
            localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
      return INITIAL_COMPANY;
    } catch {
      return INITIAL_COMPANY;
    }
  });

  const updateCompanyInfo = (updates: Partial<CompanyInfo>) => {
    setCompanyInfo((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save company info to storage', err);
      }
      return next;
    });
  };

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('QUAN_LY_XUAT_KHO');
  const [subTabXuattKho, setSubTabXuattKho] = useState<SubTabXuattKho>('DANH_SACH');
  const [historyViewMode, setHistoryViewMode] = useState<HistoryViewMode>('LINE_ITEMS');
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED) === '1';
    } catch {
      return false;
    }
  });
  const setIsSidebarCollapsed = (collapsed: boolean) => {
    setIsSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed ? '1' : '0');
    } catch {
      /* ignore */
    }
  };

  const [devices, setDevices] = useState<HospitalDevice[]>(() => loadList(STORAGE_KEYS.DEVICES, INITIAL_DEVICES));
  const [auditOrders, setAuditOrders] = useState<StockAuditOrder[]>(() =>
    loadList(STORAGE_KEYS.AUDITS, INITIAL_AUDIT_ORDERS)
  );
  const [approvalRequests, setApprovalRequests] = useState<IssueApprovalRequest[]>(() =>
    loadList(STORAGE_KEYS.APPROVALS, INITIAL_APPROVAL_REQUESTS)
  );
  const [warranties, setWarranties] = useState<WarrantyItem[]>(() =>
    loadList(STORAGE_KEYS.WARRANTIES, INITIAL_WARRANTIES)
  );

  const [selectedVoucherForPrint, setSelectedVoucherForPrint] = useState<StockIssueOrder | null>(null);
  const [editingIssueOrder, setEditingIssueOrder] = useState<StockIssueOrder | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
  const [isCreateReceiptModalOpen, setIsCreateReceiptModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isKhoITSyncModalOpen, setIsKhoITSyncModalOpen] = useState(false);
  const [isUserManagementModalOpen, setIsUserManagementModalOpen] = useState(false);
  const [isSwitchUserModalOpen, setIsSwitchUserModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isCompanySettingsModalOpen, setIsCompanySettingsModalOpen] = useState(false);
  const [isVoucherSignatoriesModalOpen, setIsVoucherSignatoriesModalOpen] = useState(false);

  const INITIAL_CREATORS = ['Nguyễn Tuấn', 'Nguyễn Văn Tuấn', 'Lê Hoàng Long', 'Vũ Văn Khoa'];
  const [issueOrderCreators, setIssueOrderCreators] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CREATORS);
      return saved ? JSON.parse(saved) : INITIAL_CREATORS;
    } catch {
      return INITIAL_CREATORS;
    }
  });

  const defaultIssueCreator = 'Nguyễn Tuấn';
  const setDefaultIssueCreator = () => {};

  const addIssueOrderCreator = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setIssueOrderCreators((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(next));
      return next;
    });
  };

  const removeIssueOrderCreator = (name: string) => {
    setIssueOrderCreators((prev) => {
      const next = prev.filter((n) => n !== name);
      try {
        localStorage.setItem(STORAGE_KEYS.CREATORS, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save creators', e);
      }
      return next;
    });
  };

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
      if (saved !== null) {
        return saved === 'true';
      }
      return true;
    } catch {
      return true;
    }
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((u: AppUser): AppUser => {
            const presetPerms =
              ROLE_PRESET_PERMISSIONS[u.role]?.permissions ||
              ROLE_PRESET_PERMISSIONS.STAFF_VIEWER.permissions;
            const mergedPerms =
              u.role === 'ADMIN'
                ? { ...ROLE_PRESET_PERMISSIONS.ADMIN.permissions }
                : { ...presetPerms, ...(u.permissions || {}) };

            if (u.id === 'user-ituan') {
              return {
                ...u,
                roleTitle: 'Nhân viên IT',
                role: 'ADMIN' as UserRole,
                password: u.password || '123',
                permissions: { ...ROLE_PRESET_PERMISSIONS.ADMIN.permissions },
              };
            }
            return {
              ...u,
              password: u.password || '123',
              permissions: mergedPerms,
            };
          });
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    try {
      const savedUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      const initialUsersList: AppUser[] = (() => {
        try {
          const s = localStorage.getItem(STORAGE_KEYS.USERS);
          if (s) {
            const p = JSON.parse(s);
            if (Array.isArray(p) && p.length > 0) {
              return p.map((u: AppUser): AppUser => {
                if (u.id === 'user-ituan') {
                  return { ...u, roleTitle: 'Nhân viên IT', role: 'ADMIN' as UserRole, password: u.password || '123' };
                }
                return u;
              });
            }
          }
        } catch { /* ignore */ }
        return INITIAL_USERS;
      })();
      if (savedUserId) {
        const found = initialUsersList.find((u: AppUser) => u.id === savedUserId);
        if (found) {
          if (found.id === 'user-ituan') {
            return { ...found, roleTitle: 'Nhân viên IT' };
          }
          return found;
        }
      }
      return initialUsersList[0] || INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ISSUE_ORDERS, JSON.stringify(issueOrders));
  }, [issueOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEIPT_ORDERS, JSON.stringify(receiptOrders));
  }, [receiptOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify(devices));
  }, [devices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(auditOrders));
  }, [auditOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPROVALS, JSON.stringify(approvalRequests));
  }, [approvalRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WARRANTIES, JSON.stringify(warranties));
  }, [warranties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(systemLogs.slice(0, 100)));
  }, [systemLogs]);

  // ĐỒNG BỘ THỜI GIAN THỰC TỪ SQLITE
  useEffect(() => {
    const fetchLatestFromDatabase = () => {
      fetch(`${API_BASE_URL}/products?t=${Date.now()}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((sqlProducts: any[]) => {
          if (Array.isArray(sqlProducts) && sqlProducts.length > 0) {
            const formatted: Product[] = sqlProducts.map((p, index) => {
              const stockQty = Number(p.stock_quantity) || 0;
              const cost = Number(p.cost_price) || 0;
              const minLim = Number(p.min_limit) || 2;
              return {
                id: p.sku || `prod-sql-${index}`,
                sku: p.sku,
                name: p.name,
                category: (p.category || 'Linh kiện máy in máy tính') as ProductCategory,
                unit: p.unit || 'Cái',
                stockQuantity: stockQty,
                minLimit: minLim,
                minStockAlert: minLim,
                costPrice: cost,
                sellingPrice: cost,
                location: 'Kho IT',
                status: stockQty > 0 ? 'in_stock' : 'out_of_stock',
                updatedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
              };
            });
            setProducts(formatted);
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(formatted));
          }
        })
        .catch(() => {});

      fetch(`${API_BASE_URL}/staff?t=${Date.now()}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((sqlStaff: any[]) => {
          if (Array.isArray(sqlStaff) && sqlStaff.length > 0) {
            const newStaffList: Customer[] = sqlStaff.map((s, index) => ({
              id: `staff-sql-${s.id || index}`,
              code: `NV-${String(s.id || index).padStart(3, '0')}`,
              name: s.full_name,
              group: s.department || 'Kho IT',
              phone: s.phone || '',
              address: s.department || '',
              debtAmount: 0,
            }));
            setCustomers(newStaffList);
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(newStaffList));
          }
        })
        .catch(() => {});
    };

    fetchLatestFromDatabase();
    window.addEventListener('focus', fetchLatestFromDatabase);
    const pollTimer = setInterval(fetchLatestFromDatabase, 4000);

    return () => {
      window.removeEventListener('focus', fetchLatestFromDatabase);
      clearInterval(pollTimer);
    };
  }, []);

  const addLog = (action: string, details: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newLog: SystemLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toLocaleString('vi-VN', { hour12: false }),
      action,
      details,
      type,
    };
    setSystemLogs((prev) => [newLog, ...prev]);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'updatedAt'>): Product => {
    const newId = productData.sku || 'prod-' + Date.now();
    const newProduct: Product = {
      ...productData,
      id: newId,
      updatedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addLog('Thêm sản phẩm', `Thêm mới mặt hàng: ${newProduct.sku} - ${newProduct.name}`, 'success');

    fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sku: newProduct.sku,
        name: newProduct.name,
        category: newProduct.category,
        unit: newProduct.unit,
        stock_quantity: newProduct.stockQuantity,
        cost_price: newProduct.costPrice,
        min_limit: newProduct.minLimit,
      }),
    }).catch(() => {});

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id || p.sku === id) {
          const updated = {
            ...p,
            ...updates,
            updatedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
          };

          fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sku: updated.sku,
              name: updated.name,
              category: updated.category,
              unit: updated.unit,
              stock_quantity: updated.stockQuantity,
              cost_price: updated.costPrice,
              min_limit: updated.minLimit,
            }),
          }).catch(() => {});

          return updated;
        }
        return p;
      })
    );
    addLog('Cập nhật sản phẩm', `Cập nhật thông tin mã hàng ID: ${id}`, 'info');
  };

  // HÀM XÓA SẢN PHẨM HOÀN CHỈNH: GỌI API XÓA VĨNH VIỄN TRONG SQLITE
  const deleteProduct = (id: string): { success: boolean; message: string } => {
    const productToDelete = products.find((p) => p.id === id || p.sku === id);
    if (!productToDelete) return { success: false, message: 'Không tìm thấy sản phẩm' };

    const targetSku = productToDelete.sku;

    // 1. Cập nhật tức thì danh sách giao diện
    setProducts((prev) => prev.filter((p) => p.id !== id && p.sku !== targetSku));
    addLog('Xóa sản phẩm', `Đã xóa mặt hàng: ${targetSku} - ${productToDelete.name}`, 'warning');

    // 2. Gửi lệnh xóa vĩnh viễn xuống SQLite cổng 5000
    fetch(`${API_BASE_URL}/products/${encodeURIComponent(targetSku)}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log(`-> SQLite đã xóa thành công mã: ${targetSku}`);
        }
      })
      .catch((err) => {
        console.error('Lỗi khi gửi yêu cầu xóa tới Backend SQLite:', err);
      });

    return { success: true, message: 'Đã xóa sản phẩm thành công' };
  };

  const quickAdjustStock = (productId: string, newStock: number, reason: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId || p.sku === productId) {
          const updatedStock = Math.max(0, newStock);

          fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sku: p.sku,
              name: p.name,
              category: p.category,
              unit: p.unit,
              stock_quantity: updatedStock,
              cost_price: p.costPrice,
              min_limit: p.minLimit,
            }),
          }).catch(() => {});

          return {
            ...p,
            stockQuantity: updatedStock,
            updatedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
          };
        }
        return p;
      })
    );
    const prod = products.find((p) => p.id === productId || p.sku === productId);
    addLog(
      'Điều chỉnh tồn kho',
      `Điều chỉnh kho cho ${prod?.sku || productId}: Tồn mới = ${newStock} (${reason})`,
      'info'
    );
  };

  const nowStr = () => new Date().toLocaleString('vi-VN', { hour12: false });

  const sumQtyByProduct = (items: { productId: string; quantity: number }[]) => {
    const map = new Map<string, number>();
    items.forEach((it) => map.set(it.productId, (map.get(it.productId) || 0) + (Number(it.quantity) || 0)));
    return map;
  };

  const getAvailableStock = (productId: string, editingOrderId?: string | null): number => {
    const prod = products.find((p) => p.id === productId || p.sku === productId);
    let available = prod?.stockQuantity || 0;
    if (editingOrderId) {
      const old = issueOrders.find((o) => o.id === editingOrderId);
      if (old) available += sumQtyByProduct(old.items).get(productId) || 0;
    }
    return available;
  };

  const createIssueOrder = (orderData: Omit<StockIssueOrder, 'id' | 'createdAt'>): StockIssueOrder => {
    const requested = sumQtyByProduct(orderData.items);
    const deficits: string[] = [];
    requested.forEach((qty, productId) => {
      const available = getAvailableStock(productId, null);
      if (qty > available) {
        const prod = products.find((p) => p.id === productId || p.sku === productId);
        deficits.push(`${prod?.name || prod?.sku || productId} (yêu cầu: ${qty}, tồn kho: ${available})`);
      }
    });

    if (deficits.length > 0) {
      throw new Error(`Kho không đủ hàng để xuất: ${deficits.join('; ')}! Vui lòng nhập thêm hàng.`);
    }

    const newOrder: StockIssueOrder = {
      ...orderData,
      id: 'issue-' + Date.now(),
      createdAt: nowStr(),
    };

    const qtyMap = sumQtyByProduct(orderData.items);
    setProducts((prev) =>
      prev.map((p) =>
        qtyMap.has(p.id) || (p.sku && qtyMap.has(p.sku))
          ? {
              ...p,
              stockQuantity: Math.max(0, p.stockQuantity - (qtyMap.get(p.id) || qtyMap.get(p.sku) || 0)),
              updatedAt: nowStr(),
            }
          : p
      )
    );

    if (orderData.paymentStatus === 'Ghi công nợ') {
      setCustomers((prev) =>
        prev.map((c) => (c.id === orderData.customerId ? { ...c, debtAmount: c.debtAmount + orderData.finalAmount } : c))
      );
    }

    setIssueOrders((prev) => [newOrder, ...prev]);
    addLog('Lập phiếu xuất kho', `Xuất kho số ${newOrder.code} cho ${newOrder.customerName} - Tổng tiền: ${newOrder.finalAmount.toLocaleString('vi-VN')} đ`, 'success');

    fetch(`${API_BASE_URL}/issue-voucher`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voucher_code: newOrder.code,
        voucher_type: 'XUAT',
        created_date: newOrder.date,
        staff_name: newOrder.receiverName || newOrder.customerName,
        department: newOrder.customerAddress || '',
        reason: newOrder.reason || '',
        created_by: newOrder.createdBy,
        total_amount: newOrder.finalAmount,
        items: newOrder.items.map((it) => ({
          sku: it.sku,
          quantity: it.quantity,
          unit_price: it.unitPrice,
          total_price: it.totalPrice,
        })),
      }),
    }).catch(() => {});

    return newOrder;
  };

  const updateIssueOrder = (id: string, updatedData: Partial<StockIssueOrder>) => {
    const existingOrder = issueOrders.find((o) => o.id === id);
    if (!existingOrder) return;

    if (updatedData.items) {
      const newQty = sumQtyByProduct(updatedData.items);
      const oldQty = sumQtyByProduct(existingOrder.items);
      setProducts((prev) =>
        prev.map((p) => {
          const oldVal = oldQty.get(p.id) || (p.sku ? oldQty.get(p.sku) : 0) || 0;
          const newVal = newQty.get(p.id) || (p.sku ? newQty.get(p.sku) : 0) || 0;
          if (oldVal === 0 && newVal === 0) return p;
          return {
            ...p,
            stockQuantity: p.stockQuantity + oldVal - newVal,
            updatedAt: nowStr(),
          };
        })
      );
    }

    setIssueOrders((prev) =>
      prev.map((o) => (o.id === id ? ({ ...o, ...updatedData } as StockIssueOrder) : o))
    );
    addLog('Sửa phiếu xuất kho', `Cập nhật chứng từ ${existingOrder.code}`, 'info');
  };

  const deleteIssueOrder = (id: string) => {
    const orderToDelete = issueOrders.find((o) => o.id === id);
    if (!orderToDelete) return;

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const qty = sumQtyByProduct(orderToDelete.items).get(p.id) || (p.sku ? sumQtyByProduct(orderToDelete.items).get(p.sku) : 0);
        return qty ? { ...p, stockQuantity: p.stockQuantity + qty, updatedAt: nowStr() } : p;
      })
    );

    if (orderToDelete.paymentStatus === 'Ghi công nợ') {
      setCustomers((prevCusts) =>
        prevCusts.map((c) =>
          c.id === orderToDelete.customerId
            ? { ...c, debtAmount: Math.max(0, c.debtAmount - orderToDelete.finalAmount) }
            : c
        )
      );
    }

    setIssueOrders((prev) => prev.filter((o) => o.id !== id));
    addLog(
      'Xóa chứng từ xuất kho',
      `Đã xóa phiếu ${orderToDelete.code} và hoàn lại tồn kho ${orderToDelete.totalQuantity} mặt hàng`,
      'warning'
    );
  };

  const createReceiptOrder = (receiptData: Omit<StockReceiptOrder, 'id' | 'createdAt'>): StockReceiptOrder => {
    const newId = 'rec-' + Date.now();
    const newReceipt: StockReceiptOrder = {
      ...receiptData,
      id: newId,
      createdAt: new Date().toLocaleString('vi-VN', { hour12: false }),
    };

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const item = receiptData.items.find((it) => it.productId === p.id || it.sku === p.sku);
        if (item) {
          const nextStock = p.stockQuantity + item.quantity;
          fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sku: p.sku,
              name: p.name,
              category: p.category,
              unit: p.unit,
              stock_quantity: nextStock,
              cost_price: item.unitCost || p.costPrice,
              min_limit: p.minLimit,
            }),
          }).catch(() => {});

          return {
            ...p,
            stockQuantity: nextStock,
            costPrice: item.unitCost || p.costPrice,
            updatedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
          };
        }
        return p;
      })
    );

    if (receiptData.paymentStatus === 'Ghi nợ NCC' && receiptData.supplierId) {
      setSuppliers((prevSupps) =>
        prevSupps.map((s) =>
          s.id === receiptData.supplierId
            ? { ...s, debtPayable: s.debtPayable + receiptData.totalCost }
            : s
        )
      );
    }

    setReceiptOrders((prev) => [newReceipt, ...prev]);
    addLog('Nhập kho hàng hóa', `Nhập kho ${newReceipt.code} từ ${newReceipt.supplierName} - Tổng ${newReceipt.totalQuantity} sản phẩm`, 'success');
    return newReceipt;
  };

  const deleteReceiptOrder = (id: string) => {
    const receiptToDelete = receiptOrders.find((r) => r.id === id);
    if (!receiptToDelete) return;

    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const item = receiptToDelete.items.find((it) => it.productId === p.id || it.sku === p.sku);
        if (item) {
          return {
            ...p,
            stockQuantity: Math.max(0, p.stockQuantity - item.quantity),
            updatedAt: new Date().toLocaleString('vi-VN', { hour12: false }),
          };
        }
        return p;
      })
    );

    if (receiptToDelete.paymentStatus === 'Ghi nợ NCC' && receiptToDelete.supplierId) {
      setSuppliers((prevSupps) =>
        prevSupps.map((s) =>
          s.id === receiptToDelete.supplierId
            ? { ...s, debtPayable: Math.max(0, s.debtPayable - receiptToDelete.totalCost) }
            : s
        )
      );
    }

    setReceiptOrders((prev) => prev.filter((r) => r.id !== id));
    addLog('Xóa phiếu nhập kho', `Xóa chứng từ nhập ${receiptToDelete.code}`, 'warning');
  };

  const addCustomer = (custData: Omit<Customer, 'id' | 'code'> & { code?: string }): Customer => {
    const newCode = custData.code?.trim() || `KH-${String(customers.length + 1).padStart(3, '0')}`;
    const newCust: Customer = {
      ...custData,
      id: 'cust-' + Date.now(),
      code: newCode,
    };
    setCustomers((prev) => [newCust, ...prev]);
    addLog('Thêm cán bộ / đơn vị', `Thêm mới: ${newCust.name} (${newCust.group})`, 'info');
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    const target = customers.find((c) => c.id === id);
    const targetName = updates.name || target?.name || id;
    const targetDept = updates.group || target?.group || '';
    addLog('Cập nhật nhân viên / khoa phòng', `Đã cập nhật: ${targetName} ${targetDept ? '→ Khoa: ' + targetDept : ''}`, 'info');
  };

  const deleteCustomer = (id: string) => {
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      addLog('Xóa cán bộ / đơn vị', `Đã xóa: ${target.name} (${target.group})`, 'warning');
    }
  };

  const resetCustomersToDefault = () => {
    setCustomers(INITIAL_CUSTOMERS);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    addLog('Đồng bộ danh bạ cán bộ VPMED', `Đã khôi phục và đồng bộ chính xác ${INITIAL_CUSTOMERS.length} cán bộ 21 khoa phòng Bệnh viện VPMED`, 'success');
  };

  const addSupplier = (suppData: Omit<Supplier, 'id' | 'code'>): Supplier => {
    const newCode = `NCC-${String(suppliers.length + 1).padStart(3, '0')}`;
    const newSupp: Supplier = {
      ...suppData,
      id: 'supp-' + Date.now(),
      code: newCode,
    };
    setSuppliers((prev) => [newSupp, ...prev]);
    addLog('Thêm nhà cung cấp', `Thêm NCC mới: ${newSupp.name}`, 'info');
    return newSupp;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    addLog('Cập nhật NCC', `Cập nhật thông tin NCC ID: ${id}`, 'info');
  };

  const deleteSupplier = (id: string): { success: boolean; message: string } => {
    const supp = suppliers.find((s) => s.id === id);
    if (!supp) return { success: false, message: 'Không tìm thấy nhà cung cấp' };

    const isInUse = receiptOrders.some((r) => r.supplierId === id || r.supplierName === supp.name);
    if (isInUse) {
      return {
        success: false,
        message: `Nhà cung cấp "${supp.name}" đã phát sinh phiếu nhập kho, không thể xóa để bảo toàn lịch sử!`,
      };
    }

    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    addLog('Xóa nhà cung cấp', `Đã xóa NCC: ${supp.name}`, 'warning');
    return { success: true, message: 'Đã xóa nhà cung cấp thành công' };
  };

  const addUser = (userData: Omit<AppUser, 'id'>): AppUser => {
    const newId = 'user-' + Date.now();
    const newUser: AppUser = {
      ...userData,
      id: newId,
    };
    setUsers((prev) => [...prev, newUser]);
    addLog('Tạo tài khoản người dùng', `Thêm user mới: ${newUser.username} (${newUser.name}) - Vai trò: ${newUser.roleTitle}`, 'success');
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
    addLog('Cập nhật phân quyền user', `Cập nhật quyền/thông tin user: ${updates.name || id}`, 'info');
  };

  const deleteUser = (id: string): { success: boolean; message: string } => {
    if (id === currentUser.id) {
      return { success: false, message: 'Không thể xóa tài khoản bạn đang đăng nhập!' };
    }
    const target = users.find((u) => u.id === id);
    if (!target) {
      return { success: false, message: 'Không tìm thấy tài khoản người dùng cần xóa!' };
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    addLog('Xóa người dùng', `Đã xóa tài khoản user: ${target.username} (${target.name})`, 'warning');
    return { success: true, message: `Đã xóa vĩnh viễn tài khoản @${target.username} thành công!` };
  };

  const switchUser = (userId: string): boolean => {
    const target = users.find((u) => u.id === userId);
    if (!target) return false;
    if (!target.isActive) {
      alert('Tài khoản này hiện đang bị khóa tạm thời. Vui lòng liên hệ Admin IT!');
      return false;
    }
    setCurrentUser(target);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, target.id);
    addLog('Đăng nhập hệ thống', `Người dùng đăng nhập: ${target.name} (${target.roleTitle})`, 'info');
    return true;
  };

  // ĐĂNG NHẬP CHẶT CHẼ: BẮT BUỘC ĐÚNG MẬT KHẨU, ĐÃ BỎ CỬA HẬU 123
  const login = (
    usernameOrEmail: string,
    password: string
  ): { success: boolean; message: string; user?: AppUser } => {
    const cleanIdentifier = usernameOrEmail.trim().toLowerCase();
    const cleanPass = password.trim();

    const targetUser = users.find(
      (u) =>
        u.username.toLowerCase() === cleanIdentifier ||
        u.email.toLowerCase() === cleanIdentifier
    );

    if (!targetUser) {
      return {
        success: false,
        message: 'Tài khoản không tồn tại trong hệ thống Bệnh viện VPMED.',
      };
    }

    if (!targetUser.isActive) {
      return {
        success: false,
        message: 'Tài khoản này đang bị khóa tạm thời. Vui lòng liên hệ Admin IT!',
      };
    }

    // Nếu tài khoản chưa từng đổi mật khẩu thì dùng '123', đã đổi thì bắt buộc dùng đúng mật khẩu mới
    const expectedPassword = (targetUser.password && targetUser.password.trim() !== '') ? targetUser.password.trim() : '123';

    if (cleanPass !== expectedPassword) {
      return {
        success: false,
        message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!',
      };
    }

    const updatedUser: AppUser = {
      ...targetUser,
      lastLogin: new Date().toLocaleString('vi-VN', { hour12: false }),
    };

    const nextUsers = users.map((u) => (u.id === targetUser.id ? updatedUser : u));
    setUsers(nextUsers);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(nextUsers));

    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, targetUser.id);

    addLog(
      'Đăng nhập thành công',
      `Người dùng ${updatedUser.name} (${updatedUser.roleTitle}) đã đăng nhập vào hệ thống`,
      'success'
    );

    return {
      success: true,
      message: 'Đăng nhập thành công',
      user: updatedUser,
    };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'false');
    setIsUserManagementModalOpen(false);
    setIsSwitchUserModalOpen(false);
    setIsChangePasswordModalOpen(false);
    setIsCreateProductModalOpen(false);
    setIsCreateReceiptModalOpen(false);
    setIsBackupModalOpen(false);
    setIsCustomerModalOpen(false);
    setIsSupplierModalOpen(false);
    setIsKhoITSyncModalOpen(false);
    addLog('Đăng xuất', `Người dùng ${currentUser?.name || ''} đã đăng xuất an toàn khỏi hệ thống`, 'info');
  };

  // ĐỔI MẬT KHẨU: LƯU TỨC THÌ VÀO STATE VÀ LOCALSTORAGE
  const changePassword = (
    userId: string,
    newPassword: string
  ): { success: boolean; message: string } => {
    const cleanNewPass = newPassword.trim();
    if (!cleanNewPass || cleanNewPass.length < 3) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 3 ký tự' };
    }

    const updatedUsers = users.map((u) => (u.id === userId ? { ...u, password: cleanNewPass } : u));
    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    if (currentUser.id === userId) {
      const updatedCurrent = { ...currentUser, password: cleanNewPass };
      setCurrentUser(updatedCurrent);
    }

    addLog('Đổi mật khẩu', `Đã đổi mật khẩu thành công cho tài khoản user: ${currentUser.name}`, 'info');
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  const addDevice = (data: Omit<HospitalDevice, 'id'>): HospitalDevice => {
    const dev: HospitalDevice = { ...data, id: 'dev-' + Date.now() };
    setDevices((prev) => [dev, ...prev]);
    addLog('Thêm thiết bị', `Thêm thiết bị ${dev.code} (S/N ${dev.serialNumber}) cho ${dev.department}`, 'success');
    return dev;
  };

  const updateDevice = (id: string, updates: Partial<HospitalDevice>) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
    addLog('Cập nhật thiết bị', `Cập nhật thiết bị ID ${id}`, 'info');
  };

  const deleteDevice = (id: string) => {
    const d = devices.find((x) => x.id === id);
    setDevices((prev) => prev.filter((x) => x.id !== id));
    if (d) addLog('Xóa thiết bị', `Đã xóa thiết bị ${d.code}`, 'warning');
  };

  const createAuditOrder = (data: Omit<StockAuditOrder, 'id' | 'createdAt'>): StockAuditOrder => {
    const order: StockAuditOrder = { ...data, id: 'audit-' + Date.now(), createdAt: nowStr() };
    setAuditOrders((prev) => [order, ...prev]);
    addLog('Lập phiếu kiểm kê', `Phiếu kiểm kê ${order.code}: chênh lệch ${order.totalDiffQuantity} (${order.totalDiffValue.toLocaleString('vi-VN')} đ)`, 'info');
    return order;
  };

  const balanceAuditOrder = (id: string): { success: boolean; message: string } => {
    if (!hasPermission('canAdjustStock')) {
      return { success: false, message: 'Bạn không có quyền điều chỉnh tồn kho để cân bằng kiểm kê.' };
    }
    const order = auditOrders.find((o) => o.id === id);
    if (!order) return { success: false, message: 'Không tìm thấy phiếu kiểm kê.' };
    if (order.status === 'Đã cân bằng kho') return { success: false, message: 'Phiếu này đã được cân bằng kho.' };

    const diffMap = new Map(order.items.filter((it) => it.difference !== 0).map((it) => [it.productId, it.difference]));
    setProducts((prev) =>
      prev.map((p) => (diffMap.has(p.id) ? { ...p, stockQuantity: p.stockQuantity + (diffMap.get(p.id) as number), updatedAt: nowStr() } : p))
    );
    setAuditOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'Đã cân bằng kho', balancedAt: nowStr() } : o))
    );
    addLog('Cân bằng kho', `Cân bằng tồn kho theo phiếu kiểm kê ${order.code} (${order.items.length} mặt hàng)`, 'warning');
    return { success: true, message: `Đã cân bằng tồn kho theo phiếu ${order.code}.` };
  };

  const deleteAuditOrder = (id: string) => {
    const o = auditOrders.find((x) => x.id === id);
    if (!o || o.status === 'Đã cân bằng kho') return;
    setAuditOrders((prev) => prev.filter((x) => x.id !== id));
    addLog('Xóa phiếu kiểm kê', `Đã xóa phiếu kiểm kê nháp ${o.code}`, 'warning');
  };

  const createApprovalRequest = (
    data: Omit<IssueApprovalRequest, 'id' | 'code' | 'createdAt' | 'status'>
  ): IssueApprovalRequest => {
    const d = new Date();
    const code = `YCCP-${d.toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(100 + Math.random() * 900))}`;
    const req: IssueApprovalRequest = { ...data, id: 'req-' + Date.now(), code, status: 'CHO_DUYET', createdAt: nowStr() };
    setApprovalRequests((prev) => [req, ...prev]);
    addLog('Yêu cầu cấp phát', `${req.department} gửi yêu cầu ${req.code} (${req.items.length} mặt hàng)`, 'info');
    return req;
  };

  const reviewApprovalRequest = (id: string, approve: boolean, notes: string) => {
    if (!hasPermission('canApproveNegativeStock') && currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Chỉ Trưởng phòng/Admin mới có quyền duyệt yêu cầu cấp phát.' };
    }
    const req = approvalRequests.find((r) => r.id === id);
    if (!req || req.status !== 'CHO_DUYET') return { success: false, message: 'Yêu cầu không ở trạng thái chờ duyệt.' };
    if (!approve && !notes.trim()) return { success: false, message: 'Vui lòng nhập lý do từ chối.' };
    setApprovalRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: approve ? 'DA_DUYET' : 'TU_CHOI', reviewedBy: currentUser.name, reviewedAt: nowStr(), reviewNotes: notes.trim() }
          : r
      )
    );
    addLog(approve ? 'Duyệt cấp phát' : 'Từ chối cấp phát', `${currentUser.name} ${approve ? 'duyệt' : 'từ chối'} yêu cầu ${req.code}`, approve ? 'success' : 'warning');
    return { success: true, message: approve ? 'Đã duyệt yêu cầu. Thủ kho có thể xuất kho.' : 'Đã từ chối yêu cầu.' };
  };

  const convertApprovalToIssue = (id: string) => {
    if (!hasPermission('canIssueStock')) return { success: false, message: 'Bạn không có quyền lập phiếu xuất kho.' };
    const req = approvalRequests.find((r) => r.id === id);
    if (!req || req.status !== 'DA_DUYET') return { success: false, message: 'Chỉ yêu cầu đã duyệt mới được xuất kho.' };

    const items: StockIssueItem[] = req.items.map((it, idx) => {
      const prod = products.find((p) => p.id === it.productId || p.sku === it.sku);
      const price = prod?.sellingPrice || 0;
      return {
        id: `item-${Date.now()}-${idx}`,
        productId: prod?.id || it.productId,
        sku: it.sku,
        name: it.name,
        unit: it.unit,
        quantity: it.quantity,
        unitPrice: price,
        discountPercent: 0,
        totalPrice: price * it.quantity,
        stockAvailableBefore: prod?.stockQuantity || 0,
        notes: it.notes,
      };
    });
    const total = items.reduce((s, i) => s + i.totalPrice, 0);
    try {
      const order = createIssueOrder({
        code: `PXK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(1000 + Math.random() * 9000))}`,
        date: new Date().toISOString().slice(0, 10),
        customerId: customers.find((c) => c.group === req.department)?.id || 'cust-custom',
        customerName: req.requestedBy,
        customerPhone: req.phone,
        customerAddress: req.department,
        warehouseName: warehouses[0]?.name || 'Kho IT',
        reason: `Cấp phát theo yêu cầu ${req.code}`,
        createdBy: currentUser.name,
        receiverName: req.requestedBy,
        items,
        totalQuantity: items.reduce((s, i) => s + i.quantity, 0),
        subtotalAmount: total,
        discountAmount: 0,
        taxAmount: 0,
        finalAmount: total,
        paymentStatus: 'Đã thanh toán',
        paidAmount: total,
        status: 'Đã xuất kho',
        deviceId: req.deviceId,
        deviceName: req.deviceName,
        deviceSerial: req.deviceSerial,
        notes: `Duyệt bởi ${req.reviewedBy || ''}: ${req.reviewNotes || ''}`,
      });
      setApprovalRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'DA_XUAT_KHO', convertedIssueOrderId: order.id } : r))
      );
      if (req.deviceId) {
        setDevices((prev) =>
          prev.map((d) =>
            d.id === req.deviceId
              ? {
                  ...d,
                  replacementHistory: [
                    ...(d.replacementHistory || []),
                    ...items.map((i) => ({
                      date: new Date().toISOString().slice(0, 10),
                      supplyName: `${i.name} x${i.quantity}`,
                      replacedBy: currentUser.name,
                      notes: order.code,
                    })),
                  ],
                }
              : d
          )
        );
      }
      return { success: true, message: `Đã xuất kho theo phiếu ${order.code}.` };
    } catch (e) {
      return { success: false, message: (e as Error).message };
    }
  };

  const addWarranty = (data: Omit<WarrantyItem, 'id'>): WarrantyItem => {
    const w: WarrantyItem = { ...data, id: 'war-' + Date.now() };
    setWarranties((prev) => [w, ...prev]);
    addLog('Thêm bảo hành', `Theo dõi bảo hành ${w.sku} (${w.warrantyMonths} tháng) - NCC ${w.supplierName}`, 'success');
    return w;
  };

  const updateWarranty = (id: string, updates: Partial<WarrantyItem>) => {
    setWarranties((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    addLog('Cập nhật bảo hành', `Cập nhật hồ sơ bảo hành ID ${id}`, 'info');
  };

  const deleteWarranty = (id: string) => {
    setWarranties((prev) => prev.filter((w) => w.id !== id));
    addLog('Xóa bảo hành', `Đã xóa hồ sơ bảo hành ID ${id}`, 'warning');
  };

  const hasPermission = (permissionKey: keyof UserPermissions): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN') return true;
    return !!currentUser.permissions?.[permissionKey];
  };

  const exportBackupJson = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      companyInfo,
      products,
      issueOrders,
      receiptOrders,
      customers,
      suppliers,
      warehouses,
      devices,
      auditOrders,
      approvalRequests,
      warranties,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importBackupJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed.products || !Array.isArray(parsed.products)) {
        throw new Error('Dữ liệu sao lưu không đúng cấu trúc sản phẩm');
      }
      if (parsed.products) setProducts(parsed.products);
      if (parsed.issueOrders) setIssueOrders(parsed.issueOrders);
      if (parsed.receiptOrders) setReceiptOrders(parsed.receiptOrders);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.warehouses) setWarehouses(parsed.warehouses);
      if (parsed.companyInfo) setCompanyInfo(parsed.companyInfo);
      if (Array.isArray(parsed.devices)) setDevices(parsed.devices);
      if (Array.isArray(parsed.auditOrders)) setAuditOrders(parsed.auditOrders);
      if (Array.isArray(parsed.approvalRequests)) setApprovalRequests(parsed.approvalRequests);
      if (Array.isArray(parsed.warranties)) setWarranties(parsed.warranties);

      addLog('Phục hồi dữ liệu', 'Phục hồi toàn bộ dữ liệu từ tệp sao lưu thành công', 'success');
      return true;
    } catch (e) {
      console.error(e);
      addLog('Lỗi phục hồi', 'Không thể đọc tệp sao lưu', 'error');
      return false;
    }
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setIssueOrders(INITIAL_ISSUE_ORDERS);
    setReceiptOrders(INITIAL_RECEIPT_ORDERS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setWarehouses(INITIAL_WAREHOUSES);
    setCompanyInfo(INITIAL_COMPANY);
    setDevices(INITIAL_DEVICES);
    setAuditOrders(INITIAL_AUDIT_ORDERS);
    setApprovalRequests(INITIAL_APPROVAL_REQUESTS);
    setWarranties(INITIAL_WARRANTIES);
    addLog('Khôi phục mẫu', 'Đã tải lại toàn bộ danh mục hàng hóa và nhà cung cấp mẫu ban đầu', 'warning');
  };

  const getProductStockLedger = (productId: string): StockCardRecord[] => {
    const records: StockCardRecord[] = [];
    const prod = products.find((p) => p.id === productId || p.sku === productId);
    if (!prod) return [];

    receiptOrders.forEach((rec) => {
      const it = rec.items.find((item) => item.productId === productId || item.sku === prod.sku);
      if (it) {
        records.push({
          id: `rec-entry-${rec.id}-${it.id}`,
          date: rec.date,
          voucherCode: rec.code,
          voucherType: 'NHAP',
          partnerName: rec.supplierName,
          quantityIn: it.quantity,
          quantityOut: 0,
          balanceAfter: 0,
          unitPrice: it.unitCost,
          notes: rec.notes || 'Nhập kho',
        });
      }
    });

    issueOrders.forEach((iss) => {
      const it = iss.items.find((item) => item.productId === productId || item.sku === prod.sku);
      if (it) {
        records.push({
          id: `iss-entry-${iss.id}-${it.id}`,
          date: iss.date,
          voucherCode: iss.code,
          voucherType: 'XUAT',
          partnerName: iss.customerName,
          quantityIn: 0,
          quantityOut: it.quantity,
          balanceAfter: 0,
          unitPrice: it.unitPrice,
          notes: iss.reason || 'Xuất kho cho khách',
        });
      }
    });

    records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const totalIn = records.reduce((sum, r) => sum + r.quantityIn, 0);
    const totalOut = records.reduce((sum, r) => sum + r.quantityOut, 0);
    let initialBalance = Math.max(0, prod.stockQuantity - totalIn + totalOut);

    let currentBalance = initialBalance;
    return records.map((r) => {
      currentBalance = currentBalance + r.quantityIn - r.quantityOut;
      return {
        ...r,
        balanceAfter: currentBalance,
      };
    });
  };

  const getOverallStats = () => {
    const totalProducts = products.length;
    const totalStockCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const totalStockValue = products.reduce((sum, p) => sum + p.stockQuantity * p.costPrice, 0);
    const lowStockCount = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert).length;
    const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;
    const totalIssueOrders = issueOrders.length;
    const totalIssueRevenue = issueOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    return {
      totalProducts,
      totalStockCount,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
      totalIssueOrders,
      totalIssueRevenue,
    };
  };

  return (
    <WarehouseContext.Provider
      value={{
        products,
        issueOrders,
        receiptOrders,
        customers,
        suppliers,
        warehouses,
        companyInfo,
        updateCompanyInfo,
        systemLogs,
        activeTab,
        setActiveTab,
        subTabXuattKho,
        setSubTabXuattKho,
        historyViewMode,
        setHistoryViewMode,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        selectedVoucherForPrint,
        setSelectedVoucherForPrint,
        editingIssueOrder,
        setEditingIssueOrder,
        editingProduct,
        setEditingProduct,
        isCreateProductModalOpen,
        setIsCreateProductModalOpen,
        isCreateReceiptModalOpen,
        setIsCreateReceiptModalOpen,
        isBackupModalOpen,
        setIsBackupModalOpen,
        isCustomerModalOpen,
        setIsCustomerModalOpen,
        isSupplierModalOpen,
        setIsSupplierModalOpen,
        isKhoITSyncModalOpen,
        setIsKhoITSyncModalOpen,
        isUserManagementModalOpen,
        setIsUserManagementModalOpen,
        isSwitchUserModalOpen,
        setIsSwitchUserModalOpen,
        isChangePasswordModalOpen,
        setIsChangePasswordModalOpen,
        isCompanySettingsModalOpen,
        setIsCompanySettingsModalOpen,
        isVoucherSignatoriesModalOpen,
        setIsVoucherSignatoriesModalOpen,
        issueOrderCreators,
        defaultIssueCreator,
        addIssueOrderCreator,
        removeIssueOrderCreator,
        setDefaultIssueCreator,
        isAuthenticated,
        login,
        logout,
        changePassword,
        users,
        currentUser,
        setCurrentUser,
        addUser,
        updateUser,
        deleteUser,
        switchUser,
        hasPermission,
        addProduct,
        updateProduct,
        deleteProduct,
        quickAdjustStock,
        createIssueOrder,
        updateIssueOrder,
        deleteIssueOrder,
        getAvailableStock,
        devices,
        addDevice,
        updateDevice,
        deleteDevice,
        auditOrders,
        createAuditOrder,
        balanceAuditOrder,
        deleteAuditOrder,
        approvalRequests,
        createApprovalRequest,
        reviewApprovalRequest,
        convertApprovalToIssue,
        warranties,
        addWarranty,
        updateWarranty,
        deleteWarranty,
        createReceiptOrder,
        deleteReceiptOrder,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        resetCustomersToDefault,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        exportBackupJson,
        importBackupJson,
        resetToDefaultData,
        getProductStockLedger,
        getOverallStats,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
};