
import { Order, OrderStatus, SalesStat, StatusLog, Customer, PurchasedProduct, InventoryItem, MovementType, StockMovement } from './types';

// 1. Định nghĩa danh mục sản phẩm gốc (Master Catalog)
const PRODUCT_TEMPLATES = [
  { name: 'Áo thun Cotton Premium', category: 'Áo thun', cost: 120000, price: 350000, colors: ['Trắng', 'Đen', 'Xám'], sizes: ['S', 'M', 'L', 'XL'], img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400' },
  { name: 'Quần Jean Slim Fit', category: 'Quần Jean', cost: 250000, price: 550000, colors: ['Xanh', 'Đen'], sizes: ['29', '30', '31', '32'], img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400' },
  { name: 'Sơ mi lụa nam', category: 'Sơ mi', cost: 200000, price: 500000, colors: ['Trắng', 'Xanh nhạt'], sizes: ['M', 'L', 'XL'], img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400' },
  { name: 'Đầm Maxi Voan', category: 'Váy Đầm', cost: 400000, price: 950000, colors: ['Hồng', 'Vàng', 'Xanh'], sizes: ['S', 'M', 'L'], img: 'https://images.unsplash.com/photo-1572804013307-5977c143c250?w=400' },
  { name: 'Áo khoác Bomber', category: 'Áo Khoác', cost: 350000, price: 750000, colors: ['Xanh rêu', 'Đen'], sizes: ['L', 'XL'], img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400' },
  { name: 'Chân váy chữ A', category: 'Váy Đầm', cost: 180000, price: 420000, colors: ['Nâu', 'Đen'], sizes: ['S', 'M'], img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400' },
  { name: 'Áo Hoodie Unisex', category: 'Áo Khoác', cost: 220000, price: 480000, colors: ['Xám', 'Đỏ', 'Vàng'], sizes: ['M', 'L', 'XL'], img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400' },
  { name: 'Quần Tây Âu Nam', category: 'Quần Tây', cost: 280000, price: 620000, colors: ['Đen', 'Xanh đen'], sizes: ['30', '31', '32'], img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400' }
];

// 2. Tạo danh sách Kho hàng từ Catalog
const generateMockInventory = (): InventoryItem[] => {
  return PRODUCT_TEMPLATES.map((item, index) => {
    const stock = Math.floor(Math.random() * 80) + 10;
    const minStock = 20;
    const id = `PROD-${(index + 1).toString().padStart(4, '0')}`;
    const sku = `FA-${item.category.substring(0, 2).toUpperCase()}-${1000 + index}`;

    const movements: StockMovement[] = [
      {
        id: `MOV-${index}-1`,
        productId: id,
        type: MovementType.IMPORT,
        quantity: 100,
        before: 0,
        after: 100,
        note: 'Nhập hàng đầu mùa',
        createdAt: '2024-01-10T09:00:00Z',
        user: 'Kho_Manager'
      }
    ];

    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (stock === 0) status = 'Out of Stock';
    else if (stock <= minStock) status = 'Low Stock';

    return {
      id,
      name: item.name,
      sku,
      category: item.category,
      stock,
      minStock,
      costPrice: item.cost,
      sellingPrice: item.price,
      image: item.img,
      lastUpdated: new Date().toISOString(),
      status,
      movements
    };
  });
};

// Khởi tạo MOCK_INVENTORY trước để Đơn hàng có thể tham chiếu
export const MOCK_INVENTORY: InventoryItem[] = generateMockInventory();

// 3. Tạo danh sách Đơn hàng (lấy sản phẩm từ Kho hàng)
const generateMockOrders = (): Order[] => {
  const statuses = Object.values(OrderStatus);
  const names = [
    'Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em',
    'Vũ Thị Phương', 'Đỗ Văn Giang', 'Bùi Thị Hạnh', 'Lý Văn Hùng', 'Chu Thị Kim',
    'Phan Văn Long', 'Đặng Thị Mai', 'Ngô Văn Nam', 'Trịnh Thị Oanh', 'Lương Văn Phúc',
    'Quách Thị Quỳnh', 'Tạ Văn Sơn', 'Đoàn Thị Thảo', 'Hà Văn Uy', 'Lâm Thị Xuân'
  ];

  const discountCodes = ['FASHION_NEW', 'SUMMER2024', 'SALE50K', 'VIP_MEMBER'];

  return Array.from({ length: 40 }).map((_, index) => {
    const id = `ORD-${(index + 1).toString().padStart(3, '0')}`;
    const name = names[index % names.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const month = Math.floor(Math.random() * 2) + 4; // Tháng 4, 5
    const day = Math.floor(Math.random() * 28) + 1;
    const createdAt = `2024-0${month}-${day.toString().padStart(2, '0')}T10:00:00Z`;

    // Chọn ngẫu nhiên 1-3 sản phẩm từ Kho hàng đã tạo
    const numItems = Math.floor(Math.random() * 2) + 1;
    const items = Array.from({ length: numItems }).map(() => {
      const invIdx = Math.floor(Math.random() * MOCK_INVENTORY.length);
      const invItem = MOCK_INVENTORY[invIdx];
      const template = PRODUCT_TEMPLATES[invIdx];

      return {
        id: invItem.id, // Khớp với ID trong kho
        name: invItem.name,
        price: invItem.sellingPrice,
        quantity: Math.floor(Math.random() * 2) + 1,
        image: invItem.image,
        size: template.sizes[Math.floor(Math.random() * template.sizes.length)],
        color: template.colors[Math.floor(Math.random() * template.colors.length)]
      };
    });

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = Math.random() > 0.7 ? 50000 : 0;
    const totalAmount = subtotal - discount;

    return {
      id, customerName: name, 
      email: `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '.')}@example.com`,
      phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: `${Math.floor(Math.random() * 500) + 1} Đường Lê Lợi, TP.HCM`,
      status, 
      statusHistory: [{ status: OrderStatus.PENDING, updatedAt: createdAt, updatedBy: 'Hệ thống' }],
      totalAmount, discount, 
      discountCode: discount > 0 ? discountCodes[Math.floor(Math.random() * discountCodes.length)] : undefined,
      createdAt, items,
      note: Math.random() > 0.9 ? 'Giao giờ hành chính' : undefined
    };
  });
};

const generateMockCustomers = (): Customer[] => {
  const names = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Văn Cường', 'Phạm Thị Dung', 'Hoàng Văn Em'];
  return names.map((name, index) => {
    const totalSpent = Math.floor(Math.random() * 10000000) + 1000000;
    return {
      id: `CUST-${(index + 1).toString().padStart(4, '0')}`,
      name,
      email: `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '.')}@gmail.com`,
      phone: `098${Math.floor(1000000 + Math.random() * 9000000)}`,
      address: 'TP. Hồ Chí Minh',
      dob: '1995-05-10',
      totalSpent,
      orderCount: Math.floor(Math.random() * 5) + 1,
      membershipLevel: totalSpent > 5000000 ? 'Vàng' : 'Bạc',
      purchasedProducts: [
        { id: MOCK_INVENTORY[0].id, name: MOCK_INVENTORY[0].name, image: MOCK_INVENTORY[0].image, totalQuantity: 2, lastPurchased: '2024-05-01' }
      ],
      orderIds: [`ORD-${(index + 1).toString().padStart(3, '0')}`],
      avatar: `https://i.pravatar.cc/150?u=${index}`
    };
  });
};

export const MOCK_ORDERS: Order[] = generateMockOrders();
export const MOCK_CUSTOMERS: Customer[] = generateMockCustomers();

export const SALES_STATS: SalesStat[] = [
  { date: '11/05', revenue: 4500000, orders: 12 },
  { date: '12/05', revenue: 5200000, orders: 15 },
  { date: '13/05', revenue: 3800000, orders: 10 },
  { date: '14/05', revenue: 6100000, orders: 18 },
  { date: '15/05', revenue: 4900000, orders: 14 },
  { date: '16/05', revenue: 7500000, orders: 22 },
  { date: '17/05', revenue: 5800000, orders: 17 },
];
