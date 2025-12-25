import Modal from "@/components/Modal";
import {
  Expense,
  ExpenseItem,
  expenseService,
} from "@/services/expense.service";
import { productService, Product } from "@/services/product.service";
import { unitService, Unit } from "@/services/unit.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import axiosInstance from "@/utils/axios-client";
import { ApiResponse } from "@/utils/api-client";

interface ExpenseItemsModalProps {
  isOpen: boolean;
  expense: Expense | null;
  onClose: () => void;
}

interface ExpenseItemForm {
  productId: string;
  productName: string;
  quantity: string;
  unitId: string;
  unitPrice: string;
  currency: string;
  paymentStatus: string;
  notes: string;
}

export default function ExpenseItemsModal({
  isOpen,
  expense,
  onClose,
}: ExpenseItemsModalProps) {
  const queryClient = useQueryClient();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExpenseItemForm>({
    productId: "",
    productName: "",
    quantity: "1",
    unitId: "",
    unitPrice: "0",
    currency: "USD",
    paymentStatus: "UNPAID",
    notes: "",
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: () => productService.getAll(),
    enabled: isOpen,
  });

  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: () => unitService.getAll(),
    enabled: isOpen,
  });

  const { data: expenseData, refetch } = useQuery<Expense>({
    queryKey: ["expense", expense?.id],
    queryFn: () => expenseService.getById(expense!.id),
    enabled: isOpen && !!expense,
  });

  const addItemMutation = useMutation({
    mutationFn: async (data: {
      productId?: string;
      productName: string;
      quantity: number;
      unit?: string;
      unitPrice: number;
      notes?: string;
    }) => {
      const response = await axiosInstance.post<ApiResponse<Expense>>(
        `/api/admin/expenses/${expense!.id}/items`,
        data
      );
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      refetch();
      resetForm();
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      data,
    }: {
      itemId: string;
      data: {
        productId?: string;
        productName?: string;
        quantity?: number;
        unit?: string;
        unitPrice?: number;
        notes?: string;
      };
    }) => {
      const response = await axiosInstance.put<ApiResponse<Expense>>(
        `/api/admin/expenses/${expense!.id}/items`,
        { itemId, ...data }
      );
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      refetch();
      resetForm();
      setEditingItemId(null);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await axiosInstance.delete<ApiResponse<Expense>>(
        `/api/admin/expenses/${expense!.id}/items?itemId=${itemId}`
      );
      return response.data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      refetch();
    },
  });

  const resetForm = () => {
    setFormData({
      productId: "",
      productName: "",
      quantity: "1",
      unitId: "",
      unitPrice: "0",
      currency: "USD",
      paymentStatus: "UNPAID",
      notes: "",
    });
    setEditingItemId(null);
    setEditingItemId(null);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        productId: product.id,
        productName: product.name,
        unitId: product.unitId || "",
      });
    }
  };

  const handleEdit = (item: ExpenseItem) => {
    setEditingItemId(item.id);
    setFormData({
      productId: item.productId || "",
      productName: item.productName,
      quantity: item.quantity.toString(),
      unitId: item.unitId || "",
      unitPrice: item.unitPrice.toString(),
      currency: item.currency || "USD",
      paymentStatus: item.paymentStatus || "UNPAID",
      notes: item.notes || "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      productId: formData.productId || undefined,
      productName: formData.productName,
      quantity: parseFloat(formData.quantity),
      unitId: formData.unitId || undefined,
      unitPrice: parseFloat(formData.unitPrice),
      currency: formData.currency,
      paymentStatus: formData.paymentStatus,
      notes: formData.notes || undefined,
    };

    if (editingItemId) {
      updateItemMutation.mutate({ itemId: editingItemId, data });
    } else {
      addItemMutation.mutate(data);
    }
  };

  const items = expenseData?.items || [];

  // USD totals
  const totalAmountUSD = items
    .filter((item) => item.currency === "USD")
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPaidUSD = items
    .filter((item) => item.currency === "USD" && item.paymentStatus === "PAID")
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const totalUnpaidUSD = items
    .filter(
      (item) => item.currency === "USD" && item.paymentStatus === "UNPAID"
    )
    .reduce((sum, item) => sum + item.totalPrice, 0);

  // KHR totals
  const totalAmountKHR = items
    .filter((item) => item.currency === "KHR")
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const totalPaidKHR = items
    .filter((item) => item.currency === "KHR" && item.paymentStatus === "PAID")
    .reduce((sum, item) => sum + item.totalPrice, 0);
  const totalUnpaidKHR = items
    .filter(
      (item) => item.currency === "KHR" && item.paymentStatus === "UNPAID"
    )
    .reduce((sum, item) => sum + item.totalPrice, 0);

  if (!expense) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetForm();
        setEditingItemId(null);
      }}
      title={`គ្រប់គ្រងផលិតផល - ${expense.title}`}
      size="3xl"
    >
      <div>
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-3">
              {editingItemId ? "កែប្រែផលិតផល" : "បន្ថែមផលិតផល"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  ជ្រើសរើសផលិតផល
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full px-2 py-1.5 border rounded text-sm"
                >
                  <option value="">-- ជ្រើសរើស --</option>
                  {products
                    .filter((p) => p.isActive)
                    .map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                        {product.unit
                          ? ` (${
                              product.unit.displayName || product.unit.name
                            })`
                          : ""}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  ឈ្មោះផលិតផល *
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productId: "",
                      productName: e.target.value,
                    })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  required
                  placeholder="ឈ្មោះផលិតផល"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  បរិមាណ *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">ឯកតា</label>
                <select
                  value={formData.unitId}
                  onChange={(e) =>
                    setFormData({ ...formData, unitId: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                >
                  <option value="">ជ្រើសរើសឯកតា</option>
                  {units
                    .filter((u) => u.isActive)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.displayName} {u.symbol ? `(${u.symbol})` : ""}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  តម្លៃ/ឯកតា *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.unitPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, unitPrice: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  រូបិយប័ណ្ណ
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KHR">KHR (៛)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  ស្ថានភាពបង់ប្រាក់
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) =>
                    setFormData({ ...formData, paymentStatus: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                >
                  <option value="PAID">បង់ហើយ (Paid)</option>
                  <option value="UNPAID">មិនទាន់បង់ (Unpaid)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  កំណត់ចំណាំ
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-2 py-1.5 border rounded text-sm"
                  placeholder="កំណត់ចំណាំ"
                />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="submit"
                disabled={
                  addItemMutation.isPending || updateItemMutation.isPending
                }
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
              >
                {editingItemId ? "ធ្វើបច្ចុប្បន្នភាព" : "បន្ថែម"}
              </button>
              {editingItemId && (
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditingItemId(null);
                  }}
                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 text-sm"
                >
                  បោះបង់
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="mb-4">
          <h3 className="font-semibold mb-3">ផលិតផល ({items.length})</h3>
          {items.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">
              មិនមានផលិតផលទេ។ បន្ថែមផលិតផលខាងលើ
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-slate-100 border-b">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                      ឈ្មោះផលិតផល
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-slate-700">
                      បរិមាណ
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-slate-700">
                      ឯកតា
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">
                      តម្លៃ/ឯកតា
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-slate-700">
                      សរុប
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-slate-700">
                      រូបិយប័ណ្ណ
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-slate-700">
                      ស្ថានភាព
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-700">
                      កំណត់ចំណាំ
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-slate-700">
                      សកម្មភាព
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="px-3 py-2 text-sm font-medium text-slate-900">
                        {item.productName}
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-slate-600">
                        {item.quantity}
                      </td>
                      <td className="px-3 py-2 text-sm text-center text-slate-600">
                        {item.unit?.displayName || item.unit?.name || "-"}
                      </td>
                      <td className="px-3 py-2 text-sm text-right text-slate-600">
                        {item.currency === "KHR" ? "៛" : "$"}
                        {item.unitPrice.toFixed(2)}
                      </td>
                      <td
                        className={`px-3 py-2 text-sm text-right font-semibold ${
                          item.currency === "KHR"
                            ? "text-green-700"
                            : "text-blue-700"
                        }`}
                      >
                        {item.currency === "KHR" ? "៛" : "$"}
                        {item.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            item.currency === "USD"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.currency}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            item.paymentStatus === "PAID"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {item.paymentStatus === "PAID"
                            ? "បង់ហើយ"
                            : "មិនទាន់បង់"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500 max-w-xs truncate">
                        {item.notes || "-"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                            title="កែប្រែ"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("តើអ្នកពិតជាចង់លុបផលិតផលនេះមែនទេ?")) {
                                deleteItemMutation.mutate(item.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="លុប"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-6">
            {/* USD Summary */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">USD Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">សរុប:</span>
                  <span className="text-lg font-bold text-blue-700">
                    ${totalAmountUSD.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">បង់ហើយ:</span>
                  <span className="text-lg font-bold text-green-700">
                    ${totalPaidUSD.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">មិនទាន់បង់:</span>
                  <span className="text-lg font-bold text-orange-700">
                    ${totalUnpaidUSD.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* KHR Summary */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-3">KHR Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">សរុប:</span>
                  <span className="text-lg font-bold text-green-700">
                    ៛{totalAmountKHR.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">បង់ហើយ:</span>
                  <span className="text-lg font-bold text-green-700">
                    ៛{totalPaidKHR.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-700">មិនទាន់បង់:</span>
                  <span className="text-lg font-bold text-orange-700">
                    ៛{totalUnpaidKHR.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
