"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import {
  stockMovementService,
  StockMovement,
} from "@/services/stock-movement.service";
import { productService } from "@/services/product.service";
import { unitService } from "@/services/unit.service";
import Modal from "@/components/Modal";

export default function StockMovementsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    type: "IN",
    quantity: 0,
    unitId: "",
    unitCost: 0,
    reason: "",
    reference: "",
    notes: "",
  });
  const [page, setPage] = useState(1);
  const [productFilter, setProductFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["stock-movements", page, productFilter, typeFilter],
    queryFn: () =>
      stockMovementService.getAll({
        page,
        limit: 10,
        productId: productFilter || undefined,
        type: typeFilter || undefined,
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
    mutationFn: (data: typeof formData) => stockMovementService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      productId: "",
      type: "IN",
      quantity: 0,
      unitId: "",
      unitCost: 0,
      reason: "",
      reference: "",
      notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const columns: TableColumn<StockMovement>[] = [
    {
      key: "product",
      label: "ផលិតផល",
      render: (item) => (
        <span className="font-medium text-slate-900">
          {item.product?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "type",
      label: "ប្រភេទ",
      render: (item) => {
        const typeColors: Record<string, string> = {
          IN: "bg-green-100 text-green-800",
          OUT: "bg-red-100 text-red-800",
          ADJUSTMENT: "badge-primary",
          WASTE: "bg-orange-100 text-orange-800",
          RETURN: "bg-purple-100 text-purple-800",
        };
        const typeLabels: Record<string, string> = {
          IN: "ចូល",
          OUT: "ចេញ",
          ADJUSTMENT: "កែតម្រូវ",
          WASTE: "ខាតបង់",
          RETURN: "ត្រឡប់",
        };
        return (
          <span
            className={`px-2 py-1 rounded ${
              typeColors[item.type] || "bg-slate-100 text-slate-600"
            }`}
          >
            {typeLabels[item.type] || item.type}
          </span>
        );
      },
    },
    {
      key: "quantity",
      label: "បរិមាណ",
      render: (item) => (
        <span className="text-slate-700">
          {item.quantity} {item.unit?.symbol || ""}
        </span>
      ),
    },
    {
      key: "unitCost",
      label: "តម្លៃ/ឯកតា",
      render: (item) => (
        <span className="text-slate-700">
          {item.unitCost ? `$${item.unitCost.toFixed(2)}` : "-"}
        </span>
      ),
    },
    {
      key: "totalCost",
      label: "តម្លៃសរុប",
      render: (item) => (
        <span className="text-slate-700">
          {item.totalCost ? `$${item.totalCost.toFixed(2)}` : "-"}
        </span>
      ),
    },
    {
      key: "reason",
      label: "មូលហេតុ",
      render: (item) => (
        <span className="text-slate-600">{item.reason || "-"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "កាលបរិច្ឆេទ",
      render: (item) => (
        <span className="text-slate-600">
          {new Date(item.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">ចលនាស្តុក</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមចលនា
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <select
            value={productFilter}
            onChange={(e) => {
              setProductFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">ទាំងអស់ផលិតផល</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">ទាំងអស់ប្រភេទ</option>
            <option value="IN">ចូល</option>
            <option value="OUT">ចេញ</option>
            <option value="ADJUSTMENT">កែតម្រូវ</option>
            <option value="WASTE">ខាតបង់</option>
            <option value="RETURN">ត្រឡប់</option>
          </select>
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
          title="បន្ថែមចលនាស្តុក"
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
              <label className="block text-sm font-medium mb-2">ប្រភេទ *</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="IN">ចូល</option>
                <option value="OUT">ចេញ</option>
                <option value="ADJUSTMENT">កែតម្រូវ</option>
                <option value="WASTE">ខាតបង់</option>
                <option value="RETURN">ត្រឡប់</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">បរិមាណ *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
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
                តម្លៃ/ឯកតា (សម្រាប់ចូល)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitCost}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitCost: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">មូលហេតុ</label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="ឧ. ទិញថ្មី, ប្រើប្រាស់, ខូច"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">ឯកសារយោង</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="លេខបញ្ជាទិញ, លេខចំណាយ"
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
                rows={3}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50"
              >
                {createMutation.isPending ? "កំពុងដំណើរការ..." : "បង្កើត"}
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

