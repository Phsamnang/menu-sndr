"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface MenuItem {
  href: string;
  title: string;
  icon: string;
  allowedRoles: string[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userRole = user?.role.name;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems: MenuItem[] = [
    { href: "/admin/orders", title: "លក់", icon: "💳", allowedRoles: ["admin", "order"] },
    { href: "/admin/categories", title: "មីនុយ", icon: "📋", allowedRoles: ["admin"] },
    { href: "/admin/menu-items", title: "មុខម្ហូប", icon: "🍽️", allowedRoles: ["admin"] },
    { href: "/admin/tables", title: "តុ", icon: "🪑", allowedRoles: ["admin"] },
    { href: "/admin/sales", title: "ការលក់", icon: "📊", allowedRoles: ["admin"] },
    { href: "/admin/chef", title: "ចម្អិន", icon: "👨‍🍳", allowedRoles: ["admin", "chef"] },
    { href: "/admin/delivery", title: "ដឹក", icon: "🚚", allowedRoles: ["admin", "waiter", "order"] },
    { href: "/admin/users", title: "អ្នកប្រើប្រាស់", icon: "👤", allowedRoles: ["admin"] },
    { href: "/admin/shop-info", title: "ហាង", icon: "🏪", allowedRoles: ["admin"] },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.allowedRoles.includes(userRole || "")
  );

  const isActive = (href: string) => {
    if (href === "/admin" && pathname === "/admin") {
      return true;
    }
    if (href !== "/admin" && pathname.startsWith(href)) {
      return true;
    }
    return false;
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col flex-shrink-0`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-slate-200 px-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {sidebarOpen ? "MENU" : "M"}
            </div>
            {sidebarOpen && <p className="text-xs text-slate-500 mt-1">Admin Panel</p>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all whitespace-nowrap ${
                isActive(item.href)
                  ? "bg-primary text-white"
                  : "text-slate-700 hover:bg-slate-100"
              } ${sidebarOpen ? "justify-start" : "justify-center"}`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="font-medium text-sm">
                  {item.title}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="border-t border-slate-200 p-3 space-y-3 flex-shrink-0">
          {sidebarOpen && user && (
            <div className="px-4 py-2 bg-slate-50 rounded-lg text-center">
              <p className="text-xs font-semibold text-slate-700 truncate">
                {user.username}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.role.displayName}</p>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title={sidebarOpen ? "ហាក់ដង់" : "បង្ហាញ"}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            {sidebarOpen && <span className="text-sm">ហាក់ដង់</span>}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {sidebarOpen && <span className="text-sm">ចេញ</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
