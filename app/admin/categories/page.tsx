"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { categoryService, Category } from "@/services/category.service";
import CategoryModal from "./components/CategoryModal";

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", displayName: "" });
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; displayName: string }) =>
      categoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      setFormData({ name: "", displayName: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { name: string; displayName: string };
    }) => categoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: "", displayName: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, displayName: category.displayName });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">ប្រភេទម្ហូប</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({ name: "", displayName: "" });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមប្រភេទ
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
            setFormData({ name: "", displayName: "" });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
}
