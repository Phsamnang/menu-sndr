"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { apiClientJson } from "@/utils/api-client";
import { useChefStream } from "@/hooks/useChefStream";
import { Order, OrderItem } from "@/lib/types";
import toast from "react-hot-toast";

export default function ChefPage() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const { ordersData, isLoading } = useChefStream(statusFilter);
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      itemId,
      status,
    }: {
      orderId: string;
      itemId: string;
      status: string;
    }) => {
      const result = await apiClientJson(
        `/api/admin/orders/${orderId}/items/${itemId}/status`,
        {
          method: "PUT",
          data: { status },
        }
      );

      if (!result.success || !result.data) {
        throw new Error(
          result.error?.message || "Failed to update item status"
        );
      }

      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chefOrders"] });
    },
    onError: (err: Error) => {
      toast.error(err?.message || "មិនអាចធ្វើបច្ចុប្បន្នភាពបានទេ");
    },
  });

  const handleStatusChange = useCallback(
    (orderId: string, itemId: string, newStatus: string) => {
      updateStatusMutation.mutate({ orderId, itemId, status: newStatus });
    },
    [updateStatusMutation]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "preparing":
        return "status-primary";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "រង់ចាំ";
      case "preparing":
        return "កំពុងរៀបចំ";
      default:
        return "";
    }
  };

  const orders = ordersData?.items || [];

  const allItems = useMemo(
    () =>
      orders
        .flatMap((order) =>
          order.items.map((item) => ({ ...item, order }))
        )
        .filter(
          (item) =>
            item.status !== "served" &&
            item.status !== "cancelled" &&
            item.status !== "ready"
        ),
    [orders]
  );

  const groupedByStatus = useMemo(() => {
    return allItems.reduce((acc, item) => {
      if (!acc[item.status]) acc[item.status] = [];
      acc[item.status].push(item);
      return acc;
    }, {} as Record<string, typeof allItems>);
  }, [allItems]);

  const filteredItems = statusFilter
    ? groupedByStatus[statusFilter] || []
    : allItems;

  type ItemWithOrder = OrderItem & { order: Order };

  const columns = useMemo<ColumnDef<ItemWithOrder>[]>(
    () => [
      {
        accessorKey: "menuItem",
        header: "រូបភាព",
        cell: (info) => {
          const menuItem = info.getValue() as OrderItem["menuItem"];
          return (
            <div className="w-16 h-16 bg-slate-100 rounded overflow-hidden">
              {menuItem.image ? (
                <OptimizedImage
                  src={menuItem.image}
                  alt={menuItem.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  No Image
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "menuItem",
        header: "មុខម្ហូប",
        cell: (info) => {
          const menuItem = info.getValue() as OrderItem["menuItem"];
          return (
            <div>
              <div className="font-bold text-slate-900">
                {menuItem.name}
              </div>
              <div className="text-sm text-slate-600">
                {menuItem.category.displayName}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "quantity",
        header: "ចំនួន",
      },
      {
        accessorKey: "status",
        header: "ស្ថានភាព",
        cell: (info) => {
          const status = info.getValue() as string;
          return (
            <span
              className={`px-2 py-1 text-xs rounded border ${getStatusColor(
                status
              )}`}
            >
              {getStatusLabel(status)}
            </span>
          );
        },
      },
      {
        accessorKey: "order",
        header: "តុ",
        cell: (info) => {
          const order = info.getValue() as Order;
          return (
            <div className="text-sm text-slate-600">
              {order.table
                ? `តុ ${order.table.number}`
                : "-"}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "សកម្មភាព",
        cell: (info) => {
          const item = info.row.original;

          return (
            <div className="flex gap-2">
              {item.status === "pending" && (
                <button
                  onClick={() =>
                    handleStatusChange(
                      item.order.id,
                      item.id,
                      "preparing"
                    )
                  }
                  className="px-3 py-2 btn-primary rounded-lg text-sm"
                >
                  ចាប់ផ្តើម
                </button>
              )}

              {item.status === "preparing" && (
                <button
                  onClick={() =>
                    handleStatusChange(item.order.id, item.id, "ready")
                  }
                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  រួចរាល់
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [handleStatusChange]
  );

  const table = useReactTable({
    data: filteredItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              ការចម្អិន
            </h1>
            <p className="text-slate-600">
              គ្រប់គ្រងមុខម្ហូបដែលត្រូវចម្អិន
            </p>
          </div>

          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm"
          >
            ត្រលប់
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-4 py-2 rounded-lg text-sm ${
              statusFilter === null
                ? "bg-slate-800 text-white"
                : "bg-white border"
            }`}
          >
            ទាំងអស់ ({allItems.length})
          </button>

          {["pending", "preparing"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm ${
                statusFilter === status
                  ? "bg-slate-800 text-white"
                  : "bg-white border"
              }`}
            >
              {getStatusLabel(status)} (
              {groupedByStatus[status]?.length || 0})
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            Loading...
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    {hg.headers.map((h) => (
                      <th key={h.id} className="p-4 text-left text-sm">
                        {flexRender(
                          h.column.columnDef.header,
                          h.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t hover:bg-slate-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4 text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}