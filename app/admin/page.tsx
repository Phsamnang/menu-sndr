"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiClientJson } from "@/utils/api-client";

interface MenuItem {
  href: string;
  title: string;
  icon: string;
  allowedRoles: string[];
}

interface DashboardStats {
  todayRevenue: number;
  totalCompletedOrders: number;
  availableTables: number;
  usersCount: number;
  activeOrders: number;
}

export default function AdminPage() {
  const { user } = useAuth();
  const userRole = user?.role.name;

  const { data: statsResult, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await apiClientJson<DashboardStats>("/api/admin/dashboard-stats");
      if (!res.success || res.data == null) {
        throw new Error(res.error?.message || "Failed to load stats");
      }
      return res.data;
    },
  });

  const stats = statsResult;

  const menuItems: MenuItem[] = [
    { href: "/admin/orders", title: "លក់", icon: "💳", allowedRoles: ["admin", "order"] },
    { href: "/admin/setup", title: "ការកំណត់", icon: "⚙️", allowedRoles: ["admin"] },
    { href: "/admin/sales", title: "ការលក់", icon: "📊", allowedRoles: ["admin"] },
    { href: "/admin/chef", title: "ចម្អិន", icon: "👨‍🍳", allowedRoles: ["admin", "chef"] },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.allowedRoles.includes(userRole || "")
  );

  const fmt = (n: number) =>
    n.toLocaleString("km-KH", { maximumFractionDigits: 0 });

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-5 sm:px-8 sm:py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">ផ្ទាំងគ្រប់គ្រង</h1>
            <p className="mt-1 text-sm text-slate-500">
              សូមស្វាគមន៍{user?.username ? `, ${user.username}` : ""}
              {user?.role?.displayName ? ` · ${user.role.displayName}` : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">លក់ថ្ងៃនេះ</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {statsLoading ? "…" : `${fmt(stats?.todayRevenue ?? 0)}៛`}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">ការបញ្ចប់តាមថ្ងៃនេះ</p>
                </div>
                <div className="text-3xl">💳</div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">ការបញ្ជាបានបញ្ចប់</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {statsLoading ? "…" : fmt(stats?.totalCompletedOrders ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">សរុបទាំងអស់</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">តុទំនេរ</p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {statsLoading ? "…" : fmt(stats?.availableTables ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">ស្ថានភាព available</p>
                </div>
                <div className="text-3xl">🪑</div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {userRole === "admin" ? "អ្នកប្រើប្រាស់" : "ការបញ្ជាកំពុង"}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    {statsLoading
                      ? "…"
                      : fmt(
                          userRole === "admin"
                            ? stats?.usersCount ?? 0
                            : stats?.activeOrders ?? 0
                        )}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {userRole === "admin" ? "គណនីទាំងអស់" : "មិនទាន់បញ្ចប់"}
                  </p>
                </div>
                <div className="text-3xl">{userRole === "admin" ? "👤" : "📋"}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-bold text-slate-800">ទៅដែលស្ថិតនៅ</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-primary hover:shadow-lg"
                >
                  <div className="text-4xl">{item.icon}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">ចូលទៅក្នុងផ្នែក</p>
                  </div>
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-slate-400 transition-all group-hover:translate-x-1 group-hover:text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
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
