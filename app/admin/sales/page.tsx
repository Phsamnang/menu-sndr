"use client";

import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useState, useMemo, useEffect, useCallback } from "react";
import { orderService, Order } from "@/services/order.service";
import {
  FaDollarSign,
  FaShoppingCart,
  FaChartLine,
  FaMoneyBillWave,
  FaCreditCard,
  FaUniversity,
  FaMobileAlt,
} from "react-icons/fa";
import { apiClientJson } from "@/utils/api-client";
import OrderDetailModal from "./components/OrderDetailModal";

interface PaymentMethodStat {
  method: string;
  totalAmount: number;
  count: number;
}

const METHOD_CONFIG: Record<
  string,
  { label: string; icon: React.ReactNode; bg: string; text: string }
> = {
  cash: {
    label: "សាច់ប្រាក់",
    icon: <FaMoneyBillWave />,
    bg: "bg-green-50",
    text: "text-green-600",
  },
  card: {
    label: "កាត",
    icon: <FaCreditCard />,
    bg: "bg-blue-50",
    text: "text-blue-600",
  },
  bank_transfer: {
    label: "ផ្ទេរប្រាក់",
    icon: <FaUniversity />,
    bg: "bg-purple-50",
    text: "text-purple-600",
  },
  mobile_payment: {
    label: "ទូរស័ព្ទ",
    icon: <FaMobileAlt />,
    bg: "bg-orange-50",
    text: "text-orange-600",
  },
};

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

  const { data: paymentStats = [] } = useQuery<PaymentMethodStat[]>({
    queryKey: ["paymentMethodStats", startDate, endDate],
    queryFn: async () => {
      const result = await apiClientJson<{
        items: PaymentMethodStat[];
        total: number;
      }>(
        `/api/admin/payments/stats?startDate=${startOfDay.toISOString()}&endDate=${endOfDay.toISOString()}`
      );
      if (!result.success || !result.data) return [];
      return result.data.items;
    },
  });

  const statistics = useMemo(() => {
    const totalOrders = orders.length;
    const totalIncome = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalIncome / totalOrders : 0;
    const totalDiscount = orders.reduce(
      (sum, order) => sum + (order.discountAmount || 0),
      0
    );
    const totalSubtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
    return { totalOrders, totalIncome, averageOrderValue, totalDiscount, totalSubtotal };
  }, [orders]);

  const formatDate = (dateString: string) => {
    if (!isClient) return dateString;
    return new Date(dateString).toLocaleDateString("km-KH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = useCallback(
    (dateString: string) => {
      if (!isClient) return dateString;
      return new Date(dateString).toLocaleTimeString("km-KH", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [isClient]
  );

  const columns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "orderNumber",
        header: "លេខការបញ្ជាទិញ",
        cell: (info) => (
          <span className="font-medium text-slate-800">
            #{info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "table",
        header: "តុ",
        cell: (info) => {
          const t = info.getValue() as Order["table"];
          return (
            <span className="text-[#6C757D]">
              {t ? `តុ ${t.number}${t.name ? ` - ${t.name}` : ""}` : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "customerName",
        header: "អតិថិជន",
        cell: (info) => (
          <span className="text-[#6C757D]">
            {(info.getValue() as string) || "-"}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: "ពេលវេលា",
        cell: (info) => (
          <span className="text-[#6C757D]">
            {info.getValue() ? formatTime(info.getValue() as string) : "-"}
          </span>
        ),
      },
      {
        accessorKey: "_count",
        header: "ចំនួនមុខម្ហូប",
        cell: (info) => {
          const count = info.getValue() as { items: number } | undefined;
          const items = (info.row.original as any).items;
          return (
            <span className="text-[#6C757D]">
              {count?.items ?? items?.length ?? 0}
            </span>
          );
        },
      },
      {
        accessorKey: "subtotal",
        header: "សរុបមុនបញ្ចុះ",
        cell: (info) => (
          <span className="text-[#6C757D]">
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
            <span className="text-red-500">
              {amount > 0 ? `-${amount.toLocaleString("km-KH")}៛` : "-"}
            </span>
          );
        },
      },
      {
        accessorKey: "total",
        header: "សរុប",
        cell: (info) => (
          <span className="font-semibold text-green-600">
            {(info.getValue() as number).toLocaleString("km-KH")}៛
          </span>
        ),
      },
    ],
    [formatTime]
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const statCards = [
    {
      label: "ចំនួនការបញ្ជាទិញ",
      value: statistics.totalOrders.toString(),
      sub: "ការបញ្ជាទិញ",
      icon: <FaShoppingCart />,
      bg: "bg-primary/10",
      text: "text-primary",
    },
    {
      label: "ចំណូលសរុប",
      value: `${statistics.totalIncome.toLocaleString("km-KH")}៛`,
      sub: "ចំណូល",
      icon: <FaDollarSign />,
      bg: "bg-green-50",
      text: "text-green-600",
    },
    {
      label: "តម្លៃមធ្យម",
      value: `${statistics.averageOrderValue.toLocaleString("km-KH", { maximumFractionDigits: 0 })}៛`,
      sub: "ក្នុងមួយការបញ្ជាទិញ",
      icon: <FaChartLine />,
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "សរុបមុនបញ្ចុះតម្លៃ",
      value: `${statistics.totalSubtotal.toLocaleString("km-KH")}៛`,
      sub: `បញ្ចុះ: ${statistics.totalDiscount.toLocaleString("km-KH")}៛`,
      icon: <FaChartLine />,
      bg: "bg-orange-50",
      text: "text-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F6FB] p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">គ្រប់គ្រងការលក់</h1>
          <p className="text-sm text-[#6C757D] mt-0.5">ទិន្នន័យការលក់ និងការទូទាត់</p>
        </div>

        {/* Date filter */}
        <div className="bg-white rounded-[20px] border border-[#E9ECEF] px-6 py-5">
          <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-[0.05em] mb-4">
            ជ្រើសរើសចន្លោះកាលបរិច្ឆេទ
          </p>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">ពីកាលបរិច្ឆេទ</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate}
                className="px-3 py-2 border border-[#E9ECEF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">ដល់កាលបរិច្ឆេទ</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="px-3 py-2 border border-[#E9ECEF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <p className="text-sm text-[#6C757D] pb-2">
              {startDate === endDate
                ? isClient ? formatDate(startDate) : startDate
                : `${isClient ? formatDate(startDate) : startDate} ដល់ ${isClient ? formatDate(endDate) : endDate}`}
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-[20px] border border-[#E9ECEF] px-5 py-5 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-[0.05em] mb-1">
                  {card.label}
                </p>
                <p className={`text-2xl font-bold truncate ${card.text}`}>
                  {card.value}
                </p>
                <p className="text-xs text-[#6C757D] mt-0.5">{card.sub}</p>
              </div>
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${card.bg} ${card.text}`}>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Payment method stats */}
        {paymentStats.length > 0 && (
          <div className="bg-white rounded-[20px] border border-[#E9ECEF] px-6 py-5">
            <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-[0.05em] mb-4">
              តាមវិធីសាស្ត្រទូទាត់
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {paymentStats.map((stat) => {
                const config = METHOD_CONFIG[stat.method] || {
                  label: stat.method,
                  icon: <FaDollarSign />,
                  bg: "bg-slate-50",
                  text: "text-slate-600",
                };
                return (
                  <div
                    key={stat.method}
                    className="flex items-center gap-3 bg-[#F4F6FB] rounded-[14px] px-4 py-3"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${config.bg} ${config.text}`}>
                      {config.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[#6C757D] truncate">{config.label}</p>
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {stat.totalAmount.toLocaleString("km-KH")}៛
                      </p>
                      <p className="text-[11px] text-[#6C757D]">{stat.count} ការទូទាត់</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders table */}
        <div className="bg-white rounded-[20px] border border-[#E9ECEF] overflow-hidden">
          {/* Sheet header */}
          <div className="px-[22px] py-4 bg-[#F4F6FB] border-b border-[#E9ECEF] flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[#6C757D] uppercase tracking-[0.05em]">
              បញ្ជីការបញ្ជាទិញ
            </p>
            <span className="text-xs font-medium text-[#6C757D] bg-white border border-[#E9ECEF] rounded-full px-2.5 py-0.5">
              {statistics.totalOrders}
            </span>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#6C757D]">
              <div className="w-8 h-8 rounded-full border-4 border-[#E9ECEF] border-t-primary animate-spin mb-3" />
              <span className="text-sm">កំពុងផ្ទុក...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#6C757D]">
              មិនមានការបញ្ជាទិញសម្រាប់ចន្លោះកាលបរិច្ឆេទនេះ
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    {table.getHeaderGroups().map((hg) => (
                      <tr key={hg.id} className="bg-[#F4F6FB]">
                        {hg.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-[22px] py-3 text-left text-[11px] font-semibold text-[#6C757D] uppercase tracking-[0.05em] whitespace-nowrap"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedOrderId(row.original.id)}
                        className="border-t border-[#E9ECEF] hover:bg-[#FAFBFD] cursor-pointer transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-[22px] py-3.5 text-[13.5px] whitespace-nowrap"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#E9ECEF] bg-[#F4F6FB]">
                      <td
                        colSpan={5}
                        className="px-[22px] py-3.5 text-right text-[13px] font-semibold text-slate-700"
                      >
                        សរុបទាំងអស់
                      </td>
                      <td className="px-[22px] py-3.5 text-[13px] font-semibold text-slate-800 whitespace-nowrap">
                        {statistics.totalSubtotal.toLocaleString("km-KH")}៛
                      </td>
                      <td className="px-[22px] py-3.5 text-[13px] font-semibold text-red-500 whitespace-nowrap">
                        -{statistics.totalDiscount.toLocaleString("km-KH")}៛
                      </td>
                      <td className="px-[22px] py-3.5 text-[13px] font-semibold text-green-600 whitespace-nowrap">
                        {statistics.totalIncome.toLocaleString("km-KH")}៛
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pagination */}
              {table.getPageCount() > 1 && (
                <div className="px-[22px] py-4 border-t border-[#E9ECEF] flex items-center justify-between">
                  <span className="text-[13px] text-[#6C757D]">
                    ទំព័រ {table.getState().pagination.pageIndex + 1} នៃ {table.getPageCount()}
                    <span className="ml-2 text-[12px]">({orders.length} ការបញ្ជាទិញ)</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                      className="px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-[#E9ECEF] rounded-lg hover:bg-[#F4F6FB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ‹ មុន
                    </button>
                    {Array.from({ length: table.getPageCount() }, (_, i) => i)
                      .filter((pi) => {
                        const cur = table.getState().pagination.pageIndex;
                        const tot = table.getPageCount();
                        return pi === 0 || pi === tot - 1 || (pi >= cur - 1 && pi <= cur + 1);
                      })
                      .map((pi, idx, arr) => (
                        <div key={pi} className="flex items-center gap-1.5">
                          {idx > 0 && arr[idx - 1] !== pi - 1 && (
                            <span className="text-[#6C757D] text-sm">…</span>
                          )}
                          <button
                            onClick={() => table.setPageIndex(pi)}
                            className={`w-8 h-8 text-[13px] font-medium rounded-lg transition-colors ${
                              table.getState().pagination.pageIndex === pi
                                ? "bg-primary text-white"
                                : "bg-white text-slate-600 border border-[#E9ECEF] hover:bg-[#F4F6FB]"
                            }`}
                          >
                            {pi + 1}
                          </button>
                        </div>
                      ))}
                    <button
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                      className="px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-[#E9ECEF] rounded-lg hover:bg-[#F4F6FB] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      បន្ទាប់ ›
                    </button>
                  </div>
                </div>
              )}
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
