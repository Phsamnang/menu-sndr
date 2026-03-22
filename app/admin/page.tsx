"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItem {
  href: string;
  title: string;
  icon: string;
  allowedRoles: string[];
}

export default function AdminPage() {
  const { user } = useAuth();
  const userRole = user?.role.name;

  const menuItems: MenuItem[] = [
    { href: "/admin/orders", title: "លក់", icon: "💳", allowedRoles: ["admin", "order"] },
    { href: "/admin/categories", title: "មីនុយ", icon: "📋", allowedRoles: ["admin"] },
    { href: "/admin/menu-items", title: "មុខម្ហូប", icon: "🍽️", allowedRoles: ["admin"] },
    { href: "/admin/tables", title: "តុ", icon: "🪑", allowedRoles: ["admin"] },
    { href: "/admin/sales", title: "ការលក់", icon: "📊", allowedRoles: ["admin"] },
    { href: "/admin/chef", title: "ចម្អិន", icon: "👨‍🍳", allowedRoles: ["admin", "chef"] },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.allowedRoles.includes(userRole || "")
  );

  return (
    <>
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-30">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រង</h1>
            <p className="text-sm text-slate-500 mt-1">ស្វាគមន៍ ឡើងវិញ, {user?.username}!</p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="ស្វាគមន៍..."
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">លក់ថ្ងៃនេះ</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">$1,234</p>
                </div>
                <div className="text-3xl">💳</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">លក់សរុប</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">456</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">តុលែង</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">12</p>
                </div>
                <div className="text-3xl">🪑</div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">អ្នកប្រើប្រាស់</p>
                  <p className="text-2xl font-bold text-slate-800 mt-2">8</p>
                </div>
                <div className="text-3xl">👤</div>
              </div>
            </div>
          </div>

          {/* Main Navigation Cards */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">ទៅដែលស្ថិតនៅ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-white rounded-lg border border-slate-200 hover:border-primary hover:shadow-lg transition-all p-6 flex items-start gap-4 group"
                >
                  <div className="text-4xl">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">ចូលទៅក្នុងផ្នែក</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
