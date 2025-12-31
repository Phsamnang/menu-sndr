"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { promotionService, Promotion } from "@/services/promotion.service";
import PromotionModal from "./components/PromotionModal";

export default function PromotionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);
  const queryClient = useQueryClient();

  const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
    queryKey: ["promotions", isActiveFilter],
    queryFn: () =>
      promotionService.getAll(
        isActiveFilter !== null ? { isActive: isActiveFilter } : undefined
      ),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => promotionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      promotionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
      setIsModalOpen(false);
      setEditingPromotion(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => promotionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsModalOpen(true);
  };

  const columns: TableColumn<Promotion>[] = [
    {
      key: "name",
      label: "ឈ្មោះ",
      render: (item) => (
        <span className="font-medium text-slate-900">{item.name}</span>
      ),
    },
    {
      key: "code",
      label: "កូដ",
      render: (item) => (
        <span className="text-slate-600 font-mono">
          {item.code || "-"}
        </span>
      ),
    },
    {
      key: "type",
      label: "ប្រភេទ",
      render: (item) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
          {item.type}
        </span>
      ),
    },
    {
      key: "value",
      label: "តម្លៃ",
      render: (item) => (
        <span className="text-slate-700">
          {item.type === "percentage" ? `${item.value}%` : `$${item.value}`}
        </span>
      ),
    },
    {
      key: "dates",
      label: "កាលបរិច្ឆេទ",
      render: (item) => (
        <span className="text-slate-600 text-sm">
          {new Date(item.startDate).toLocaleDateString()} -{" "}
          {new Date(item.endDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "usage",
      label: "ការប្រើប្រាស់",
      render: (item) => (
        <span className="text-slate-600">
          {item.usageCount}
          {item.usageLimit ? ` / ${item.usageLimit}` : ""}
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
              if (confirm("តើអ្នកពិតជាចង់លុបការផ្តល់ជូននេះមែនទេ?")) {
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
            គ្រប់គ្រងការផ្តល់ជូន
          </h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingPromotion(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមការផ្តល់ជូន
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <button
            onClick={() => setIsActiveFilter(null)}
            className={`px-4 py-2 rounded-lg ${
              isActiveFilter === null
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-700 border"
            }`}
          >
            ទាំងអស់
          </button>
          <button
            onClick={() => setIsActiveFilter(true)}
            className={`px-4 py-2 rounded-lg ${
              isActiveFilter === true
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-700 border"
            }`}
          >
            សកម្ម
          </button>
          <button
            onClick={() => setIsActiveFilter(false)}
            className={`px-4 py-2 rounded-lg ${
              isActiveFilter === false
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-700 border"
            }`}
          >
            អសកម្ម
          </button>
        </div>

        <Table
          columns={columns}
          data={promotions}
          loading={isLoading}
          emptyMessage="រកមិនឃើញការផ្តល់ជូនទេ។"
        />

        <PromotionModal
          isOpen={isModalOpen}
          editingPromotion={editingPromotion}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPromotion(null);
          }}
          onSubmit={(data) => {
            if (editingPromotion) {
              updateMutation.mutate({ id: editingPromotion.id, data });
            } else {
              createMutation.mutate(data);
            }
          }}
        />
      </div>
    </div>
  );
}

