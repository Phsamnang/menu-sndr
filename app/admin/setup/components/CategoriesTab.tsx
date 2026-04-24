"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import Table from "@/components/Table";
import { categoryService, Category } from "@/services/category.service";
import CategoryModal from "./CategoryModal";

export default function CategoriesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    sortOrder: 0,
    isActive: true,
  });
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("បានបន្ថែមប្រភេទម្ហូបដោយជោគជ័យ!");
      setIsModalOpen(false);
      setFormData({ name: "", displayName: "", description: "", sortOrder: 0, isActive: true });
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចបន្ថែមប្រភេទម្ហូបបានទេ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("បានកែប្រែប្រភេទម្ហូបដោយជោគជ័យ!");
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", displayName: "", description: "", sortOrder: 0, isActive: true });
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចកែប្រែប្រភេទម្ហូបបានទេ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("បានលុបប្រភេទម្ហូបដោយជោគជ័យ!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចលុបប្រភេទម្ហូបនេះបានទេ");
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      displayName: category.displayName,
      description: category.description || "",
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingCategory(null);
            setFormData({
              name: "",
              displayName: "",
              description: "",
              sortOrder: 0,
              isActive: true,
            });
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          បន្ថែមប្រភេទម្ហូប
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
            key: "description",
            label: "ការពិពណ៌នា",
            render: (item) => (
              <span className="text-slate-600">{item.description || "-"}</span>
            ),
          },
          {
            key: "sortOrder",
            label: "លំដាប់",
            render: (item) => (
              <span className="text-slate-700">{item.sortOrder ?? 0}</span>
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
                    if (!confirm(`លុបប្រភេទ "${item.displayName}" មែនទេ?`)) return;
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
        data={categories}
        loading={isLoading}
        emptyMessage="រកមិនឃើញប្រភេទម្ហូបទេ។"
      />

      <CategoryModal
        isOpen={isModalOpen}
        editingCategory={editingCategory}
        formData={formData}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          setFormData({
            name: "",
            displayName: "",
            description: "",
            sortOrder: 0,
            isActive: true,
          });
        }}
        onSubmit={handleSubmit}
        onFormDataChange={(data) => setFormData(data as typeof formData)}
      />
    </div>
  );
}
