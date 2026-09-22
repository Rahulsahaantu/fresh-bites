import type { ApiResponse, Food, Order } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

let globalToken: string | null = null;

export const api = {
  setToken: (token: string | null) => {
    globalToken = token;
  },
};

// ---------------------------------------------------------------------------
// Generic fetch wrapper
// ---------------------------------------------------------------------------
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string> || {}),
    };
    
    if (globalToken) {
      headers["Authorization"] = `Bearer ${globalToken}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: json.message || `HTTP ${res.status} error`,
        data: null as T,
      };
    }

    return json as ApiResponse<T>;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      message: "Network error. Please check your connection.",
      data: null as T,
    };
  }
}

// ---------------------------------------------------------------------------
// Foods API
// ---------------------------------------------------------------------------
export async function getFoods(params?: {
  category?: string;
  search?: string;
  sort?: string;
  limit?: number;
}): Promise<ApiResponse<Food[]>> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return apiFetch<Food[]>(`/api/foods${query ? `?${query}` : ""}`, {
    next: { revalidate: 60 },
  } as RequestInit);
}

export async function getFoodById(id: string): Promise<ApiResponse<Food>> {
  return apiFetch<Food>(`/api/foods/${id}`, {
    next: { revalidate: 60 },
  } as RequestInit);
}

// ---------------------------------------------------------------------------
// Categories API
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<ApiResponse<string[]>> {
  return apiFetch<string[]>("/api/categories", {
    next: { revalidate: 300 },
  } as RequestInit);
}

// ---------------------------------------------------------------------------
// Orders API
// ---------------------------------------------------------------------------
export async function createOrder(orderData: {
  items: { foodId: string; name: string; price: number; quantity: number; image?: string }[];
  customer: { name: string; email?: string; phone: string; address: string };
  subtotal: number;
  deliveryFee: number;
  total: number;
}): Promise<ApiResponse<Order & { orderId: string }>> {
  return apiFetch<Order & { orderId: string }>("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
    cache: "no-store",
  });
}

export async function getOrderById(id: string): Promise<ApiResponse<Order>> {
  return apiFetch<Order>(`/api/orders/${id}`, { cache: "no-store" });
}

export async function getOrders(): Promise<ApiResponse<Order[]>> {
  return apiFetch<Order[]>("/api/orders", { cache: "no-store" });
}

export async function updateOrderStatus(id: string, status: string): Promise<ApiResponse<any>> {
  return apiFetch<any>(`/api/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
    cache: "no-store",
  });
}

// ---------------------------------------------------------------------------
// Auth API
// ---------------------------------------------------------------------------
export async function loginUser(credentials: any): Promise<ApiResponse<any>> {
  return apiFetch<any>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    cache: "no-store",
  });
}

export async function registerUser(userData: any): Promise<ApiResponse<any>> {
  return apiFetch<any>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
    cache: "no-store",
  });
}

export async function getMe(): Promise<ApiResponse<any>> {
  return apiFetch<any>("/api/auth/me", { cache: "no-store" });
}

export async function updateProfile(data: any): Promise<ApiResponse<any>> {
  return apiFetch<any>("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
    cache: "no-store",
  });
}

// ---------------------------------------------------------------------------
// Upload API
// ---------------------------------------------------------------------------
export async function uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
  const formData = new FormData();
  formData.append("image", file);

  const url = `${API_BASE}/api/upload`;
  const headers: Record<string, string> = {};
  if (globalToken) {
    headers["Authorization"] = `Bearer ${globalToken}`;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || "Upload failed", data: null as any };
    }
    return json as ApiResponse<{ url: string }>;
  } catch (error) {
    console.error("Upload error:", error);
    return { success: false, message: "Network error during upload", data: null as any };
  }
}

export async function getMyFoods(): Promise<ApiResponse<Food[]>> {
  return apiFetch<Food[]>("/api/foods/my-foods", { cache: "no-store" });
}
