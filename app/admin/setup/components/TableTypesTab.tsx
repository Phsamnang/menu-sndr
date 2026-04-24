"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import Table from "@/components/Table";
import { tableTypeService, TableType } from "@/services/table-type.service";
import TableTypeModal from "./TableTypeModal";

export default function TableTypesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<TableType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    order: 0,
    isActive: true,
  });
  const queryClient = useQueryClient();

  const { data: tableTypes = [], isLoading } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: () => tableTypeService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => tableTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
      setIsModalOpen(false);
      setFormData({ name: "", displayName: "", order: 0, isActive: true });
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
      data: typeof formData;
    }) => tableTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableTypes"] });
      setIsModalOpen(false);
      setEditingType(null);
      setFormData({ name: "", displayName: "", order: 0, isActive: true });
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
      isActive: type.isActive !== false,
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
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingType(null);
            setFormData({ name: "", displayName: "", order: 0, isActive: true });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          បន្ថែមប្រភេទតុ
        </button>
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
            render: (item) => (
              <span className="text-slate-700">{item.displayName}</span>
            ),
          },
          {
            key: "order",
            label: "លំដាប់",
            render: (item) => (
              <span className="text-slate-600">{item.order}</span>
            ),
          },
          {
            key: "isActive",
            label: "ស្ថានភាព",
            render: (item) => (
              <span
                className={`px-2 py-1 rounded text-sm ${
                  item.isActive !== false
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {item.isActive !== false ? "សកម្ម" : "អសកម្ម"}
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
          setFormData({ name: "", displayName: "", order: 0, isActive: true });
        }}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />
    </div>
  );
}
