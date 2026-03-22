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
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile-first: closed on mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0">
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-slate-200 px-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">MENU</div>
            <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? "bg-primary text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className="font-medium text-sm">{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="border-t border-slate-200 p-3 space-y-3 flex-shrink-0">
          {user && (
            <div className="px-4 py-2 bg-slate-50 rounded-lg text-center">
              <p className="text-xs font-semibold text-slate-700 truncate">
                {user.username}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.role.displayName}</p>
            </div>
          )}

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
            <span className="text-sm">ចេញ</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer - Shown on mobile when menu is open */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-40 transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-slate-200 px-4 flex-shrink-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">MENU</div>
            <p className="text-xs text-slate-500 mt-1">Admin Panel</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                isActive(item.href)
                  ? "bg-primary text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <span className="font-medium text-sm">{item.title}</span>
            </Link>
          ))}
        </nav>

        {/* User Info & Actions */}
        <div className="border-t border-slate-200 p-3 space-y-3 flex-shrink-0">
          {user && (
            <div className="px-4 py-2 bg-slate-50 rounded-lg text-center">
              <p className="text-xs font-semibold text-slate-700 truncate">
                {user.username}
              </p>
              <p className="text-xs text-slate-500 truncate">{user.role.displayName}</p>
            </div>
          )}

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
            <span className="text-sm">ចេញ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header with Menu Button */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6 text-slate-700"
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
          </button>
          <h1 className="text-xl font-bold text-slate-800">MENU</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
