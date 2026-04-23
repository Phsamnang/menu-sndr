"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Table, { TableColumn } from "@/components/Table";
import {
  recipeItemService,
  RecipeItem,
} from "@/services/recipe-item.service";
import { productService } from "@/services/product.service";
import { menuItemService } from "@/services/menu-item.service";
import RecipeItemModal from "./components/RecipeItemModal";

export default function RecipeItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RecipeItem | null>(null);
  const [formData, setFormData] = useState({
    menuItemId: "",
    productId: "",
    quantity: "",
    notes: "",
  });
  const [menuItemFilter, setMenuItemFilter] = useState("");
  const queryClient = useQueryClient();

  const { data: recipeItems = [], isLoading } = useQuery<RecipeItem[]>({
    queryKey: ["recipe-items", menuItemFilter],
    queryFn: () =>
      recipeItemService.getAll(
        menuItemFilter ? { menuItemId: menuItemFilter } : undefined
      ),
  });

  const { data: menuItemsData } = useQuery({
    queryKey: ["menu-items-all"],
    queryFn: () => menuItemService.getAll({ limit: 1000 }),
  });
  const menuItems = menuItemsData?.items || [];

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      menuItemId: string;
      productId: string;
      quantity: number;
      notes?: string;
    }) => recipeItemService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe-items"] });
      setIsModalOpen(false);
      setFormData({
        menuItemId: "",
        productId: "",
        quantity: "",
        notes: "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        quantity?: number;
        notes?: string;
      };
    }) => recipeItemService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe-items"] });
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({
        menuItemId: "",
        productId: "",
        quantity: "",
        notes: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recipeItemService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe-items"] });
    },
  });

  const handleEdit = (item: RecipeItem) => {
    setEditingItem(item);
    setFormData({
      menuItemId: item.menuItemId,
      productId: item.productId,
      quantity: item.quantity.toString(),
      notes: item.notes || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({
        id: editingItem.id,
        data: {
          quantity: parseFloat(formData.quantity),
          notes: formData.notes || undefined,
        },
      });
    } else {
      createMutation.mutate({
        menuItemId: formData.menuItemId,
        productId: formData.productId,
        quantity: parseFloat(formData.quantity),
        notes: formData.notes || undefined,
      });
    }
  };

  const columns: TableColumn<RecipeItem>[] = [
    {
      key: "menuItem",
      label: "មុខម្ហូប",
      render: (item) => (
        <span className="font-medium text-slate-900">
          {item.menuItem.name}
        </span>
      ),
    },
    {
      key: "product",
      label: "ផលិតផល",
      render: (item) => (
        <span className="text-slate-700">{item.product.name}</span>
      ),
    },
    {
      key: "quantity",
      label: "បរិមាណ",
      render: (item) => (
        <span className="text-slate-600">
          {item.quantity}{" "}
          {item.product.baseUnit?.symbol || item.product.baseUnit?.name || ""}
        </span>
      ),
    },
    {
      key: "notes",
      label: "កំណត់ចំណាំ",
      render: (item) => (
        <span className="text-slate-600 text-sm">{item.notes || "-"}</span>
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
              if (confirm("តើអ្នកពិតជាចង់លុបធាតុនេះមែនទេ?")) {
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
          <h1 className="text-3xl font-bold text-slate-800">
            គ្រប់គ្រងរូបមន្ត
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  menuItemId: "",
                  productId: "",
                  quantity: "",
                  notes: "",
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              បន្ថែមធាតុ
            </button>
          </div>
        </div>

        <div className="mb-4">
          <select
            value={menuItemFilter}
            onChange={(e) => setMenuItemFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">ទាំងអស់មុខម្ហូប</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <Table
          columns={columns}
          data={recipeItems}
          loading={isLoading}
          emptyMessage="រកមិនឃើញធាតុរូបមន្តទេ។"
        />

        <RecipeItemModal
          isOpen={isModalOpen}
          editingItem={editingItem}
          formData={formData}
          menuItems={menuItems}
          products={products}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
            setFormData({
              menuItemId: "",
              productId: "",
              quantity: "",
              notes: "",
            });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
}

