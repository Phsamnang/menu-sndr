import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/utils/api-response";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Static admin menu items configuration
const ADMIN_MENU_ITEMS = [
  {
    id: "1",
    href: "/admin/categories",
    iconName: "FaFolder",
    title: "ប្រភេទម្ហូប",
    description: "គ្រប់គ្រងប្រភេទមីនុយ",
    order: 1,
    iconColor: null,
    allowedRoles: ["admin"],
  },
  {
    id: "2",
    href: "/admin/table-types",
    iconName: "FaLayerGroup",
    title: "ប្រភេទតុ",
    description: "គ្រប់គ្រងប្រភេទតុ និងតម្លៃ",
    order: 2,
    iconColor: null,
    allowedRoles: ["admin"],
  },
  {
    id: "3",
    href: "/admin/tables",
    iconName: "FaTable",
    title: "តុ",
    description: "គ្រប់គ្រងតុក្នុងភោជនីយដ្ឋាន",
    order: 3,
    iconColor: null,
    allowedRoles: ["admin"],
  },
  {
    id: "4",
    href: "/admin/menu-items",
    iconName: "FaUtensils",
    title: "មុខម្ហូប",
    description: "គ្រប់គ្រងមុខម្ហូប",
    order: 4,
    iconColor: null,
    allowedRoles: ["admin"],
  },
  {
    id: "5",
    href: "/admin/orders",
    iconName: "FaShoppingCart",
    title: "ការបញ្ជាទិញ",
    description: "គ្រប់គ្រងការបញ្ជាទិញ",
    order: 5,
    iconColor: null,
    allowedRoles: ["admin", "order"],
  },
  {
    id: "6",
    href: "/admin/table-orders",
    iconName: "FaClipboardList",
    title: "ការបញ្ជាទិញតុ",
    description: "មើលការបញ្ជាទិញតាមតុ",
    order: 6,
    iconColor: null,
    allowedRoles: ["admin"],
  },
  {
    id: "7",
    href: "/admin/chef",
    iconName: "FaFire",
    title: "ចម្អិន",
    description: "ការបញ្ជាទិញសម្រាប់ចម្អិន",
    order: 7,
    iconColor: "text-orange-600",
    allowedRoles: ["admin", "chef"],
  },
  {
    id: "8",
    href: "/admin/delivery",
    iconName: "FaTruck",
    title: "ការដឹកជញ្ជូន",
    description: "មុខម្ហូបរួចរាល់សម្រាប់ដឹក",
    order: 8,
    iconColor: "text-blue-600",
    allowedRoles: ["admin", "waiter", "order"],
  },
  {
    id: "9",
    href: "/",
    iconName: "FaBook",
    title: "មើលមីនុយ",
    description: "មើលមីនុយអតិថិជន",
    order: 9,
    iconColor: null,
    allowedRoles: ["admin", "chef", "waiter", "order"],
  },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return errorResponse("UNAUTHORIZED", "Authentication required", 401, [
        { message: "No session found" },
      ]);
    }

    // Return static menu items sorted by order
    const formatted = ADMIN_MENU_ITEMS.filter((item) => item)
      .sort((a, b) => a.order - b.order)
      .map((item) => ({
        id: item.id,
        href: item.href,
        iconName: item.iconName,
        title: item.title,
        description: item.description,
        iconColor: item.iconColor,
        allowedRoles: item.allowedRoles,
      }));

    return successResponse(formatted, "Menu items retrieved successfully");
  } catch (error: any) {
    console.error("Error fetching menu items:", error);
    return errorResponse(
      "FETCH_ERROR",
      "Failed to fetch menu items",
      500,
      [{ message: error?.message || String(error) }]
    );
  }
}

