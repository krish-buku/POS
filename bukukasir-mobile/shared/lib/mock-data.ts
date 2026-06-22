import type { TableStatus, OrderStatus, KitchenTicketStatus } from '../constants/colors';

// ==================== Type Definitions ====================

export interface Business {
  id: string;
  name: string;
  type: 'restaurant' | 'cafe';
  address: string;
  phone: string;
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  role: 'owner' | 'cashier' | 'waiter' | 'kitchen';
  pin: string;
  isActive: boolean;
}

export interface MenuCategory {
  id: string;
  businessId: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string | null;
  isAvailable: boolean;
  modifiers?: MenuModifier[];
}

export interface MenuModifier {
  id: string;
  name: string;
  price: number;
}

export interface Floor {
  id: string;
  businessId: string;
  name: string;
  sortOrder: number;
}

export interface Area {
  id: string;
  businessId: string;
  floorId: string;
  name: string;
  sortOrder: number;
}

export interface Table {
  id: string;
  businessId: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
  currentOrderId: string | null;
  assignedStaffId: string | null;
  runningTotal: number;
  floorId: string;
  areaId: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  modifiers: string[];
  notes: string;
  subtotal: number;
}

export interface Order {
  id: string;
  businessId: string;
  orderNumber: string;
  tableId: string | null;
  tableName: string;
  type: 'dine_in' | 'takeaway' | 'delivery';
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed' | null;
  discountValue: number;
  tax: number;
  fees: OrderFee[];
  total: number;
  paymentMethod: string | null;
  staffId: string;
  staffName: string;
  createdAt: string;
  paidAt: string | null;
}

export interface OrderFee {
  id: string;
  name: string;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'qris' | 'edc' | 'ewallet';
  icon: string;
  isActive: boolean;
}

