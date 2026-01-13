export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: string;
  menuItem: {
    id: string;
    name: string;
    image: string;
    isCook?: boolean;
    category: {
      displayName: string;
    };
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  tableId: string | null;
  customerName: string | null;
  status: string;
  discountType: string | null;
  discountValue: number | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  items: OrderItem[];
  createdAt?: string;
  table?: {
    id: string;
    number: string;
    name: string | null;
    tableType: {
      displayName: string;
    };
  };
}
