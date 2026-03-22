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
        { href: "/admin/categories", title: "ប្រភេទម្ហូប", description: "", allowedRoles: ["admin"] },
        { href: "/admin/table-types", title: "ប្រភេទតុ", description: "", allowedRoles: ["admin"] },
        { href: "/admin/tables", title: "តុ", description: "", allowedRoles: ["admin"] },
        { href: "/admin/menu-items", title: "មុខម្ហូប", description: "", allowedRoles: ["admin"] },
        { href: "/admin/recipe-items", title: "រូបមន្ត", description: "", allowedRoles: ["admin"] },
      ],
    },
    {
      title: "លក់",
      icon: "💳",
      items: [
        { href: "/admin/orders", title: "លក់", description: "", allowedRoles: ["admin", "order"] },
        { href: "/admin/sales", title: "គ្រប់គ្រងការលក់", description: "", allowedRoles: ["admin"] },
        { href: "/admin/promotions", title: "ការផ្តល់ជូន", description: "", allowedRoles: ["admin"] },
        { href: "/admin/daily-summaries", title: "សង្ខេបប្រចាំថ្ងៃ", description: "", allowedRoles: ["admin"] },
      ],
    },
    {
      title: "ការកំណត់",
      icon: "⚙️",
      items: [
        { href: "/admin/users", title: "អ្នកប្រើប្រាស់", description: "", allowedRoles: ["admin"] },
        { href: "/admin/shop-info", title: "ព័ត៌មានហាង", description: "", allowedRoles: ["admin"] },
      ],
    },
  ];

  const roleSpecificItems: MenuItem[] = [
    { href: "/admin/chef", title: "ចម្អិន", description: "", allowedRoles: ["admin", "chef"] },
    { href: "/admin/delivery", title: "ការដឹកជញ្ជូន", description: "", allowedRoles: ["admin", "waiter", "order"] },
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
    return `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      active
        ? "bg-primary/10 text-primary"
        : "text-slate-700 hover:bg-slate-100"
    }`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ease-out lg:static lg:z-0 lg:w-64 lg:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 lg:h-16">
          <Link href="/admin" className="font-bold text-slate-800 truncate" onClick={() => setSidebarOpen(false)}>
            ផ្ទាំងគ្រប់គ្រង
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

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sidebarSections.map((section) => (
            <div key={section.title} className="mb-6 last:mb-0">
              <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </div>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={navLinkClass(item.href)} onClick={() => setSidebarOpen(false)}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {roleNavItems.length > 0 && (
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <span>👥</span>
                <span>ការងារ</span>
              </div>
              <ul className="space-y-0.5">
                {roleNavItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={navLinkClass(item.href)} onClick={() => setSidebarOpen(false)}>
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="border-t border-slate-200 p-3">
          {user && (
            <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2">
              <p className="truncate text-sm font-medium text-slate-800">{user.username}</p>
              <p className="truncate text-xs text-slate-500">{user.role.displayName}</p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden">
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

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 hidden lg:block">
              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">ផ្ទាំងគ្រប់គ្រង</h1>
              <p className="mt-1 text-slate-600">ជ្រើសរើសពីមីនុយខាងឆ្វេង ឬដំណើរការលឿនខាងក្រោម</p>
            </div>

            {filterItemsByRole(quickAccessItems).length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">ដំណើរការលឿន</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {filterItemsByRole(quickAccessItems).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="group flex min-h-[120px] flex-col justify-between rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
                    >
                      <div>
                        <h3 className="mb-2 text-xl font-bold">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-blue-100">{item.description}</p>
                      </div>
                      <div className="flex justify-end pt-3 opacity-80 transition-opacity group-hover:opacity-100">
                        <svg className="h-6 w-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-2 text-lg font-semibold text-slate-800">សូមស្វាគមន៍</h2>
              <p className="text-sm text-slate-600">
                ប្រើប្រាស់មីនុយខាងឆ្វេងដើម្បីចូលទៅកាន់ផ្នែកគ្រប់គ្រង។ លើទូរស័ព្ទ ចុចរូបបីខ្សែខាងឆ្វេងខាងលើដើម្បីបើកមីនុយ។
              </p>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