export interface KitchenTicket {
  id: string;
  orderId: string;
  orderNumber: string;
  tableName: string;
  items: KitchenTicketItem[];
  status: KitchenTicketStatus;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface KitchenTicketItem {
  id: string;
  name: string;
  quantity: number;
  modifiers: string[];
  notes: string;
}

// ==================== Mock Data ====================

export const mockBusinesses: Business[] = [
  {
    id: 'biz-001',
    name: 'Warung Makan Sederhana',
    type: 'restaurant',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    phone: '+6281234567890',
  },
  {
    id: 'biz-002',
    name: 'Kopi Nusantara',
    type: 'cafe',
    address: 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
    phone: '+6281234567891',
  },
];

export const mockStaff: Staff[] = [
  {
    id: 'staff-001',
    businessId: 'biz-001',
    name: 'Budi Santoso',
    phone: '+6281234567890',
    role: 'owner',
    pin: '123456',
    isActive: true,
  },
  {
    id: 'staff-002',
    businessId: 'biz-001',
    name: 'Siti Rahayu',
    phone: '+6281234567892',
    role: 'cashier',
    pin: '123456',
    isActive: true,
  },
  {
    id: 'staff-003',
    businessId: 'biz-001',
    name: 'Ahmad Hidayat',
    phone: '+6281234567893',
    role: 'waiter',
    pin: '123456',
    isActive: true,
  },
  {
    id: 'staff-004',
    businessId: 'biz-001',
    name: 'Dewi Lestari',
    phone: '+6281234567894',
    role: 'waiter',
    pin: '123456',
    isActive: true,
  },
  {
    id: 'staff-005',
    businessId: 'biz-001',
    name: 'Rudi Hartono',
    phone: '+6281234567895',
    role: 'kitchen',
    pin: '123456',
    isActive: true,
  },
];

export const mockCategories: MenuCategory[] = [
  { id: 'cat-001', businessId: 'biz-001', name: 'Makanan Utama', sortOrder: 1 },
  { id: 'cat-002', businessId: 'biz-001', name: 'Minuman', sortOrder: 2 },
  { id: 'cat-003', businessId: 'biz-001', name: 'Camilan', sortOrder: 3 },
  { id: 'cat-004', businessId: 'biz-001', name: 'Dessert', sortOrder: 4 },
];

export const mockMenuItems: MenuItem[] = [
  {
    id: 'menu-001',
    businessId: 'biz-001',
    categoryId: 'cat-001',
    name: 'Nasi Goreng Spesial',
    price: 35000,
    description: 'Nasi goreng dengan telur, ayam, dan sayuran',
    imageUrl: null,
    isAvailable: true,
    modifiers: [
      { id: 'mod-001', name: 'Extra Telur', price: 5000 },
      { id: 'mod-002', name: 'Extra Ayam', price: 8000 },
      { id: 'mod-003', name: 'Pedas', price: 0 },
    ],
  },
  {
    id: 'menu-002',
    businessId: 'biz-001',
    categoryId: 'cat-001',
    name: 'Mie Goreng',
    price: 30000,
    description: 'Mie goreng dengan telur dan sayuran',
    imageUrl: null,
    isAvailable: true,
    modifiers: [
      { id: 'mod-004', name: 'Extra Telur', price: 5000 },
      { id: 'mod-005', name: 'Pedas', price: 0 },
    ],
  },
  {
    id: 'menu-003',
    businessId: 'biz-001',
    categoryId: 'cat-001',
    name: 'Ayam Bakar',
    price: 45000,
    description: 'Ayam bakar bumbu kecap dengan sambal',
    imageUrl: null,
    isAvailable: true,
  },
  {
    id: 'menu-004',
    businessId: 'biz-001',
    categoryId: 'cat-001',
    name: 'Soto Ayam',
    price: 28000,
    description: 'Soto ayam dengan nasi dan pelengkap',
    imageUrl: null,
    isAvailable: true,
  },
  {
    id: 'menu-005',
    businessId: 'biz-001',
    categoryId: 'cat-002',
    name: 'Es Teh Manis',
    price: 8000,
    description: 'Teh manis dingin',
    imageUrl: null,
    isAvailable: true,
  },
  {
    id: 'menu-006',
    businessId: 'biz-001',
    categoryId: 'cat-002',
    name: 'Es Jeruk',
    price: 10000,
    description: 'Jeruk segar dengan es',
    imageUrl: null,
    isAvailable: true,
  },
  {
    id: 'menu-007',
    businessId: 'biz-001',
    categoryId: 'cat-002',
    name: 'Kopi Hitam',
    price: 12000,
    description: 'Kopi tubruk hitam',
    imageUrl: null,
    isAvailable: true,
    modifiers: [
      { id: 'mod-006', name: 'Gula Tambahan', price: 0 },
      { id: 'mod-007', name: 'Susu', price: 3000 },
    ],
  },
  {
    id: 'menu-008',
    businessId: 'biz-001',
    categoryId: 'cat-003',
    name: 'Kentang Goreng',
    price: 20000,
    description: 'Kentang goreng crispy dengan saus',
    imageUrl: null,
    isAvailable: true,
  },
  {
    id: 'menu-009',
    businessId: 'biz-001',
    categoryId: 'cat-003',
    name: 'Tahu Goreng',
    price: 15000,
    description: 'Tahu goreng tepung dengan sambal kecap',
    imageUrl: null,
    isAvailable: true,
  },
  {
    id: 'menu-010',
    businessId: 'biz-001',
    categoryId: 'cat-004',
    name: 'Es Campur',
    price: 18000,
    description: 'Es campur dengan buah dan sirup',
    imageUrl: null,
    isAvailable: true,
  },
];

export const mockFloors: Floor[] = [
  { id: 'floor-001', businessId: 'biz-001', name: 'Lantai 1', sortOrder: 1 },
  { id: 'floor-002', businessId: 'biz-001', name: 'Lantai 2', sortOrder: 2 },
];

export const mockAreas: Area[] = [
  { id: 'area-001', businessId: 'biz-001', floorId: 'floor-001', name: 'Indoor', sortOrder: 1 },
  { id: 'area-002', businessId: 'biz-001', floorId: 'floor-001', name: 'Teras', sortOrder: 2 },
  { id: 'area-003', businessId: 'biz-001', floorId: 'floor-002', name: 'VIP', sortOrder: 1 },
  { id: 'area-004', businessId: 'biz-001', floorId: 'floor-002', name: 'Smoking Area', sortOrder: 2 },
];

export const mockTables: Table[] = [
  {
    id: 'table-001',
    businessId: 'biz-001',
    number: 1,
    name: 'Meja 1',
    capacity: 4,
    status: 'available',
    currentOrderId: null,
    assignedStaffId: null,
    runningTotal: 0,
    floorId: 'floor-001',
    areaId: 'area-001',
  },
  {
    id: 'table-002',
    businessId: 'biz-001',
    number: 2,
    name: 'Meja 2',
    capacity: 4,
    status: 'occupied',
    currentOrderId: 'order-001',
    assignedStaffId: 'staff-003',
    runningTotal: 78000,
    floorId: 'floor-001',
    areaId: 'area-001',
  },
  {
    id: 'table-003',
    businessId: 'biz-001',
    number: 3,
    name: 'Meja 3',
    capacity: 2,
    status: 'available',
    currentOrderId: null,
    assignedStaffId: null,
    runningTotal: 0,
    floorId: 'floor-001',
    areaId: 'area-001',
  },
  {
    id: 'table-004',
    businessId: 'biz-001',
    number: 4,
    name: 'Meja 4',
    capacity: 6,
    status: 'occupied',
    currentOrderId: 'order-002',
    assignedStaffId: 'staff-003',
    runningTotal: 126000,
    floorId: 'floor-001',
    areaId: 'area-002',
  },
  {
    id: 'table-005',
    businessId: 'biz-001',
    number: 5,
    name: 'Meja 5',
    capacity: 4,
    status: 'reserved',
    currentOrderId: null,
    assignedStaffId: 'staff-004',
    runningTotal: 0,
    floorId: 'floor-001',
    areaId: 'area-002',
  },
  {
    id: 'table-006',
    businessId: 'biz-001',
    number: 6,
    name: 'Meja 6',
    capacity: 8,
    status: 'cleaning',
    currentOrderId: null,
    assignedStaffId: null,
    runningTotal: 0,
    floorId: 'floor-001',
    areaId: 'area-002',
  },
  {
    id: 'table-007',
    businessId: 'biz-001',
    number: 7,
    name: 'Meja 7',
    capacity: 4,
    status: 'available',
    currentOrderId: null,
    assignedStaffId: null,
    runningTotal: 0,
    floorId: 'floor-002',
    areaId: 'area-003',
  },
  {
    id: 'table-008',
    businessId: 'biz-001',
    number: 8,
    name: 'Meja 8',
    capacity: 2,
    status: 'occupied',
    currentOrderId: 'order-003',
    assignedStaffId: 'staff-004',
    runningTotal: 55000,
    floorId: 'floor-002',
    areaId: 'area-003',
  },
  {
    id: 'table-009',
    businessId: 'biz-001',
    number: 9,
    name: 'Meja 9',
    capacity: 6,
    status: 'available',
    currentOrderId: null,
    assignedStaffId: null,
    runningTotal: 0,
    floorId: 'floor-002',
    areaId: 'area-004',
  },
  {
    id: 'table-010',
    businessId: 'biz-001',
    number: 10,
    name: 'Meja 10',
    capacity: 4,
    status: 'available',
    currentOrderId: null,
    assignedStaffId: null,
    runningTotal: 0,
    floorId: 'floor-002',
    areaId: 'area-004',
  },
];

const now = new Date();
const thirtyMinAgo = new Date(now.getTime() - 30 * 60000).toISOString();
const oneHourAgo = new Date(now.getTime() - 60 * 60000).toISOString();
const twoHoursAgo = new Date(now.getTime() - 120 * 60000).toISOString();
const threeMinAgo = new Date(now.getTime() - 3 * 60000).toISOString();
const eightMinAgo = new Date(now.getTime() - 8 * 60000).toISOString();

export const mockOrders: Order[] = [
  {
    id: 'order-001',
    businessId: 'biz-001',
    orderNumber: 'ORD-20260328-001',
    tableId: 'table-002',
    tableName: 'Meja 2',
    type: 'dine_in',
    status: 'preparing',
    items: [
      {
        id: 'oi-001',
        menuItemId: 'menu-001',
        menuItemName: 'Nasi Goreng Spesial',
        quantity: 2,
        unitPrice: 35000,
        modifiers: ['Pedas'],
        notes: '',
        subtotal: 70000,
      },
      {
        id: 'oi-002',
        menuItemId: 'menu-005',
        menuItemName: 'Es Teh Manis',
        quantity: 2,
        unitPrice: 8000,
        modifiers: [],
        notes: '',
        subtotal: 16000,
      },
    ],
    subtotal: 86000,
    discount: 8000,
    discountType: 'fixed',
    discountValue: 8000,
    tax: 0,
    fees: [],
    total: 78000,
    paymentMethod: null,
    staffId: 'staff-003',
    staffName: 'Ahmad Hidayat',
    createdAt: thirtyMinAgo,
    paidAt: null,
  },
  {
    id: 'order-002',
    businessId: 'biz-001',
    orderNumber: 'ORD-20260328-002',
    tableId: 'table-004',
    tableName: 'Meja 4',
    type: 'dine_in',
    status: 'new',
    items: [
      {
        id: 'oi-003',
        menuItemId: 'menu-003',
        menuItemName: 'Ayam Bakar',
        quantity: 2,
        unitPrice: 45000,
        modifiers: [],
        notes: 'Sambal pisah',
        subtotal: 90000,
      },
      {
        id: 'oi-004',
        menuItemId: 'menu-006',
        menuItemName: 'Es Jeruk',
        quantity: 2,
        unitPrice: 10000,
        modifiers: [],
        notes: '',
        subtotal: 20000,
      },
      {
        id: 'oi-005',
        menuItemId: 'menu-008',
        menuItemName: 'Kentang Goreng',
        quantity: 1,
        unitPrice: 20000,
        modifiers: [],
        notes: '',
        subtotal: 20000,
      },
    ],
    subtotal: 130000,
    discount: 0,
    discountType: null,
    discountValue: 0,
    tax: 0,
    fees: [{ id: 'fee-001', name: 'Biaya Layanan', amount: -4000 }],
    total: 126000,
    paymentMethod: null,
    staffId: 'staff-003',
    staffName: 'Ahmad Hidayat',
    createdAt: threeMinAgo,
    paidAt: null,
  },
  {
    id: 'order-003',
    businessId: 'biz-001',
    orderNumber: 'ORD-20260328-003',
    tableId: 'table-008',
    tableName: 'Meja 8',
    type: 'dine_in',
    status: 'preparing',
    items: [
      {
        id: 'oi-006',
        menuItemId: 'menu-004',
        menuItemName: 'Soto Ayam',
        quantity: 1,
        unitPrice: 28000,
        modifiers: [],
        notes: '',
        subtotal: 28000,
      },
      {
        id: 'oi-007',
        menuItemId: 'menu-007',
        menuItemName: 'Kopi Hitam',
        quantity: 1,
        unitPrice: 12000,
        modifiers: ['Susu'],
        notes: '',
        subtotal: 15000,
      },
      {
        id: 'oi-008',
        menuItemId: 'menu-009',
        menuItemName: 'Tahu Goreng',
        quantity: 1,
        unitPrice: 15000,
        modifiers: [],
        notes: '',
        subtotal: 15000,
      },
    ],
    subtotal: 58000,
    discount: 3000,
    discountType: 'fixed',
    discountValue: 3000,
    tax: 0,
    fees: [],
    total: 55000,
    paymentMethod: null,
    staffId: 'staff-004',
    staffName: 'Dewi Lestari',
    createdAt: eightMinAgo,
    paidAt: null,
  },
  {
    id: 'order-004',
    businessId: 'biz-001',
    orderNumber: 'ORD-20260328-004',
    tableId: 'table-001',
    tableName: 'Meja 1',
    type: 'dine_in',
    status: 'paid',
    items: [
      {
        id: 'oi-009',
        menuItemId: 'menu-002',
        menuItemName: 'Mie Goreng',
        quantity: 1,
        unitPrice: 30000,
        modifiers: ['Extra Telur'],
        notes: '',
        subtotal: 35000,
      },
      {
        id: 'oi-010',
        menuItemId: 'menu-005',
        menuItemName: 'Es Teh Manis',
        quantity: 1,
        unitPrice: 8000,
        modifiers: [],
        notes: '',
        subtotal: 8000,
      },
    ],
    subtotal: 43000,
    discount: 0,
    discountType: null,
    discountValue: 0,
    tax: 0,
    fees: [],
    total: 43000,
    paymentMethod: 'cash',
    staffId: 'staff-002',
    staffName: 'Siti Rahayu',
    createdAt: oneHourAgo,
    paidAt: oneHourAgo,
  },
  {
    id: 'order-005',
    businessId: 'biz-001',
    orderNumber: 'ORD-20260328-005',
    tableId: null,
    tableName: 'Takeaway',
    type: 'takeaway',
    status: 'paid',
    items: [
      {
        id: 'oi-011',
        menuItemId: 'menu-001',
        menuItemName: 'Nasi Goreng Spesial',
        quantity: 3,
        unitPrice: 35000,
        modifiers: [],
        notes: 'Tidak pedas',
        subtotal: 105000,
      },
      {
        id: 'oi-012',
        menuItemId: 'menu-010',
        menuItemName: 'Es Campur',
        quantity: 2,
        unitPrice: 18000,
        modifiers: [],
        notes: '',
        subtotal: 36000,
      },
    ],
    subtotal: 141000,
    discount: 0,
    discountType: null,
    discountValue: 0,
    tax: 0,
    fees: [],
    total: 141000,
    paymentMethod: 'qris',
    staffId: 'staff-002',
    staffName: 'Siti Rahayu',
    createdAt: twoHoursAgo,
    paidAt: twoHoursAgo,
  },
];

export const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pm-001', name: 'Tunai', type: 'cash', icon: 'banknote', isActive: true },
  { id: 'pm-002', name: 'QRIS', type: 'qris', icon: 'qr-code', isActive: true },
  { id: 'pm-003', name: 'EDC / Kartu', type: 'edc', icon: 'credit-card', isActive: true },
  { id: 'pm-004', name: 'GoPay', type: 'ewallet', icon: 'smartphone', isActive: true },
];

