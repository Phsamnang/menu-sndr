"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

interface MenuItem {
  href: string;
  title: string;
  icon: string;
  allowedRoles: string[];
  description?: string;
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems: MenuItem[] = [
    { href: "/admin/orders", title: "លក់", icon: "💳", allowedRoles: ["admin", "order"], description: "ប្រឹងការលក់" },
    { href: "/admin/categories", title: "មីនុយ", icon: "📋", allowedRoles: ["admin"], description: "ប្រឹងមីនុយ" },
    { href: "/admin/menu-items", title: "មុខម្ហូប", icon: "🍽️", allowedRoles: ["admin"], description: "ប្រឹងមុខម្ហូប" },
    { href: "/admin/tables", title: "តុ", icon: "🪑", allowedRoles: ["admin"], description: "ប្រឹងតុ" },
    { href: "/admin/sales", title: "ការលក់", icon: "📊", allowedRoles: ["admin"], description: "ដាក់ពិន្ទុលក់" },
    { href: "/admin/chef", title: "ចម្អិន", icon: "👨‍🍳", allowedRoles: ["admin", "chef"], description: "រលាក់ចម្អិន" },
    { href: "/admin/delivery", title: "ដឹក", icon: "🚚", allowedRoles: ["admin", "waiter", "order"], description: "ដឹកចែច" },
    { href: "/admin/users", title: "អ្នកប្រើប្រាស់", icon: "👤", allowedRoles: ["admin"], description: "គ្រប់គ្រងអ្នក" },
    { href: "/admin/shop-info", title: "ហាង", icon: "🏪", allowedRoles: ["admin"], description: "ព័ត៌មានហាង" },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.allowedRoles.includes(userRole || "")
  );

  useEffect(() => {
    const current = menuItems.find(
      (item) => item.href !== "/admin" && pathname.startsWith(item.href)
    );
    document.title = current ? `${current.title} | Menu System` : "Menu System";
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin" && pathname === "/admin") {
      return true;
    }
    if (href !== "/admin" && pathname.startsWith(href)) {
      return true;
    }
    return false;
  };

  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-white">M</span>
          </div>
          <div>
            <div className="font-bold text-slate-900">Menu System</div>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User Section */}
      {user && (
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-lg">{user.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.username}</p>
              <p className="text-xs text-slate-500 truncate">{user.role.displayName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        <div className="space-y-1.5">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                isActive(item.href)
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-tight">{item.title}</p>
                <p className={`text-xs leading-tight hidden lg:block ${
                  isActive(item.href) ? "text-primary-foreground/80" : "text-slate-500"
                }`}>
                  {item.description}
                </p>
              </div>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform ${
                  isActive(item.href) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors font-medium text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="hidden lg:inline">ចេញ</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-white flex-col flex-shrink-0 border-r border-slate-200 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-white flex flex-col z-40 transform transition-transform duration-300 shadow-xl lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-slate-900">Menu</h1>
          <div className="w-10" />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
