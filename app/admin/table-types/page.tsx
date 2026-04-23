"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import Table from "@/components/Table";
import { tableTypeService, TableType } from "@/services/table-type.service";
import TableTypeModal from "./components/TableTypeModal";

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
    queryFn: () => tableTypeService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; displayName: string; order: number }) =>
      tableTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
      setIsModalOpen(false);
      setFormData({ name: "", displayName: "", order: 0 });
      toast.success("បានបន្ថែមប្រភេទតុដោយជោគជ័យ!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចបន្ថែមប្រភេទតុបានទេ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; displayName: string; order: number };
    }) => tableTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
      setIsModalOpen(false);
      setEditingType(null);
      setFormData({ name: "", displayName: "", order: 0 });
      toast.success("បានកែប្រែប្រភេទតុដោយជោគជ័យ!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចកែប្រែប្រភេទតុបានទេ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tableTypeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
      toast.success("បានលុបប្រភេទតុដោយជោគជ័យ!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចលុបប្រភេទតុនេះបានទេ");
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
            <button
              onClick={() => {
                setEditingType(null);
                setFormData({ name: "", displayName: "", order: 0 });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
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
                    className="btn-primary-sm"
                  >
                    កែប្រែ
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!confirm(`លុបប្រភេទតុ "${item.displayName}" មែនទេ?`)) return;
                      deleteMutation.mutate(item.id);
                    }}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
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

        <TableTypeModal
          isOpen={isModalOpen}
          editingType={editingType}
          formData={formData}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setIsModalOpen(false);
            setEditingType(null);
            setFormData({ name: "", displayName: "", order: 0 });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
}
