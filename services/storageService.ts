
import { Order, User, TailorShop, OrderStatus, UserRole, CatalogueItem, CatalogueCategory } from '../types';

const STORAGE_KEY = 'tailorbee_production_v1';

interface Database {
  users: User[];
  orders: Order[];
  tailors: TailorShop[];
  catalogueCategories: CatalogueCategory[];
  catalogueItems: CatalogueItem[];
}

const initializeDB = (): Database => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);

  const defaultDB: Database = {
    users: [
      { id: 'u1', name: 'Kochi Customer', email: 'customer@test.com', phone: '9876543210', role: UserRole.CUSTOMER, isOnboarded: true },
      { id: 'u2', name: 'Abraham (Tailor)', email: 'tailor@test.com', phone: '8876543210', role: UserRole.TAILOR, isOnboarded: true },
      { id: 'u3', name: 'Bee Rider', email: 'rider@test.com', phone: '7776543210', role: UserRole.DELIVERY, isOnboarded: true },
    ],
    orders: [],
    tailors: [
      { id: 'u2', name: 'Vogue Stitch Kochi', ownerName: 'Abraham K.', address: 'Panampilly Nagar', specialization: ['1', '2'], rating: 4.8, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], workingHours: '9am - 6pm' },
      { id: 't2', name: 'Elite Cleaners', ownerName: 'Sara John', address: 'Edapally', specialization: ['4'], rating: 4.6, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], workingHours: '10am - 8pm' },
    ],
    catalogueCategories: [
      { id: 'c1', tailorId: 'u2', name: 'Wedding Blouses' },
      { id: 'c2', tailorId: 'u2', name: 'Gents Suits' }
    ],
    catalogueItems: [
      { id: 'i1', tailorId: 'u2', categoryId: 'c1', name: 'Classic Silk Blouse', description: 'Hand embroidered edges with silk piping.', imageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=400' },
      { id: 'i2', tailorId: 'u2', categoryId: 'c1', name: 'Zardozi Work Blouse', description: 'Intricate gold thread work.', imageUrl: 'https://images.unsplash.com/photo-1610030469915-9a08da39d6ff?q=80&w=400' }
    ]
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDB));
  return defaultDB;
};

export const storageService = {
  getDB: () => initializeDB(),
  
  saveOrder: (order: Order) => {
    const db = initializeDB();
    db.orders.unshift(order);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return order;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus, extraData: Partial<Order> = {}) => {
    const db = initializeDB();
    const index = db.orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      db.orders[index] = { 
        ...db.orders[index], 
        status, 
        ...extraData,
        updatedAt: new Date().toISOString() 
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  },

  getCatalogueByTailor: (tailorId: string) => {
    const db = initializeDB();
    const categories = db.catalogueCategories.filter(c => c.tailorId === tailorId);
    const items = db.catalogueItems.filter(i => i.tailorId === tailorId);
    return { categories, items };
  },

  getOrdersByCustomer: (customerId: string) => {
    return initializeDB().orders.filter(o => o.customerId === customerId);
  },

  getOrdersByTailor: (tailorId: string) => {
    return initializeDB().orders.filter(o => o.tailorId === tailorId);
  },

  getOrdersByStatus: (statuses: OrderStatus[]) => {
    return initializeDB().orders.filter(o => statuses.includes(o.status));
  }
};
