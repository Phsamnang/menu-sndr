"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import FlaticonIcon from "@/components/FlaticonIcon";
import { FlaticonIcons } from "./icons";

interface MenuItem {
  href: string;
  icon: string;
  title: string;
  description: string;
  allowedRoles: string[];
  iconColor?: string;
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
          icon: FlaticonIcons.folder,
          title: "ប្រភេទម្ហូប",
          description: "គ្រប់គ្រងប្រភេទមីនុយ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/table-types",
          icon: FlaticonIcons.layerGroup,
          title: "ប្រភេទតុ",
          description: "គ្រប់គ្រងប្រភេទតុ និងតម្លៃ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/tables",
          icon: FlaticonIcons.table,
          title: "តុ",
          description: "គ្រប់គ្រងតុ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/menu-items",
          icon: FlaticonIcons.utensils,
          title: "មុខម្ហូប",
          description: "គ្រប់គ្រងមុខម្ហូប",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/recipe-items",
          icon: FlaticonIcons.utensils,
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
          icon: FlaticonIcons.shoppingCart,
          title: "ការបញ្ជាទិញ",
          description: "គ្រប់គ្រងការបញ្ជាទិញ",
          allowedRoles: ["admin", "order"],
        },
        {
          href: "/admin/reservations",
          icon: FlaticonIcons.calendar,
          title: "ការកក់តុ",
          description: "គ្រប់គ្រងការកក់តុ",
          allowedRoles: ["admin", "order"],
        },
        {
          href: "/admin/customers",
          icon: FlaticonIcons.user,
          title: "អតិថិជន",
          description: "គ្រប់គ្រងអតិថិជន",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/sales",
          icon: FlaticonIcons.clipboardList,
          title: "គ្រប់គ្រងការលក់",
          description: "មើលការបញ្ជាទិញ និងចំណូល",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/promotions",
          icon: FlaticonIcons.dollarSign,
          title: "ការផ្តល់ជូន",
          description: "គ្រប់គ្រងការផ្តល់ជូន និងការបញ្ចុះតម្លៃ",
          allowedRoles: ["admin"],
          iconColor: "text-yellow-600",
        },
        {
          href: "/admin/daily-summaries",
          icon: FlaticonIcons.clipboardList,
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
          icon: FlaticonIcons.ruler,
          title: "គ្រប់គ្រងឯកតា",
          description: "គ្រប់គ្រងឯកតាវាស់វែង",
          allowedRoles: ["admin"],
          iconColor: "text-purple-600",
        },
        {
          href: "/admin/unit-conversions",
          icon: FlaticonIcons.arrows,
          title: "ការបម្លែងឯកតា",
          description: "គ្រប់គ្រងការបម្លែងឯកតា",
          allowedRoles: ["admin"],
          iconColor: "text-purple-600",
        },
        {
          href: "/admin/products",
          icon: FlaticonIcons.box,
          title: "គ្រប់គ្រងផលិតផល",
          description: "គ្រប់គ្រងផលិតផលសម្រាប់ចំណាយ",
          allowedRoles: ["admin"],
          iconColor: "text-green-600",
        },
        {
          href: "/admin/inventory",
          icon: FlaticonIcons.warehouse,
          title: "ស្តុក",
          description: "គ្រប់គ្រងស្តុកផលិតផល",
          allowedRoles: ["admin"],
          iconColor: "text-blue-600",
        },
        {
          href: "/admin/stock-movements",
          icon: FlaticonIcons.arrows,
          title: "ចលនាស្តុក",
          description: "មើលចលនាស្តុក",
          allowedRoles: ["admin"],
          iconColor: "text-indigo-600",
        },
        {
          href: "/admin/expenses",
          icon: FlaticonIcons.dollarSign,
          title: "គ្រប់គ្រងចំណាយ",
          description: "គ្រប់គ្រងចំណាយលម្អិត",
          allowedRoles: ["admin"],
          iconColor: "text-red-600",
        },
      ],
    },
    {
      title: "ការកំណត់",
      items: [
        {
          href: "/admin/users",
          icon: FlaticonIcons.users,
          title: "អ្នកប្រើប្រាស់",
          description: "គ្រប់គ្រងអ្នកប្រើប្រាស់",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/shop-info",
          icon: FlaticonIcons.store,
          title: "ព័ត៌មានហាង",
          description: "គ្រប់គ្រងព័ត៌មានហាង",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/settings",
          icon: FlaticonIcons.store,
          title: "ការកំណត់ប្រព័ន្ធ",
          description: "គ្រប់គ្រងការកំណត់ប្រព័ន្ធ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/exchange-rates",
          icon: FlaticonIcons.dollarSign,
          title: "អត្រាប្តូរប្រាក់",
          description: "គ្រប់គ្រងអត្រាប្តូរប្រាក់",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/notifications",
          icon: FlaticonIcons.clipboardList,
          title: "ការជូនដំណឹង",
          description: "មើលការជូនដំណឹង",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/audit-logs",
          icon: FlaticonIcons.clipboardList,
          title: "កំណត់ត្រា",
          description: "មើលកំណត់ត្រាប្រព័ន្ធ",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/shifts",
          icon: FlaticonIcons.calendar,
          title: "ការផ្លាស់ប្តូរ",
          description: "គ្រប់គ្រងការផ្លាស់ប្តូរបុគ្គលិក",
          allowedRoles: ["admin"],
        },
        {
          href: "/admin/cash-sessions",
          icon: FlaticonIcons.dollarSign,
          title: "សម័យប្រាក់សម្រាប់",
          description: "គ្រប់គ្រងសម័យប្រាក់សម្រាប់",
          allowedRoles: ["admin"],
        },
      ],
    },
  ];

  const roleSpecificItems: MenuItem[] = [
    {
      href: "/admin/chef",
      icon: FlaticonIcons.chefHat,
      title: "ចម្អិន",
      description: "ការបញ្ជាទិញសម្រាប់ចម្អិន",
      allowedRoles: ["admin", "chef"],
      iconColor: "text-orange-600",
    },
    {
      href: "/admin/delivery",
      icon: FlaticonIcons.waiter,
      title: "ការដឹកជញ្ជូន",
      description: "មុខម្ហូបរួចរាល់សម្រាប់ដឹក",
      allowedRoles: ["admin", "waiter", "order"],
      iconColor: "text-blue-600",
    },
  ];

  const quickAccessItems: MenuItem[] = [
    {
      href: "/",
      icon: FlaticonIcons.book,
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
              <FlaticonIcon
                src={FlaticonIcons.signOut}
                alt="Sign out"
                className="w-5 h-5"
              />
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
                    <FlaticonIcon
                      src={item.icon}
                      alt={item.title}
                      className="text-4xl mb-4"
                    />
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
                        <FlaticonIcon
                          src={item.icon}
                          alt={item.title}
                          className={`text-3xl mb-3 ${
                            item.iconColor || "text-slate-600"
                          }`}
                        />
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
                      <FlaticonIcon
                        src={item.icon}
                        alt={item.title}
                        className={`text-3xl mb-3 ${
                          item.iconColor || "text-slate-600"
                        }`}
                      />
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

