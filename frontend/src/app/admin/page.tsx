"use client";

import { useEffect, useState } from "react";
import { getOrders, getFoods } from "@/lib/api";
import { FiShoppingBag, FiDollarSign, FiList } from "react-icons/fi";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalFoods: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [ordersRes, foodsRes] = await Promise.all([
          getOrders(),
          getFoods()
        ]);

        const orders = ordersRes.success ? ordersRes.data : [];
        const foods = foodsRes.success ? foodsRes.data : [];

        const revenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

        setStats({
          totalOrders: orders.length,
          totalRevenue: revenue,
          totalFoods: foods.length,
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-white h-64 rounded-2xl"></div>;
  }

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders, icon: <FiShoppingBag className="w-8 h-8 text-orange-500" />, color: "bg-orange-50" },
    { label: "Total Revenue", value: `৳${stats.totalRevenue.toLocaleString()}`, icon: <FiDollarSign className="w-8 h-8 text-green-500" />, color: "bg-green-50" },
    { label: "Menu Items", value: stats.totalFoods, icon: <FiList className="w-8 h-8 text-blue-500" />, color: "bg-blue-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your restaurant's performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/foods/new"
            className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-colors border border-gray-100 group"
          >
            <div className="bg-white p-3 rounded-full shadow-sm group-hover:shadow text-gray-600 group-hover:text-orange-500 mb-3">
              <FiList className="w-6 h-6" />
            </div>
            <span className="font-medium text-gray-700 group-hover:text-orange-600">Add Food Item</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
