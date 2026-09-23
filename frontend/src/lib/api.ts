import type { ApiResponse, Food, Order } from "./types";
import { fallbackFoods, fallbackCategories } from "./fallbackData";

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
  try {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set("category", params.category);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sort) searchParams.set("sort", params.sort);
    if (params?.limit) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    const res = await apiFetch<Food[]>(`/api/foods${query ? `?${query}` : ""}`, {
      next: { revalidate: 60 },
    } as RequestInit);

    if (res.success && res.data && res.data.length > 0) {
      return res;
    }
  } catch (e) {
    console.warn("Falling back to local food data");
  }

  // Graceful fallback for production/demo when backend is not connected
  let filtered = [...fallbackFoods];
  if (params?.category && params.category.toLowerCase() !== "all") {
    filtered = filtered.filter(
      (f) => f.category.toLowerCase() === params.category!.toLowerCase()
    );
  }
  if (params?.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (f) =>
        f.name.toLowerCase().includes(s) ||
        f.description.toLowerCase().includes(s)
    );
  }
  if (params?.limit) {
    filtered = filtered.slice(0, params.limit);
  }

  return {
    success: true,
    message: "Loaded from cache/fallback",
    data: filtered,
  };
}

export async function getFoodById(id: string): Promise<ApiResponse<Food>> {
  try {
    const res = await apiFetch<Food>(`/api/foods/${id}`, {
      next: { revalidate: 60 },
    } as RequestInit);
    if (res.success && res.data) return res;
  } catch (e) {}

  const found =
    fallbackFoods.find((f) => f._id === id || f._id === `food-${id}`) ||
    fallbackFoods[0];
  return {
    success: true,
    message: "Loaded from fallback",
    data: found,
  };
}

// ---------------------------------------------------------------------------
// Categories API
// ---------------------------------------------------------------------------
export async function getCategories(): Promise<ApiResponse<string[]>> {
  try {
    const res = await apiFetch<string[]>("/api/categories", {
      next: { revalidate: 300 },
    } as RequestInit);
    if (res.success && res.data && res.data.length > 0) return res;
  } catch (e) {}

  return {
    success: true,
    message: "Loaded fallback categories",
    data: fallbackCategories,
  };
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
}): Promise<ApiResponse<Order & { orderId: string; paymentUrl?: string }>> {
  return apiFetch<Order & { orderId: string; paymentUrl?: string }>("/api/orders", {
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
function compressImage(file: File, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

export async function uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
  try {
    const compressed = await compressImage(file);
    return {
      success: true,
      message: "File uploaded successfully",
      data: { url: compressed },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      message: "Error processing image",
      data: null as any,
    };
  }
}

export async function getMyFoods(): Promise<ApiResponse<Food[]>> {
  return apiFetch<Food[]>("/api/foods/my-foods", { cache: "no-store" });
}
