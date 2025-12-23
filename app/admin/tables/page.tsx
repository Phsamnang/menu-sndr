"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { apiClientJson } from "@/utils/api-client";

interface TableType {
  id: string;
  name: string;
  displayName: string;
  order: number;
}

interface TableItem {
  id: string;
  number: string;
  name: string | null;
  capacity: number;
  tableTypeId: string;
  status: string;
  tableType: TableType;
}

export default function TablesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    capacity: 4,
    tableTypeId: "",
    status: "available",
  });
  const queryClient = useQueryClient();

  const { data: tables = [], isLoading } = useQuery<TableItem[]>({
    queryKey: ["tables"],
    queryFn: async () => {
      const result = await apiClientJson<TableItem[]>("/api/admin/tables");
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch tables");
      }
      return result.data;
    },
  });

  const { data: tableTypes = [] } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: async () => {
      const result = await apiClientJson<TableType[]>("/api/admin/table-types");
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch table types");
      }
      return result.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const result = await apiClientJson("/api/admin/tables", {
        method: "POST",
        data,
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to create table");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsModalOpen(false);
      setFormData({
        number: "",
        name: "",
        capacity: 4,
        tableTypeId: "",
        status: "available",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const result = await apiClientJson(`/api/admin/tables/${id}`, {
        method: "PUT",
        data,
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to update table");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsModalOpen(false);
      setEditingTable(null);
      setFormData({
        number: "",
        name: "",
        capacity: 4,
        tableTypeId: "",
        status: "available",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiClientJson(`/api/admin/tables/${id}`, {
        method: "DELETE",
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to delete table");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  const handleEdit = (table: TableItem) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      name: table.name || "",
      capacity: table.capacity,
      tableTypeId: table.tableTypeId,
      status: table.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      updateMutation.mutate({ id: editingTable.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "អាចប្រើបាន";
      case "occupied":
        return "កំពុងប្រើ";
      case "reserved":
        return "កក់ទុក";
      case "maintenance":
        return "កំពុងជួសជុល";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">តុ</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingTable(null);
                setFormData({
                  number: "",
                  name: "",
                  capacity: 4,
                  tableTypeId: "",
                  status: "available",
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមតុ
            </button>
          </div>
        </div>

        <Table
          columns={[
            {
              key: "number",
              label: "លេខតុ",
              render: (item) => (
                <span className="font-medium text-slate-900">
                  {item.number}
                </span>
              ),
            },
            {
              key: "name",
              label: "ឈ្មោះ",
              render: (item) => (
                <span className="text-slate-700">{item.name || "-"}</span>
              ),
            },
            {
              key: "capacity",
              label: "ចំនួនអាចអង្គុយ",
              render: (item) => (
                <span className="text-slate-700">{item.capacity}</span>
              ),
            },
            {
              key: "tableType",
              label: "ប្រភេទតុ",
              render: (item) => (
                <span className="text-slate-700">
                  {item.tableType.displayName}
                </span>
              ),
            },
            {
              key: "status",
              label: "ស្ថានភាព",
              render: (item) => (
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    item.status
                  )}`}
                >
                  {getStatusLabel(item.status)}
                </span>
              ),
            },
            {
              key: "actions",
              label: "សកម្មភាព",
              align: "right",
              render: (item) => (
                <div className="flex justify-end gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item);
                    }}
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    កែប្រែ
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(item.id);
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  >
                    លុប
                  </button>
                </div>
              ),
            },
          ]}
          data={tables}
          loading={isLoading}
          emptyMessage="រកមិនឃើញតុទេ។"
        />

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingTable ? "កែប្រែតុ" : "បន្ថែមតុ"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    លេខតុ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ឈ្មោះ
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ចំនួនអាចអង្គុយ
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value) || 4,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ប្រភេទតុ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.tableTypeId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tableTypeId: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">ជ្រើសរើសប្រភេទតុ</option>
                    {tableTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ស្ថានភាព
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="available">អាចប្រើបាន</option>
                    <option value="occupied">កំពុងប្រើ</option>
                    <option value="reserved">កក់ទុក</option>
                    <option value="maintenance">កំពុងជួសជុល</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                  >
                    {editingTable ? "ធ្វើបច្ចុប្បន្នភាព" : "បង្កើត"}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
