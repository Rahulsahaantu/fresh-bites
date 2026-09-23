"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/lib/api";
import { FiGrid } from "react-icons/fi";

export default function AdminCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await getCategories();
        if (res.success) {
          setCategories(res.data || []);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-white h-64 rounded-2xl"></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-500 mt-1">Manage your food categories.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No categories found. Start adding foods with categories!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((category, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-xl flex items-center gap-4 border border-gray-100">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <FiGrid className="w-5 h-5 text-orange-500" />
                </div>
                <span className="font-medium text-gray-800">{category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
