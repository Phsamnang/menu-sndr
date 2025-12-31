"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { reservationService, Reservation } from "@/services/reservation.service";
import { tableService } from "@/services/table.service";
import { customerService } from "@/services/customer.service";
import Modal from "@/components/Modal";

export default function ReservationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [formData, setFormData] = useState({
    tableId: "",
    customerId: "",
    customerName: "",
    customerPhone: "",
    guestCount: 1,
    reservedDate: new Date().toISOString().split("T")[0],
    reservedTime: "18:00",
    duration: 120,
    notes: "",
  });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["reservations", page, statusFilter, dateFilter],
    queryFn: () =>
      reservationService.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
      }),
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["tables"],
    queryFn: () => tableService.getAll(),
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerService.getAll({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => reservationService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<typeof formData>;
    }) => reservationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      setIsModalOpen(false);
      setEditingReservation(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => reservationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  const resetForm = () => {
    setFormData({
      tableId: "",
      customerId: "",
      customerName: "",
      customerPhone: "",
      guestCount: 1,
      reservedDate: new Date().toISOString().split("T")[0],
      reservedTime: "18:00",
      duration: 120,
      notes: "",
    });
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      tableId: reservation.tableId,
      customerId: reservation.customerId || "",
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      guestCount: reservation.guestCount,
      reservedDate: new Date(reservation.reservedDate)
        .toISOString()
        .split("T")[0],
      reservedTime: reservation.reservedTime,
      duration: reservation.duration,
      notes: reservation.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReservation) {
      updateMutation.mutate({
        id: editingReservation.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const customer = customersData?.items.find((c) => c.id === customerId);
    if (customer) {
      setFormData({
        ...formData,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
      });
    }
  };

  const columns: TableColumn<Reservation>[] = [
    {
      key: "customerName",
      label: "អតិថិជន",
      render: (item) => (
        <div>
          <span className="font-medium text-slate-900">{item.customerName}</span>
          <br />
          <span className="text-sm text-slate-600">{item.customerPhone}</span>
        </div>
      ),
    },
    {
      key: "table",
      label: "តុ",
      render: (item) => (
        <span className="text-slate-700">
          {item.table?.number || item.tableId}
        </span>
      ),
    },
    {
      key: "reservedDate",
      label: "កាលបរិច្ឆេទ",
      render: (item) => (
        <div>
          <span className="text-slate-700">
            {new Date(item.reservedDate).toLocaleDateString()}
          </span>
          <br />
          <span className="text-sm text-slate-600">{item.reservedTime}</span>
        </div>
      ),
    },
    {
      key: "guestCount",
      label: "ចំនួនភ្ញៀវ",
      render: (item) => (
        <span className="text-slate-700">{item.guestCount}</span>
      ),
    },
    {
      key: "status",
      label: "ស្ថានភាព",
      render: (item) => {
        const statusColors: Record<string, string> = {
          pending: "bg-yellow-100 text-yellow-800",
          confirmed: "bg-blue-100 text-blue-800",
          seated: "bg-green-100 text-green-800",
          cancelled: "bg-red-100 text-red-800",
          no_show: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded ${
              statusColors[item.status] || "bg-slate-100 text-slate-600"
            }`}
          >
            {item.status}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "សកម្មភាព",
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            កែប្រែ
          </button>
          <button
            onClick={() => {
              if (confirm("តើអ្នកចង់លុបការកក់នេះ?")) {
                deleteMutation.mutate(item.id);
              }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            លុប
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">ការកក់តុ</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingReservation(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមការកក់
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">ទាំងអស់</option>
            <option value="pending">កំពុងរង់ចាំ</option>
            <option value="confirmed">បានបញ្ជាក់</option>
            <option value="seated">បានអង្គុយ</option>
            <option value="cancelled">បានលុបចោល</option>
            <option value="no_show">មិនបានមក</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">កំពុងផ្ទុក...</div>
        ) : (
          <>
            <Table columns={columns} data={data?.items || []} />
            {data?.pagination && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-slate-600">
                  ទំព័រ {data.pagination.page} / {data.pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!data.pagination.hasPrevPage}
                    className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50"
                  >
                    មុន
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!data.pagination.hasNextPage}
                    className="px-4 py-2 bg-slate-200 rounded disabled:opacity-50"
                  >
                    បន្ទាប់
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            editingReservation ? "កែប្រែការកក់" : "បន្ថែមការកក់"
          }
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">តុ *</label>
              <select
                value={formData.tableId}
                onChange={(e) =>
                  setFormData({ ...formData, tableId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">ជ្រើសរើសតុ</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.number} {table.name ? `- ${table.name}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                អតិថិជន (ជ្រើសរើស)
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">ជ្រើសរើសអតិថិជន</option>
                {customersData?.items.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                ឈ្មោះអតិថិជន *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                ទូរស័ព្ទអតិថិជន *
              </label>
              <input
                type="text"
                value={formData.customerPhone}
                onChange={(e) =>
                  setFormData({ ...formData, customerPhone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                ចំនួនភ្ញៀវ *
              </label>
              <input
                type="number"
                min="1"
                value={formData.guestCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    guestCount: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                កាលបរិច្ឆេទ *
              </label>
              <input
                type="date"
                value={formData.reservedDate}
                onChange={(e) =>
                  setFormData({ ...formData, reservedDate: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ម៉ោង *</label>
              <input
                type="time"
                value={formData.reservedTime}
                onChange={(e) =>
                  setFormData({ ...formData, reservedTime: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                រយៈពេល (នាទី)
              </label>
              <input
                type="number"
                min="30"
                step="30"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 120,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">កំណត់ចំណាំ</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            {editingReservation && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">ស្ថានភាព</label>
                <select
                  value={editingReservation.status}
                  onChange={(e) =>
                    updateMutation.mutate({
                      id: editingReservation.id,
                      data: { status: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="pending">កំពុងរង់ចាំ</option>
                  <option value="confirmed">បានបញ្ជាក់</option>
                  <option value="seated">បានអង្គុយ</option>
                  <option value="cancelled">បានលុបចោល</option>
                  <option value="no_show">មិនបានមក</option>
                </select>
              </div>
            )}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "កំពុងដំណើរការ..."
                  : editingReservation
                  ? "ធ្វើបច្ចុប្បន្នភាព"
                  : "បង្កើត"}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
              >
                បោះបង់
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}

