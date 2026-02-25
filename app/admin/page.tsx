"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface MenuItem {
  href: string;
  title: string;
  description: string;
  allowedRoles: string[];
  icon?: string;
  color?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  icon: string;
  bgColor: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const userRole = user?.role.name;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuSections: MenuSection[] = [
    {
      title: "មីនុយ",
      icon: "📋",
      bgColor: "from-purple-500 to-purple-600",
      items: [
        {
          href: "/admin/categories",
          title: "ប្រភេទម្ហូប",
          description: "គ្រប់គ្រងប្រភេទមីនុយ",
          allowedRoles: ["admin"],
          color: "purple",
        },
        {
          href: "/admin/table-types",
          title: "ប្រភេទតុ",
          description: "គ្រប់គ្រងប្រភេទតុ និងតម្លៃ",
          allowedRoles: ["admin"],
          color: "purple",
        },
        {
          href: "/admin/tables",
          title: "តុ",
          description: "គ្រប់គ្រងតុ",
          allowedRoles: ["admin"],
          color: "purple",
        },
        {
          href: "/admin/menu-items",
          title: "មុខម្ហូប",
          description: "គ្រប់គ្រងមុខម្ហូប",
          allowedRoles: ["admin"],
          color: "purple",
        },
        {
          href: "/admin/recipe-items",
          title: "រូបមន្ត",
          description: "គ្រប់គ្រងរូបមន្តមុខម្ហូប",
          allowedRoles: ["admin"],
          color: "purple",
        },
      ],
    },
    {
      title: "លក់",
      icon: "💳",
      bgColor: "from-emerald-500 to-emerald-600",
      items: [
        {
          href: "/admin/orders",
          title: "លក់",
          description: "គ្រប់គ្រងការបញ្ជាទិញ",
          allowedRoles: ["admin", "order"],
          color: "emerald",
        },
        {
          href: "/admin/reservations",
          title: "ការកក់តុ",
          description: "គ្រប់គ្រងការកក់តុ",
          allowedRoles: ["admin", "order"],
          color: "emerald",
        },
        {
          href: "/admin/customers",
          title: "អតិថិជន",
          description: "គ្រប់គ្រងអតិថិជន",
          allowedRoles: ["admin"],
          color: "emerald",
        },
        {
          href: "/admin/sales",
          title: "គ្រប់គ្រងការលក់",
          description: "មើលការបញ្ជាទិញ និងចំណូល",
          allowedRoles: ["admin"],
          color: "emerald",
        },
        {
          href: "/admin/promotions",
          title: "ការផ្តល់ជូន",
          description: "គ្រប់គ្រងការផ្តល់ជូន និងការបញ្ចុះតម្លៃ",
          allowedRoles: ["admin"],
          color: "emerald",
        },
        {
          href: "/admin/daily-summaries",
          title: "សង្ខេបប្រចាំថ្ងៃ",
          description: "មើលសង្ខេបអាជីវកម្មប្រចាំថ្ងៃ",
          allowedRoles: ["admin"],
          color: "emerald",
        },
      ],
    },
    {
      title: "ផលិតផល & ចំណាយ",
      icon: "📦",
      bgColor: "from-orange-500 to-orange-600",
      items: [
        {
          href: "/admin/units",
          title: "គ្រប់គ្រងឯកតា",
          description: "គ្រប់គ្រងឯកតាវាស់វែង",
          allowedRoles: ["admin"],
          color: "orange",
        },
        {
          href: "/admin/unit-conversions",
          title: "ការបម្លែងឯកតា",
          description: "គ្រប់គ្រងការបម្លែងឯកតា",
          allowedRoles: ["admin"],
          color: "orange",
        },
        {
          href: "/admin/products",
          title: "គ្រប់គ្រងផលិតផល",
          description: "គ្រប់គ្រងផលិតផលសម្រាប់ចំណាយ",
          allowedRoles: ["admin"],
          color: "orange",
        },
        {
          href: "/admin/inventory",
          title: "ស្តុក",
          description: "គ្រប់គ្រងស្តុកផលិតផល",
          allowedRoles: ["admin"],
          color: "orange",
        },
        {
          href: "/admin/stock-movements",
          title: "ចលនាស្តុក",
          description: "មើលចលនាស្តុក",
          allowedRoles: ["admin"],
          color: "orange",
        },
        {
          href: "/admin/expenses",
          title: "គ្រប់គ្រងចំណាយ",
          description: "គ្រប់គ្រងចំណាយលម្អិត",
          allowedRoles: ["admin"],
          color: "orange",
        },
      ],
    },
    {
      title: "ការកំណត់",
      icon: "⚙️",
      bgColor: "from-slate-500 to-slate-600",
      items: [
        {
          href: "/admin/users",
          title: "អ្នកប្រើប្រាស់",
          description: "គ្រប់គ្រងអ្នកប្រើប្រាស់",
          allowedRoles: ["admin"],
          color: "slate",
        },
        {
          href: "/admin/shop-info",
          title: "ព័ត៌មានហាង",
          description: "គ្រប់គ្រងព័ត៌មានហាង",
          allowedRoles: ["admin"],
          color: "slate",
        },
        {
          href: "/admin/exchange-rates",
          title: "អត្រាប្តូរប្រាក់",
          description: "គ្រប់គ្រងអត្រាប្តូរប្រាក់",
          allowedRoles: ["admin"],
          color: "slate",
        },
      ],
    },
  ];

  const roleSpecificItems: MenuItem[] = [
    {
      href: "/admin/chef",
      title: "ចម្អិន",
      description: "ការបញ្ជាទិញសម្រាប់ចម្អិន",
      allowedRoles: ["admin", "chef"],
      color: "amber",
    },
    {
      href: "/admin/delivery",
      title: "ការដឹកជញ្ជូន",
      description: "មុខម្ហូបរួចរាល់សម្រាប់ដឹក",
      allowedRoles: ["admin", "waiter", "order"],
      color: "blue",
    },
  ];

  const quickAccessItems: MenuItem[] = [
    {
      href: "/",
      title: "មើលមីនុយ",
      description: "មើលមីនុយអតិថិជន",
      allowedRoles: ["admin", "chef", "waiter", "order"],
      color: "cyan",
    },
  ];

  const filterItemsByRole = (items: MenuItem[]) =>
    items.filter((item) => item.allowedRoles.includes(userRole || ""));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-950/50 border-b border-slate-700/50 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                ផ្ទាំងគ្រប់គ្រង
              </h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-sm text-slate-400 hidden sm:inline">
                  {user.username} <span className="text-cyan-400">({user.role.displayName})</span>
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">ចេញ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Access */}
        {filterItemsByRole(quickAccessItems).length > 0 && (
          <div className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filterItemsByRole(quickAccessItems).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg p-6 transition-all hover:shadow-xl hover:scale-105 group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold">{item.title}</h2>
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <p className="text-cyan-100 text-sm">{item.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Menu Sections */}
        <div className="space-y-10">
          {menuSections.map((section) => {
            const filteredItems = filterItemsByRole(section.items);
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{section.icon}</span>
                  <h2 className="text-2xl font-bold text-slate-100">{section.title}</h2>
                  <div className={`h-1 flex-1 bg-gradient-to-r ${section.bgColor} rounded-full`}></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group relative bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-lg p-5 transition-all hover:shadow-xl hover:shadow-slate-900/50"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${section.bgColor} rounded-lg opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                      <div className="relative">
                        <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-slate-50 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                          {item.description}
                        </p>
                        <div className="mt-3 flex items-center text-xs font-medium text-slate-500 group-hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
                          <span>ចូល</span>
                          <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Role Specific */}
          {filterItemsByRole(roleSpecificItems).length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">👥</span>
                <h2 className="text-2xl font-bold text-slate-100">ការងារ</h2>
                <div className="h-1 flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filterItemsByRole(roleSpecificItems).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 hover:border-slate-600 rounded-lg p-5 transition-all hover:shadow-xl hover:shadow-slate-900/50"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity"></div>
                    <div className="relative">
                      <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-slate-50 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                        {item.description}
                      </p>
                      <div className="mt-3 flex items-center text-xs font-medium text-slate-500 group-hover:text-slate-400 transition-colors opacity-0 group-hover:opacity-100">
                        <span>ចូល</span>
                        <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
