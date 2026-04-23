"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Table, { TableColumn } from "@/components/Table";
import { inventoryService, Inventory } from "@/services/inventory.service";
import { productService } from "@/services/product.service";
import { unitService } from "@/services/unit.service";
import Modal from "@/components/Modal";

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(
    null
  );
  const [formData, setFormData] = useState({
    productId: "",
    currentStock: 0,
    minStockLevel: 0,
    maxStockLevel: 0,
    unitId: "",
    averageCost: 0,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", page, search, lowStockOnly],
    queryFn: () =>
      inventoryService.getAll({
        page,
        limit: 10,
        search: search || undefined,
        lowStock: lowStockOnly || undefined,
      }),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productService.getAll(),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: () => unitService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => inventoryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
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
    }) => inventoryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsModalOpen(false);
      setEditingInventory(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  const resetForm = () => {
    setFormData({
      productId: "",
      currentStock: 0,
      minStockLevel: 0,
      maxStockLevel: 0,
      unitId: "",
      averageCost: 0,
    });
  };

  const handleEdit = (inventory: Inventory) => {
    setEditingInventory(inventory);
    setFormData({
      productId: inventory.productId,
      currentStock: inventory.currentStock,
      minStockLevel: inventory.minStockLevel,
      maxStockLevel: inventory.maxStockLevel || 0,
      unitId: inventory.unitId,
      averageCost: inventory.averageCost,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInventory) {
      updateMutation.mutate({ id: editingInventory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns: TableColumn<Inventory>[] = [
    {
      key: "product",
      label: "ផលិតផល",
      render: (item) => (
        <div>
          <span className="font-medium text-slate-900">
            {item.product?.name || "N/A"}
          </span>
          {item.product?.sku && (
            <span className="text-xs text-slate-500 ml-2">
              ({item.product.sku})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "currentStock",
      label: "ស្តុកបច្ចុប្បន្ន",
      render: (item) => (
        <span
          className={
            item.currentStock <= item.minStockLevel
              ? "text-red-600 font-semibold"
              : "text-slate-700"
          }
        >
          {item.currentStock} {item.unit?.symbol || ""}
        </span>
      ),
    },
    {
      key: "minStockLevel",
      label: "កម្រិតអប្បបរមា",
      render: (item) => (
        <span className="text-slate-600">
          {item.minStockLevel} {item.unit?.symbol || ""}
        </span>
      ),
    },
    {
      key: "maxStockLevel",
      label: "កម្រិតអតិបរមា",
      render: (item) => (
        <span className="text-slate-600">
          {item.maxStockLevel
            ? `${item.maxStockLevel} ${item.unit?.symbol || ""}`
            : "-"}
        </span>
      ),
    },
    {
      key: "averageCost",
      label: "តម្លៃមធ្យម",
      render: (item) => (
        <span className="text-slate-700">${item.averageCost.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "ស្ថានភាព",
      render: (item) => {
        const isLow = item.currentStock <= item.minStockLevel;
        return (
          <span
            className={`px-2 py-1 rounded ${
              isLow ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {isLow ? "ស្តុកទាប" : "ធម្មតា"}
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
            className="btn-primary-md"
          >
            កែប្រែ
          </button>
          <button
            onClick={() => {
              if (confirm("តើអ្នកចង់លុបស្តុកនេះ?")) {
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
          <h1 className="text-3xl font-bold text-slate-800">ស្តុក</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditingInventory(null);
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              បន្ថែមស្តុក
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <input
            type="text"
            placeholder="ស្វែងរក..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="flex-1 max-w-md px-4 py-2 border rounded-lg"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => {
                setLowStockOnly(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">ស្តុកទាបតែប៉ុណ្ណោះ</span>
          </label>
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
          title={editingInventory ? "កែប្រែស្តុក" : "បន្ថែមស្តុក"}
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ផលិតផល *</label>
              <select
                value={formData.productId}
                onChange={(e) =>
                  setFormData({ ...formData, productId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
                disabled={!!editingInventory}
              >
                <option value="">ជ្រើសរើសផលិតផល</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ឯកតា *</label>
              <select
                value={formData.unitId}
                onChange={(e) =>
                  setFormData({ ...formData, unitId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">ជ្រើសរើសឯកតា</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.displayName} ({unit.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                ស្តុកបច្ចុប្បន្ន
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.currentStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentStock: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                កម្រិតអប្បបរមា
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.minStockLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minStockLevel: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                កម្រិតអតិបរមា
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.maxStockLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxStockLevel: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                តម្លៃមធ្យម
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.averageCost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    averageCost: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "កំពុងដំណើរការ..."
                  : editingInventory
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
