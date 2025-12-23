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

export default function TableTypesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TableType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    order: 0,
  });
  const queryClient = useQueryClient();

  const { data: tableTypes = [], isLoading } = useQuery<TableType[]>({
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
    mutationFn: async (data: {
      name: string;
      displayName: string;
      order: number;
    }) => {
      const result = await apiClientJson("/api/admin/table-types", {
        method: "POST",
        data,
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to create table type");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
      setIsModalOpen(false);
      setFormData({ name: "", displayName: "", order: 0 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; displayName: string; order: number };
    }) => {
      const result = await apiClientJson(`/api/admin/table-types/${id}`, {
        method: "PUT",
        data,
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to update table type");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
      setIsModalOpen(false);
      setEditingType(null);
      setFormData({ name: "", displayName: "", order: 0 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiClientJson(`/api/admin/table-types/${id}`, {
        method: "DELETE",
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to delete table type");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
    },
  });

  const handleEdit = (type: TableType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      displayName: type.displayName,
      order: type.order,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType) {
      updateMutation.mutate({ id: editingType.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">ប្រភេទតុ</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingType(null);
                setFormData({ name: "", displayName: "", order: 0 });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមប្រភេទតុ
            </button>
          </div>
        </div>

        <Table
          columns={[
            {
              key: "name",
              label: "ឈ្មោះ",
              render: (item) => (
                <span className="font-medium text-slate-900">{item.name}</span>
              ),
            },
            {
              key: "displayName",
              label: "ឈ្មោះបង្ហាញ",
            },
            {
              key: "order",
              label: "លំដាប់",
              render: (item) => (
                <span className="text-slate-700">{item.order}</span>
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
          data={tableTypes}
          loading={isLoading}
          emptyMessage="រកមិនឃើញប្រភេទតុទេ។"
        />

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingType ? "កែប្រែប្រភេទតុ" : "បន្ថែមប្រភេទតុ"}
              </h2>
              <form onSubmit={handleSubmit}>
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
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ឈ្មោះបង្ហាញ
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData({ ...formData, displayName: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    លំដាប់
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                  >
                    {editingType ? "ធ្វើបច្ចុប្បន្នភាព" : "បង្កើត"}
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
