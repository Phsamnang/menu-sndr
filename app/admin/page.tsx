"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItem {
  href: string;
  title: string;
  description: string;
  allowedRoles: string[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const userRole = user?.role.name;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const menuSections: MenuSection[] = [
    {
      title: "មីនុយ",
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
      title: "ការបញ្ជាទិញ",
      items: [
        {
          href: "/admin/orders",
          title: "ការបញ្ជាទិញ",
          description: "គ្រប់គ្រងការបញ្ជាទិញ",
          allowedRoles: ["admin", "order"],
        },
        {
          href: "/admin/reservations",
          title: "ការកក់តុ",
          description: "គ្រប់គ្រងការកក់តុ",
          allowedRoles: ["admin", "order"],
        },
        {
          href: "/admin/customers",
          title: "អតិថិជន",
          description: "គ្រប់គ្រងអតិថិជន",
          allowedRoles: ["admin"],
        },
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
    {
      title: "ផលិតផល & ចំណាយ",
      items: [
        {
          href: "/admin/units",
          title: "គ្រប់គ្រងឯកតា",
          description: "គ្រប់គ្រងឯកតាវាស់វែង",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/unit-conversions",
          title: "ការបម្លែងឯកតា",
          description: "គ្រប់គ្រងការបម្លែងឯកតា",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/products",
          title: "គ្រប់គ្រងផលិតផល",
          description: "គ្រប់គ្រងផលិតផលសម្រាប់ចំណាយ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/inventory",
          title: "ស្តុក",
          description: "គ្រប់គ្រងស្តុកផលិតផល",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/stock-movements",
          title: "ចលនាស្តុក",
          description: "មើលចលនាស្តុក",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/expenses",
          title: "គ្រប់គ្រងចំណាយ",
          description: "គ្រប់គ្រងចំណាយលម្អិត",
          allowedRoles: ["admin"],
        },
      ],
    },
    {
      title: "ការកំណត់",
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
        {
          href: "/admin/exchange-rates",
          title: "អត្រាប្តូរប្រាក់",
          description: "គ្រប់គ្រងអត្រាប្តូរប្រាក់",
          allowedRoles: ["admin"],
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
      description: "មើលមីនុយអតិថិជន",
      allowedRoles: ["admin", "chef", "waiter", "order"],
    },
  ];

  const filterItemsByRole = (items: MenuItem[]) =>
    items.filter((item) => item.allowedRoles.includes(userRole || ""));

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors"
            >
              <span>ចេញ</span>
            </button>
          </div>
        </div>

        {filterItemsByRole(quickAccessItems).length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {filterItemsByRole(quickAccessItems).map((item) => {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6 hover:shadow-xl transition-all hover:scale-105"
                  >
                    <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
                    <p className="text-blue-100">{item.description}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-6">
          {menuSections.map((section) => {
            const filteredItems = filterItemsByRole(section.items);
            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title}>
                <h2 className="text-2xl font-bold text-slate-700 mb-6">
                  {section.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredItems.map((item) => {
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-all hover:scale-105 border border-slate-200"
                      >
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {item.description}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filterItemsByRole(roleSpecificItems).length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-slate-700 mb-6">ការងារ</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filterItemsByRole(roleSpecificItems).map((item) => {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="bg-white rounded-lg shadow-md p-5 hover:shadow-xl transition-all hover:scale-105 border border-slate-200"
                    >
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
