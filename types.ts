
export enum OrderStatus {
  PENDING = 'Chờ xác nhận',
  PROCESSING = 'Đang gói hàng',
  SHIPPED = 'Đã giao cho VC',
  DELIVERED = 'Giao thành công',
  EXCHANGE_RETURN = 'Yêu cầu Đổi/Trả hàng'
}

export interface StatusLog {
  status: OrderStatus;
  updatedAt: string;
  updatedBy: string;
  note?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  status: OrderStatus;
  statusHistory: StatusLog[];
  totalAmount: number;
  discount?: number;
  discountCode?: string;
  createdAt: string;
  items: OrderItem[];
  note?: string;
  returnReason?: string;
}

export interface PurchasedProduct {
  id: string;
  name: string;
  image: string;
  totalQuantity: number;
  lastPurchased: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  totalSpent: number;
  orderCount: number;
  membershipLevel: 'Bạc' | 'Vàng' | 'Kim cương';
  purchasedProducts: PurchasedProduct[];
  orderIds: string[];
  avatar: string;
}

export interface SalesStat {
  date: string;
  revenue: number;
  orders: number;
}

export enum MovementType {
  IMPORT = 'Nhập kho',
  EXPORT = 'Xuất kho',
  AUDIT = 'Kiểm kho',
  SALE = 'Bán hàng',
  RETURN = 'Nhập trả'
}

export interface StockMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  before: number;
  after: number;
  note: string;
  createdAt: string;
  user: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  costPrice: number;
  sellingPrice: number;
  image: string;
  lastUpdated: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  movements?: StockMovement[];
}
