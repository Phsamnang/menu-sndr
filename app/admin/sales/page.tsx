"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { useState, useMemo, useEffect, useCallback } from "react";
import { orderService, Order } from "@/services/order.service";
import {
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import OrderDetailModal from "./components/OrderDetailModal";

export default function SalesManagementPage() {
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Ensure endDate is not before startDate
  useEffect(() => {
    if (endDate < startDate) {
      setEndDate(startDate);
    }
  }, [startDate, endDate]);

  const startOfDay = new Date(startDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  const { data: ordersData, isLoading } = useQuery<{ items: Order[] }>({
    queryKey: ["salesOrders", startDate, endDate],
    queryFn: () =>
      orderService.getAll({
        status: "completed",
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

  const formatTime = useCallback(
    (dateString: string) => {
      if (!isClient) {
        return dateString;
      }
      const date = new Date(dateString);
      return date.toLocaleTimeString("km-KH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [isClient]
  );

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "លេខការបញ្ជាទិញ",
        cell: (info) => (
          <span className="text-sm font-medium text-slate-900">
            #{info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "table",
        header: "តុ",
        cell: (info) => {
          const table = info.getValue() as Order["table"];
          return (
            <span className="text-sm text-slate-600">
              {table
                ? `តុ ${table.number}${table.name ? ` - ${table.name}` : ""}`
                : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "customerName",
        header: "អតិថិជន",
        cell: (info) => (
          <span className="text-sm text-slate-600">
            {(info.getValue() as string) || "-"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "ពេលវេលា",
        cell: (info) => (
          <span className="text-sm text-slate-600">
            {info.getValue() ? formatTime(info.getValue() as string) : "-"}
          </span>
        ),
      },
      {
        accessorKey: "items",
        header: "ចំនួនមុខម្ហូប",
        cell: (info) => (
          <span className="text-sm text-slate-600">
            {(info.getValue() as Order["items"]).length}
          </span>
        ),
      },
      {
        accessorKey: "subtotal",
        header: "សរុបមុនបញ្ចុះតម្លៃ",
        cell: (info) => (
          <span className="text-sm text-slate-600">
            {(info.getValue() as number).toLocaleString("km-KH")}៛
          </span>
        ),
      },
      {
        accessorKey: "discountAmount",
        header: "បញ្ចុះតម្លៃ",
        cell: (info) => {
          const amount = info.getValue() as number;
          return (
            <span className="text-sm text-red-600">
              {amount > 0 ? `-${amount.toLocaleString("km-KH")}៛` : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "total",
        header: "សរុប",
        cell: (info) => (
          <span className="text-sm font-bold text-green-600">
            {(info.getValue() as number).toLocaleString("km-KH")}៛
          </span>
        ),
      },
    ],
    [formatTime]
  );

  // Set up TanStack Table with pagination
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

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

        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-medium text-slate-700 mb-4">
            <FaCalendarAlt className="inline mr-2" />
            ជ្រើសរើសចន្លោះកាលបរិច្ឆេទ
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                ពីកាលបរិច្ឆេទ
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">
                {isClient ? formatDate(startDate) : startDate}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">
                ដល់កាលបរិច្ឆេទ
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">
                {isClient ? formatDate(endDate) : endDate}
              </p>
            </div>
          </div>
          {startDate === endDate ? (
            <p className="text-sm text-slate-600 mt-3">
              កាលបរិច្ឆេទ: {isClient ? formatDate(startDate) : startDate}
            </p>
          ) : (
            <p className="text-sm text-slate-600 mt-3">
              ចន្លោះកាលបរិច្ឆេទ: {isClient ? formatDate(startDate) : startDate}{" "}
              ដល់ {isClient ? formatDate(endDate) : endDate}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-color">
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
              <div className="icon-primary">
                <FaShoppingCart className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  ចំណូលសរុប
                </p>
                <p className="text-3xl font-bold text-primary">
                  {statistics.totalIncome.toLocaleString("km-KH")}៛
                </p>
                <p className="text-xs text-slate-500 mt-1">ចំណូល</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <FaDollarSign className="text-2xl text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  តម្លៃមធ្យម
                </p>
                <p className="text-3xl font-bold text-primary">
                  {statistics.averageOrderValue.toLocaleString("km-KH", {
                    maximumFractionDigits: 0,
                  })}
                  ៛
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ក្នុងមួយការបញ្ជាទិញ
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <FaChartLine className="text-2xl text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  សរុបមុនបញ្ចុះតម្លៃ
                </p>
                <p className="text-3xl font-bold text-primary">
                  {statistics.totalSubtotal.toLocaleString("km-KH")}៛
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  បញ្ចុះតម្លៃ:{" "}
                  {statistics.totalDiscount.toLocaleString("km-KH")}៛
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-full">
                <FaChartLine className="text-2xl text-primary" />
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
                មិនមានការបញ្ជាទិញសម្រាប់ចន្លោះកាលបរិច្ឆេទនេះ
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedOrderId(row.original.id)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 py-4 whitespace-nowrap"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
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

              {/* Pagination Controls */}
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    ទំព័រ {table.getState().pagination.pageIndex + 1} នៃ{" "}
                    {table.getPageCount()}
                  </span>
                  <span className="text-sm text-slate-500">
                    (សរុប {orders.length} ការបញ្ជាទិញ)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    <FaChevronLeft className="w-3 h-3" />
                    មុន
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: table.getPageCount() }, (_, i) => i)
                      .filter((pageIndex) => {
                        const currentPage =
                          table.getState().pagination.pageIndex;
                        const totalPages = table.getPageCount();
                        // Show first page, last page, current page, and pages around current
                        return (
                          pageIndex === 0 ||
                          pageIndex === totalPages - 1 ||
                          (pageIndex >= currentPage - 1 &&
                            pageIndex <= currentPage + 1)
                        );
                      })
                      .map((pageIndex, index, array) => {
                        // Add ellipsis if there's a gap
                        const showEllipsisBefore =
                          index > 0 && array[index - 1] !== pageIndex - 1;
                        return (
                          <div
                            key={pageIndex}
                            className="flex items-center gap-1"
                          >
                            {showEllipsisBefore && (
                              <span className="px-2 text-slate-500">...</span>
                            )}
                            <button
                              onClick={() => table.setPageIndex(pageIndex)}
                              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                table.getState().pagination.pageIndex ===
                                pageIndex
                                  ? "bg-primary text-white"
                                  : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              {pageIndex + 1}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    បន្ទាប់
                    <FaChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </>
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
