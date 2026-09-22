"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiHome, FiList, FiGrid, FiSettings } from "react-icons/fi";
import { cn } from "cn";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const sidebarLinks = [
    { label: "Dashboard", href: "/admin", icon: <FiHome className="h-5 w-5" /> },
    { label: "Orders", href: "/admin/orders", icon: <FiGrid className="h-5 w-5" /> },
    { label: "Manage Foods", href: "/admin/foods", icon: <FiList className="h-5 w-5" /> },
    { label: "Categories", href: "/admin/categories", icon: <FiGrid className="h-5 w-5" /> },
    { label: "Settings", href: "/admin/settings", icon: <FiSettings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex flex-1 overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Admin Panel</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your menu</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium",
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