export const mockKitchenTickets: KitchenTicket[] = [
  {
    id: 'kt-001',
    orderId: 'order-002',
    orderNumber: 'ORD-20260328-002',
    tableName: 'Meja 4',
    items: [
      { id: 'kti-001', name: 'Ayam Bakar', quantity: 2, modifiers: [], notes: 'Sambal pisah' },
      { id: 'kti-002', name: 'Kentang Goreng', quantity: 1, modifiers: [], notes: '' },
    ],
    status: 'new',
    createdAt: threeMinAgo,
    startedAt: null,
    completedAt: null,
  },
  {
    id: 'kt-002',
    orderId: 'order-001',
    orderNumber: 'ORD-20260328-001',
    tableName: 'Meja 2',
    items: [
      { id: 'kti-003', name: 'Nasi Goreng Spesial', quantity: 2, modifiers: ['Pedas'], notes: '' },
    ],
    status: 'preparing',
    createdAt: thirtyMinAgo,
    startedAt: eightMinAgo,
    completedAt: null,
  },
  {
    id: 'kt-003',
    orderId: 'order-003',
    orderNumber: 'ORD-20260328-003',
    tableName: 'Meja 8',
    items: [
      { id: 'kti-004', name: 'Soto Ayam', quantity: 1, modifiers: [], notes: '' },
      { id: 'kti-005', name: 'Tahu Goreng', quantity: 1, modifiers: [], notes: '' },
    ],
    status: 'preparing',
    createdAt: eightMinAgo,
    startedAt: threeMinAgo,
    completedAt: null,
  },
  {
    id: 'kt-004',
    orderId: 'order-004',
    orderNumber: 'ORD-20260328-004',
    tableName: 'Meja 1',
    items: [
      { id: 'kti-006', name: 'Mie Goreng', quantity: 1, modifiers: ['Extra Telur'], notes: '' },
    ],
    status: 'ready',
    createdAt: oneHourAgo,
    startedAt: oneHourAgo,
    completedAt: thirtyMinAgo,
  },
];
