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
      bgColor: "blue",
      items: [
        {
          href: "/admin/categories",
          title: "ប្រភេទម្ហូប",
          description: "គ្រប់គ្រងប្រភេទមីនុយ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/table-types",
          title: "ប្រភេទតុ",
          description: "គ្រប់គ្រងប្រភេទតុ និងតម្លៃ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/tables",
          title: "តុ",
          description: "គ្រប់គ្រងតុ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/menu-items",
          title: "មុខម្ហូប",
          description: "គ្រប់គ្រងមុខម្ហូប",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/recipe-items",
          title: "រូបមន្ត",
          description: "គ្រប់គ្រងរូបមន្តមុខម្ហូប",
          allowedRoles: ["admin"],
        },
      ],
    },
    {
      title: "លក់",
      icon: "💳",
      bgColor: "blue",
      items: [
        {
          href: "/admin/orders",
          title: "លក់",
          description: "គ្រប់គ្រងការបញ្ជាទិញ",
          allowedRoles: ["admin", "order"],
        },
        // {
        //   href: "/admin/reservations",
        //   title: "ការកក់តុ",
        //   description: "គ្រប់គ្រងការកក់តុ",
        //   allowedRoles: ["admin", "order"],
        // },
        // {
        //   href: "/admin/customers",
        //   title: "អតិថិជន",
        //   description: "គ្រប់គ្រងអតិថិជន",
        //   allowedRoles: ["admin"],
        // },
        {
          href: "/admin/sales",
          title: "គ្រប់គ្រងការលក់",
          description: "មើលការបញ្ជាទិញ និងចំណូល",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/promotions",
          title: "ការផ្តល់ជូន",
          description: "គ្រប់គ្រងការផ្តល់ជូន និងការបញ្ចុះតម្លៃ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/daily-summaries",
          title: "សង្ខេបប្រចាំថ្ងៃ",
          description: "មើលសង្ខេបអាជីវកម្មប្រចាំថ្ងៃ",
          allowedRoles: ["admin"],
        },
      ],
    },
    // {
    //   title: "ផលិតផល & ចំណាយ",
    //   icon: "📦",
    //   bgColor: "blue",
    //   items: [
    //     {
    //       // Units management - Define measurement units (kg, liter, piece, etc) used throughout the system
    //       href: "/admin/units",
    //       title: "គ្រប់គ្រងឯកតា",
    //       description: "គ្រប់គ្រងឯកតាវាស់វែង",
    //       allowedRoles: ["admin"],
    //     },
    //     {
    //       // Unit conversions - Convert between different units (e.g., 1kg = 1000g)
    //       href: "/admin/unit-conversions",
    //       title: "ការបម្លែងឯកតា",
    //       description: "គ្រប់គ្រងការបម្លែងឯកតា",
    //       allowedRoles: ["admin"],
    //     },
    //     {
    //       // Products inventory - Manage raw materials and products used in recipes and operations
    //       href: "/admin/products",
    //       title: "គ្រប់គ្រងផលិតផល",
    //       description: "គ្រប់គ្រងផលិតផលសម្រាប់ចំណាយ",
    //       allowedRoles: ["admin"],
    //     },
    //     {
    //       // Stock/Inventory levels - Track current quantity of products in stock
    //       href: "/admin/inventory",
    //       title: "ស្តុក",
    //       description: "គ្រប់គ្រងស្តុកផលិតផល",
    //       allowedRoles: ["admin"],
    //     },
    //     {
    //       // Stock movements - View history of product additions, removals, and adjustments
    //       href: "/admin/stock-movements",
    //       title: "ចលនាស្តុក",
    //       description: "មើលចលនាស្តុក",
    //       allowedRoles: ["admin"],
    //     },
    //     {
    //       // Expenses - Record and manage business expenses (utilities, rent, salaries, etc)
    //       href: "/admin/expenses",
    //       title: "គ្រប់គ្រងចំណាយ",
    //       description: "គ្រប់គ្រងចំណាយលម្អិត",
    //       allowedRoles: ["admin"],
    //     },
    //   ],
    // },
    {
      title: "ការកំណត់",
      icon: "⚙️",
      bgColor: "blue",
      items: [
        {
          href: "/admin/users",
          title: "អ្នកប្រើប្រាស់",
          description: "គ្រប់គ្រងអ្នកប្រើប្រាស់",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/shop-info",
          title: "ព័ត៌មានហាង",
          description: "គ្រប់គ្រងព័ត៌មានហាង",
          allowedRoles: ["admin"],
        },
        // {
        //   href: "/admin/exchange-rates",
        //   title: "អត្រាប្តូរប្រាក់",
        //   description: "គ្រប់គ្រងអត្រាប្តូរប្រាក់",
        //   allowedRoles: ["admin"],
        // },
      ],
    },
  ];

  const roleSpecificItems: MenuItem[] = [
    {
      href: "/admin/chef",
      title: "ចម្អិន",
      description: "ការបញ្ជាទិញសម្រាប់ចម្អិន",
      allowedRoles: ["admin", "chef"],
    },
    {
      href: "/admin/delivery",
      title: "ការដឹកជញ្ជូន",
      description: "មុខម្ហូបរួចរាល់សម្រាប់ដឹក",
      allowedRoles: ["admin", "waiter", "order"],
    },
  ];

  const quickAccessItems: MenuItem[] = [
    {
      href: "/",
      title: "មើលមីនុយ",
      description: "មើលមី��ុយអតិថិជន",
      allowedRoles: ["admin", "chef", "waiter", "order"],
    },
  ];

  const filterItemsByRole = (items: MenuItem[]) =>
    items.filter((item) => item.allowedRoles.includes(userRole || ""));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រង</h1>
            <div className="flex items-center gap-3 sm:gap-6">
              {user && (
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-800">{user.username}</p>
                  <p className="text-xs text-slate-500">{user.role.displayName}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-xs sm:text-sm font-medium min-h-[40px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>ចេញ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Quick Access Section */}
        {filterItemsByRole(quickAccessItems).length > 0 && (
          <section className="mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-5">ដំណើរការលឿន</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filterItemsByRole(quickAccessItems).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:translate-y-0 min-h-[140px] flex flex-col justify-between group"
                >
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex justify-end pt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Main Menu Sections */}
        <div className="space-y-14">
          {menuSections.map((section) => {
            const filteredItems = filterItemsByRole(section.items);
            if (filteredItems.length === 0) return null;

            return (
              <section key={section.title}>
                <div className="flex items-center gap-4 mb-7">
                  <span className="text-4xl flex-shrink-0">{section.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{section.title}</h2>
                    <div className="h-1.5 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:translate-y-0 group min-h-[130px] flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors text-base leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex justify-end pt-4 text-slate-400 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Role Specific Section */}
          {filterItemsByRole(roleSpecificItems).length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-7">
                <span className="text-4xl flex-shrink-0">👥</span>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">ការងារ</h2>
                  <div className="h-1.5 bg-gradient-to-r from-blue-400 to-transparent rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filterItemsByRole(roleSpecificItems).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 active:translate-y-0 group min-h-[130px] flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors text-base leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex justify-end pt-4 text-slate-400 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
