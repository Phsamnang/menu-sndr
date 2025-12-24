"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { orderService, Order } from "@/services/order.service";
import {
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";
import OrderDetailModal from "./components/OrderDetailModal";

export default function SalesManagementPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const startOfDay = new Date(selectedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(selectedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: ordersData, isLoading } = useQuery<{ items: Order[] }>({
    queryKey: ["salesOrders", selectedDate],
    queryFn: () =>
      orderService.getAll({
        status: "done",
        limit: 10000,
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
      }),
  });

  const orders = useMemo(() => ordersData?.items || [], [ordersData?.items]);

  const { data: orderDetails } = useQuery<Order | null>({
    queryKey: ["orderDetails", selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) return null;
      return orderService.getById(selectedOrderId);
    },
    enabled: !!selectedOrderId,
  });

  const statistics = useMemo(() => {
    const totalOrders = orders.length;
    const totalIncome = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalIncome / totalOrders : 0;
    const totalDiscount = orders.reduce(
      (sum, order) => sum + (order.discountAmount || 0),
      0
    );
    const totalSubtotal = orders.reduce(
      (sum, order) => sum + order.subtotal,
      0
    );

    return {
      totalOrders,
      totalIncome,
      averageOrderValue,
      totalDiscount,
      totalSubtotal,
    };
  }, [orders]);

  const formatDate = (dateString: string) => {
    if (!isClient) {
      return dateString;
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("km-KH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    if (!isClient) {
      return dateString;
    }
    const date = new Date(dateString);
    return date.toLocaleTimeString("km-KH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">គ្រប់គ្រងការលក់</h1>
          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            ត្រលប់
          </Link>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <FaCalendarAlt className="inline mr-2" />
            ជ្រើសរើសកាលបរិច្ឆេទ
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
          />
          <p className="text-sm text-slate-600 mt-1">
            {isClient ? formatDate(selectedDate) : selectedDate}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  ចំនួនការបញ្ជាទិញ
                </p>
                <p className="text-3xl font-bold text-slate-900">
                  {statistics.totalOrders}
                </p>
                <p className="text-xs text-slate-500 mt-1">ការបញ្ជាទិញ</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaShoppingCart className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  ចំណូលសរុប
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {statistics.totalIncome.toLocaleString("km-KH")}៛
                </p>
                <p className="text-xs text-slate-500 mt-1">ចំណូល</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaDollarSign className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  តម្លៃមធ្យម
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {statistics.averageOrderValue.toLocaleString("km-KH", {
                    maximumFractionDigits: 0,
                  })}
                  ៛
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ក្នុងមួយការបញ្ជាទិញ
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaChartLine className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  សរុបមុនបញ្ចុះតម្លៃ
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  {statistics.totalSubtotal.toLocaleString("km-KH")}៛
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  បញ្ចុះតម្លៃ:{" "}
                  {statistics.totalDiscount.toLocaleString("km-KH")}៛
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <FaChartLine className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">
              បញ្ជីការបញ្ជាទិញ ({statistics.totalOrders})
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-800"></div>
              <p className="text-slate-600 mt-4">កំពុងផ្ទុក...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">
                មិនមានការបញ្ជាទិញសម្រាប់កាលបរិច្ឆេទនេះ
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      លេខការបញ្ជាទិញ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      តុ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      អតិថិជន
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      ពេលវេលា
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      ចំនួនមុខម្ហូប
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      សរុបមុនបញ្ចុះតម្លៃ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      បញ្ចុះតម្លៃ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      សរុប
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {order.table
                            ? `តុ ${order.table.number}${
                                order.table.name ? ` - ${order.table.name}` : ""
                              }`
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {order.customerName || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {order.createdAt ? formatTime(order.createdAt) : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {order.items.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-slate-600">
                          {order.subtotal.toLocaleString("km-KH")}៛
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-red-600">
                          {order.discountAmount > 0
                            ? `-${order.discountAmount.toLocaleString(
                                "km-KH"
                              )}៛`
                            : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-600">
                          {order.total.toLocaleString("km-KH")}៛
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-right text-sm font-bold text-slate-900"
                    >
                      សរុបទាំងអស់:
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                      {statistics.totalSubtotal.toLocaleString("km-KH")}៛
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                      -{statistics.totalDiscount.toLocaleString("km-KH")}៛
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {statistics.totalIncome.toLocaleString("km-KH")}៛
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>

      <OrderDetailModal
        order={orderDetails || null}
        onClose={() => setSelectedOrderId(null)}
        formatDate={formatDate}
        formatTime={formatTime}
      />
    </div>
  );
}
