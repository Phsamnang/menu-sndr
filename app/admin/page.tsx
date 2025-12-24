"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FaFolder,
  FaLayerGroup,
  FaTable,
  FaUtensils,
  FaShoppingCart,
  FaClipboardList,
  FaBook,
  FaFire,
  FaTruck,
  FaSignOutAlt,
  FaUsers,
  FaStore,
} from "react-icons/fa";

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const userRole = user?.role.name;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuItems = [
    {
      href: "/admin/categories",
      icon: FaFolder,
      title: "ប្រភេទម្ហូប",
      description: "គ្រប់គ្រងប្រភេទមីនុយ",
      allowedRoles: ["admin"],
    },
    {
      href: "/admin/table-types",
      icon: FaLayerGroup,
      title: "ប្រភេទតុ",
      description: "គ្រប់គ្រងប្រភេទតុ និងតម្លៃ",
      allowedRoles: ["admin"],
    },
    {
      href: "/admin/tables",
      icon: FaTable,
      title: "តុ",
      description: "គ្រប់គ្រងតុ",
      allowedRoles: ["admin"],
    },
    {
      href: "/admin/menu-items",
      icon: FaUtensils,
      title: "មុខម្ហូប",
      description: "គ្រប់គ្រងមុខម្ហូប",
      allowedRoles: ["admin"],
    },
    {
      href: "/admin/users",
      icon: FaUsers,
      title: "អ្នកប្រើប្រាស់",
      description: "គ្រប់គ្រងអ្នកប្រើប្រាស់",
      allowedRoles: ["admin"],
    },
    {
      href: "/admin/shop-info",
      icon: FaStore,
      title: "ព័ត៌មានហាង",
      description: "គ្រប់គ្រងព័ត៌មានហាង",
      allowedRoles: ["admin"],
    },
    {
      href: "/admin/orders",
      icon: FaShoppingCart,
      title: "ការបញ្ជាទិញ",
      description: "គ្រប់គ្រងការបញ្ជាទិញ",
      allowedRoles: ["admin", "order"],
    },
    {
      href: "/admin/sales",
      icon: FaClipboardList,
      title: "គ្រប់គ្រងការលក់",
      description: "មើលការបញ្ជាទិញ និងចំណូល",
      allowedRoles: ["admin"],
    },
    {
      href: "/admin/chef",
      icon: FaFire,
      title: "ចម្អិន",
      description: "ការបញ្ជាទិញសម្រាប់ចម្អិន",
      allowedRoles: ["admin", "chef"],
      iconColor: "text-orange-600",
    },
    {
      href: "/admin/delivery",
      icon: FaTruck,
      title: "ការដឹកជញ្ជូន",
      description: "មុខម្ហូបរួចរាល់សម្រាប់ដឹក",
      allowedRoles: ["admin", "waiter", "order"],
      iconColor: "text-blue-600",
    },
    {
      href: "/",
      icon: FaBook,
      title: "មើលមីនុយ",
      description: "មើលមីនុយអតិថិជន",
      allowedRoles: ["admin", "chef", "waiter", "order"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.allowedRoles.includes(userRole || "")
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800">ផ្ទាំងគ្រប់គ្រង</h1>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-slate-600">
                {user.username} ({user.role.displayName})
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <FaSignOutAlt />
              <span>ចេញ</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
              >
                <Icon
                  className={`text-4xl mb-4 ${
                    item.iconColor || "text-slate-600"
                  }`}
                />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {item.title}
                </h2>
                <p className="text-slate-600">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
