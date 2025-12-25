"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import {
  expenseService,
  Expense,
  CreateExpenseItemData,
} from "@/services/expense.service";
import ExpenseModal from "./components/ExpenseModal";
import ExpenseItemsModal from "./components/ExpenseItemsModal";
import { FaDollarSign, FaFilter, FaBox, FaDownload } from "react-icons/fa";

const expenseCategories = [
  "វត្ថុធាតុដើម",
  "ប្រាក់ខែ",
  "ជួល",
  "ឧបករណ៍",
  "ផ្សេងៗ",
];

export default function ExpensesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemsModalOpen, setIsItemsModalOpen] = useState(false);
  const [selectedExpenseForItems, setSelectedExpenseForItems] =
    useState<Expense | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });
  const queryClient = useQueryClient();

  const filters = useMemo(() => {
    const filter: any = {};
    if (selectedCategory) filter.category = selectedCategory;
    if (startDate) filter.startDate = new Date(startDate).toISOString();
    if (endDate) filter.endDate = new Date(endDate).toISOString();
    return filter;
  }, [selectedCategory, startDate, endDate]);

  const { data: expensesData, isLoading } = useQuery<{
    items: Expense[];
    total: number;
  }>({
    queryKey: ["expenses", filters],
    queryFn: () => expenseService.getAll(filters),
  });

  const expenses = useMemo(() => expensesData?.items || [], [expensesData]);

  const totalAmountUSD = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      const usdItems =
        expense.items?.filter((item: any) => item.currency === "USD") || [];
      const usdTotal = usdItems.reduce(
        (itemSum: number, item: any) => itemSum + item.totalPrice,
        0
      );
      return sum + usdTotal;
    }, 0);
  }, [expenses]);

  const totalAmountKHR = useMemo(() => {
    return expenses.reduce((sum, expense) => {
      const khrItems =
        expense.items?.filter((item: any) => item.currency === "KHR") || [];
      const khrTotal = khrItems.reduce(
        (itemSum: number, item: any) => itemSum + item.totalPrice,
        0
      );
      return sum + khrTotal;
    }, 0);
  }, [expenses]);

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      category: string;
      date?: string;
      items?: CreateExpenseItemData[];
    }) => expenseService.create({ ...data, items: data.items || [] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsModalOpen(false);
      setFormData({
        title: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
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
        title?: string;
        description?: string;
        amount?: number;
        category?: string;
        date?: string;
        receiptNumber?: string;
        vendor?: string;
        paymentMethod?: string;
        receiptImage?: string;
        notes?: string;
      };
    }) => expenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsModalOpen(false);
      setEditingExpense(null);
      setFormData({
        title: "",
        category: "",
        date: new Date().toISOString().split("T")[0],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      category: expense.category,
      date: new Date(expense.date).toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleManageProducts = (expense: Expense) => {
    setSelectedExpenseForItems(expense);
    setIsItemsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      const submitData = {
        title: formData.title,
        category: formData.category,
        date: formData.date,
      };
      updateMutation.mutate({ id: editingExpense.id, data: submitData });
    } else {
      const submitData = {
        title: formData.title,
        category: formData.category,
        date: formData.date,
        currency: "USD",
        items: [],
      };
      createMutation.mutate(submitData);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setStartDate("");
    setEndDate("");
  };

  const columns: TableColumn<Expense>[] = [
    {
      key: "date",
      label: "កាលបរិច្ឆេទ",
      render: (item) => {
        const date = new Date(item.date);
        return date.toLocaleDateString("km-KH");
      },
    },
    {
      key: "title",
      label: "ចំណងជើង",
      render: (item) => (
        <span className="font-medium text-slate-900">{item.title}</span>
      ),
    },
    {
      key: "category",
      label: "ប្រភេទ",
      render: (item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {item.category}
        </span>
      ),
    },
    {
      key: "items",
      label: "ចំនួនផលិតផល",
      render: (item) => (
        <span className="text-slate-600">{item.items?.length || 0} ផលិតផល</span>
      ),
    },
    {
      key: "amount",
      label: "ចំនួនទឹកប្រាក់",
      render: (item) => {
        const usdItems =
          item.items?.filter((i: any) => i.currency === "USD") || [];
        const khrItems =
          item.items?.filter((i: any) => i.currency === "KHR") || [];
        const usdTotal = usdItems.reduce(
          (sum: number, i: any) => sum + i.totalPrice,
          0
        );
        const khrTotal = khrItems.reduce(
          (sum: number, i: any) => sum + i.totalPrice,
          0
        );
        return (
          <div className="flex flex-col gap-1">
            {usdTotal > 0 && (
              <span className="font-semibold text-blue-700">
                USD: ${usdTotal.toFixed(2)}
              </span>
            )}
            {khrTotal > 0 && (
              <span className="font-semibold text-green-700 text-sm">
                KHR: ៛{khrTotal.toFixed(2)}
              </span>
            )}
            {usdTotal === 0 && khrTotal === 0 && (
              <span className="text-slate-400 text-sm">$0.00</span>
            )}
          </div>
        );
      },
    },
    {
      key: "vendor",
      label: "អ្នកផ្គត់ផ្គង់",
      render: (item) => (
        <span className="text-slate-600 text-sm">{item.vendor || "-"}</span>
      ),
    },
    {
      key: "receiptNumber",
      label: "លេខបង្កាន់ដៃ",
      render: (item) => (
        <span className="text-slate-600 text-sm font-mono">
          {item.receiptNumber || "-"}
        </span>
      ),
    },
    {
      key: "paymentMethod",
      label: "វិធីសាស្ត្រ",
      render: (item) => (
        <span className="text-slate-600 text-sm">
          {item.paymentMethod || "-"}
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
              handleManageProducts(item);
            }}
            className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
            title="គ្រប់គ្រងផលិតផល"
          >
            <FaBox />
            <span>ផលិតផល</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const cacheBuster = Date.now();
              const imageUrl = `${window.location.origin}/api/admin/expenses/${item.id}/invoice-image?t=${cacheBuster}`;
              const link = document.createElement("a");
              link.href = imageUrl;
              link.download = `expense-invoice-${item.title}-${item.id}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-1"
            title="ទាញយកវិក្កយបត្រ"
          >
            <FaDownload />
            <span>វិក្កយបត្រ</span>
          </button>
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
              if (confirm("តើអ្នកពិតជាចង់លុបចំណាយនេះមែនទេ?")) {
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
          <h1 className="text-3xl font-bold text-slate-800">គ្រប់គ្រងចំណាយ</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingExpense(null);
                setFormData({
                  title: "",
                  category: "",
                  date: new Date().toISOString().split("T")[0],
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 flex items-center gap-2"
            >
              <FaDollarSign />
              <span>បន្ថែមចំណាយ</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-800">តម្រង</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">ប្រភេទ</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">ទាំងអស់</option>
                {expenseCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                ពីកាលបរិច្ឆេទ
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                ដល់កាលបរិច្ឆេទ
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
              >
                លុបតម្រង
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-slate-600">ចំនួនចំណាយសរុប</p>
              <p className="text-2xl font-bold text-slate-800">
                {expenses.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-600">សរុប USD</p>
              <p className="text-2xl font-bold text-blue-700">
                ${totalAmountUSD.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-600">សរុប KHR</p>
              <p className="text-2xl font-bold text-green-700">
                ៛{totalAmountKHR.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <Table
          columns={columns}
          data={expenses}
          loading={isLoading}
          emptyMessage="រកមិនឃើញចំណាយទេ។"
        />

        <ExpenseModal
          isOpen={isModalOpen}
          editingExpense={editingExpense}
          formData={formData}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
            setFormData({
              title: "",
              category: "",
              date: new Date().toISOString().split("T")[0],
            });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />

        <ExpenseItemsModal
          isOpen={isItemsModalOpen}
          expense={selectedExpenseForItems}
          onClose={() => {
            setIsItemsModalOpen(false);
            setSelectedExpenseForItems(null);
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
          }}
        />
      </div>
    </div>
  );
}
