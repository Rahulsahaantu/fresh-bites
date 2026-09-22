// ---------------------------------------------------------------------------
// Food Types
// ---------------------------------------------------------------------------
export interface Food {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  rating: number;
  reviews?: number;
  tags?: string[];
  ingredients?: string[];
  restaurantName?: string;
  location?: string;
  createdAt?: string;
}

// ---------------------------------------------------------------------------
// Cart Types
// ---------------------------------------------------------------------------
export interface CartItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
}

// ---------------------------------------------------------------------------
// Order Types
// ---------------------------------------------------------------------------
export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderItem {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface Order {
  _id: string;
  orderId?: string;
  items: OrderItem[];
  customer: OrderCustomer;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: "pending" | "confirmed" | "preparing" | "delivered" | "cancelled";
  createdAt: string;
}

// ---------------------------------------------------------------------------
// API Response
// ---------------------------------------------------------------------------
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
