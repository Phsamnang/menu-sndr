"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo } from "react";

interface MenuItem {
  href: string;
  title: string;
  description: string;
  allowedRoles: string[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
  icon: string;
}

export default function AdminPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const userRole = user?.role.name;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuSections: MenuSection[] = [
    {
      title: "មីនុយ",
      icon: "📋",
      items: [
        { href: "/admin/categories", title: "ប្រភេទម្ហូប", description: "គ្រប់គ្រងប្រភេទ", allowedRoles: ["admin"] },
        { href: "/admin/table-types", title: "ប្រភេទតុ", description: "គ្រប់គ្រងប្រភេទតុ", allowedRoles: ["admin"] },
        { href: "/admin/tables", title: "តុ", description: "គ្រប់គ្រងតុ", allowedRoles: ["admin"] },
        { href: "/admin/menu-items", title: "មុខម្ហូប", description: "គ្រប់គ្រងមុខម្ហូប", allowedRoles: ["admin"] },
        { href: "/admin/recipe-items", title: "រូបមន្ត", description: "គ្រប់គ្រងរូបមន្ត", allowedRoles: ["admin"] },
      ],
    },
    {
      title: "លក់",
      icon: "💳",
      items: [
        { href: "/admin/orders", title: "លក់", description: "គ្រប់គ្រងការលក់", allowedRoles: ["admin", "order"] },
        { href: "/admin/sales", title: "ការលក់", description: "ស្ថិតិលក់", allowedRoles: ["admin"] },
        { href: "/admin/promotions", title: "ការផ្តល់ជូន", description: "គ្រប់គ្រងប្រូម៉ូશន", allowedRoles: ["admin"] },
        { href: "/admin/daily-summaries", title: "សង្ខេប", description: "សង្ខេបប្រចាំថ្ងៃ", allowedRoles: ["admin"] },
      ],
    },
    {
      title: "ផលិតផល",
      icon: "📦",
      items: [
        { href: "/admin/units", title: "ឯកតា", description: "គ្រប់គ្រងឯកតា", allowedRoles: ["admin"] },
        { href: "/admin/products", title: "ផលិតផល", description: "គ្រប់គ្រងផលិតផល", allowedRoles: ["admin"] },
        { href: "/admin/inventory", title: "ស្តុក", description: "គ្រប់គ្រងស្តុក", allowedRoles: ["admin"] },
        { href: "/admin/expenses", title: "ចំណាយ", description: "គ្រប់គ្រងចំណាយ", allowedRoles: ["admin"] },
      ],
    },
    {
      title: "ការកំណត់",
      icon: "⚙️",
      items: [
        { href: "/admin/users", title: "អ្នកប្រើប្រាស់", description: "គ្រប់គ្រងគណនី", allowedRoles: ["admin"] },
        { href: "/admin/shop-info", title: "ហាង", description: "ព័ត៌មានហាង", allowedRoles: ["admin"] },
      ],
    },
  ];

  const roleSpecificItems: MenuItem[] = [
    { href: "/admin/chef", title: "ចម្អិន", description: "ការបញ្ជាទិញចម្អិន", allowedRoles: ["admin", "chef"] },
    { href: "/admin/delivery", title: "ដឹក", description: "ការដឹកជញ្ជូន", allowedRoles: ["admin", "waiter", "order"] },
  ];

  const quickAccessItems: MenuItem[] = [
    { href: "/", title: "មើលមីនុយ", description: "មើលមីនុយអតិថិជន", allowedRoles: ["admin", "chef", "waiter", "order"] },
  ];

  const filterItemsByRole = (items: MenuItem[]) =>
    items.filter((item) => item.allowedRoles.includes(userRole || ""));

  const sidebarSections = useMemo(() => {
    return menuSections
      .map((s) => ({ ...s, items: filterItemsByRole(s.items) }))
      .filter((s) => s.items.length > 0);
  }, [userRole]);

  const roleNavItems = useMemo(() => filterItemsByRole(roleSpecificItems), [userRole]);

  const navLinkClass = (href: string) => {
    const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
    return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
      active
        ? "bg-primary/10 text-primary shadow-sm"
        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(20rem,90vw)] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-72 lg:shadow-none overflow-hidden ${
          sidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-bold text-slate-800 truncate hover:text-primary transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <span className="text-xl">📊</span>
            <span className="hidden sm:inline">ផ្ទាំង</span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-2">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <div className="mb-3 flex items-center gap-2 px-3 pt-2 pb-1">
                <span className="text-lg">{section.icon}</span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={navLinkClass(item.href)}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{item.title}</div>
                        <div className="text-xs text-slate-500 truncate hidden sm:block">{item.description}</div>
                      </span>
                      <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {roleNavItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="mb-3 flex items-center gap-2 px-3 pb-1">
                <span className="text-lg">👥</span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  ការងារ
                </h3>
              </div>
              <ul className="space-y-1">
                {roleNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={navLinkClass(item.href)}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">{item.title}</div>
                        <div className="text-xs text-slate-500 truncate hidden sm:block">{item.description}</div>
                      </span>
                      <svg className="h-4 w-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* User and Logout */}
        <div className="border-t border-slate-200 p-3 space-y-3">
          {user && (
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-slate-50 px-3 py-3 border border-blue-100">
              <p className="truncate text-sm font-semibold text-slate-800">{user.username}</p>
              <p className="truncate text-xs text-slate-500 mt-0.5">{user.role.displayName}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white px-3 py-2.5 text-sm font-medium transition-colors active:bg-primary/80"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            ចេញ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="truncate text-lg font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រង</h1>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {/* Desktop Header */}
            <div className="mb-8 hidden lg:block">
              <h1 className="text-3xl font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រង</h1>
              <p className="mt-2 text-slate-600">ជ្រើសរើសពីមីនុយខាងឆ្វេង ឬផ្សេងទៀត</p>
            </div>

            {/* Quick Access */}
            {filterItemsByRole(quickAccessItems).length > 0 && (
              <section className="mb-12">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">ដំណើរការលឿន</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filterItemsByRole(quickAccessItems).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex min-h-[120px] flex-col justify-between rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:translate-y-0"
                    >
                      <div>
                        <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-blue-100">{item.description}</p>
                      </div>
                      <div className="flex justify-end pt-3 opacity-70 group-hover:opacity-100 transition-opacity">
                        <svg className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Welcome Card */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-slate-800">សូមស្វាគមន៍</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                ប្រើប្រាស់មីនុយខាងឆ្វេងដើម្បីចូលទៅកាន់ផ្នែកគ្រប់គ្រងផ្សេងៗ។ លើទូរស័ព្ទ ចុចប៊ូតុងឯកសារខាងលើដើម្បីបើកមីនុយ។
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
