"use client";

import { useEffect, useState } from "react";
import { getMyFoods, api } from "@/lib/api";
import type { Food } from "@/lib/types";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

export default function AdminFoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoading: authLoading } = useAuth();

  const fetchFoods = async () => {
    setLoading(true);
    // Ensure token is set before making the request
    const token = localStorage.getItem("token");
    if (token) {
      api.setToken(token);
    }
    const res = await getMyFoods();
    if (res.success && res.data) {
      setFoods(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!authLoading) {
      fetchFoods();
    }
  }, [authLoading]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return;
    
    try {
      // Inline fetch for delete using the api Token logic
      const token = localStorage.getItem("token");
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/foods/${id}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setFoods(foods.filter(f => f._id !== id));
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      alert("Error deleting food");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Foods</h1>
          <p className="text-gray-500 mt-1">Add, edit, or remove items from your menu.</p>
        </div>
        <Link
          href="/admin/foods/new"
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <FiPlus />
          Add New Food
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading foods...</div>
        ) : foods.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No foods found. Click "Add New Food" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500 font-medium uppercase tracking-wider">
                  <th className="px-6 py-4">Food</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {foods.map((food) => (
                  <tr key={food._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden relative shrink-0">
                          <Image src={food.image} alt={food.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{food.name}</p>
                          <p className="text-xs text-gray-500 max-w-[200px] truncate">{food.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                        {food.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ৳{food.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {food.available !== false ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Out of stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/foods/${food._id}`} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                          <FiEdit2 className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(food._id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
