"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { productService, Product } from "@/services/product.service";
import ProductModal from "./components/ProductModal";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unitId: "",
    category: "",
  });
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => productService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      unitId?: string;
      category?: string;
    }) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      setFormData({ name: "", description: "", unitId: "", category: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name?: string;
        description?: string;
        unitId?: string;
        category?: string;
        isActive?: boolean;
      };
    }) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: "", description: "", unitId: "", category: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      unitId: product.unitId || "",
      category: product.category || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns: TableColumn<Product>[] = [
    {
      key: "name",
      label: "ឈ្មោះ",
      render: (item) => (
        <span className="font-medium text-slate-900">{item.name}</span>
      ),
    },
    {
      key: "category",
      label: "ប្រភេទ",
      render: (item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {item.category || "-"}
        </span>
      ),
    },
    {
      key: "unit",
      label: "ឯកតា",
      render: (item) => (
        <span className="text-slate-600">
          {item.unit?.displayName || item.unit?.name || "-"}
        </span>
      ),
    },
    {
      key: "description",
      label: "ការពិពណ៌នា",
      render: (item) => (
        <span className="text-slate-600 text-sm">
          {item.description || "-"}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "ស្ថានភាព",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            item.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.isActive ? "សកម្ម" : "អសកម្ម"}
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
              if (confirm("តើអ្នកពិតជាចង់លុបផលិតផលនេះមែនទេ?")) {
                deleteMutation.mutate(item.id);
              }
            }}
            className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
          >
            លុប
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">គ្រប់គ្រងផលិតផល</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: "",
                  description: "",
                  unitId: "",
                  category: "",
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមផលិតផល
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={products}
          loading={isLoading}
          emptyMessage="រកមិនឃើញផលិតផលទេ។"
        />

        <ProductModal
          isOpen={isModalOpen}
          editingProduct={editingProduct}
          formData={formData}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({
              name: "",
              description: "",
              unitId: "",
              category: "",
            });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
}

