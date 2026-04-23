"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Table, { TableColumn } from "@/components/Table";
import { customerService, Customer } from "@/services/customer.service";
import Modal from "@/components/Modal";

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    birthday: "",
    address: "",
    notes: "",
    isVip: false,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, search],
    queryFn: () =>
      customerService.getAll({ page, limit: 10, search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsModalOpen(false);
      setFormData({
        name: "",
        phone: "",
        email: "",
        birthday: "",
        address: "",
        notes: "",
        isVip: false,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      customerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({
        name: "",
        phone: "",
        email: "",
        birthday: "",
        address: "",
        notes: "",
        isVip: false,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      birthday: customer.birthday
        ? new Date(customer.birthday).toISOString().split("T")[0]
        : "",
      address: customer.address || "",
      notes: customer.notes || "",
      isVip: customer.isVip,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns: TableColumn<Customer>[] = [
    {
      key: "name",
      label: "ឈ្មោះ",
      render: (item) => (
        <span className="font-medium text-slate-900">{item.name}</span>
      ),
    },
    {
      key: "phone",
      label: "ទូរស័ព្ទ",
      render: (item) => <span className="text-slate-700">{item.phone}</span>,
    },
    {
      key: "email",
      label: "អ៊ីម៉ែល",
      render: (item) => (
        <span className="text-slate-600">{item.email || "-"}</span>
      ),
    },
    {
      key: "totalOrders",
      label: "ការបញ្ជាទិញ",
      render: (item) => (
        <span className="text-slate-700">{item.totalOrders}</span>
      ),
    },
    {
      key: "totalSpent",
      label: "សរុបចំណាយ",
      render: (item) => (
        <span className="text-slate-700">${item.totalSpent.toFixed(2)}</span>
      ),
    },
    {
      key: "isVip",
      label: "VIP",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded ${
            item.isVip
              ? "bg-yellow-100 text-yellow-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {item.isVip ? "VIP" : "-"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "សកម្មភាព",
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(item)}
            className="btn-primary-md"
          >
            កែប្រែ
          </button>
          <button
            onClick={() => {
              if (confirm("តើអ្នកចង់លុបអតិថិជននេះ?")) {
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
          <h1 className="text-3xl font-bold text-slate-800">អតិថិជន</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingCustomer(null);
                setFormData({
                  name: "",
                  phone: "",
                  email: "",
                  birthday: "",
                  address: "",
                  notes: "",
                  isVip: false,
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              បន្ថែមអតិថិជន
            </button>
          </div>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="ស្វែងរក..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full max-w-md px-4 py-2 border rounded-lg"
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
          title={editingCustomer ? "កែប្រែអតិថិជន" : "បន្ថែមអតិថិជន"}
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ឈ្មោះ *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ទូរស័ព្ទ *</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">អ៊ីម៉ែល</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ថ្ងៃខែឆ្នាំកំណើត</label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) =>
                  setFormData({ ...formData, birthday: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">អាសយដ្ឋាន</label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                rows={2}
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
                rows={2}
              />
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isVip}
                  onChange={(e) =>
                    setFormData({ ...formData, isVip: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">VIP</span>
              </label>
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "កំពុងដំណើរការ..."
                  : editingCustomer
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

