"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import {
  dailySummaryService,
  DailySummary,
} from "@/services/daily-summary.service";
import Modal from "@/components/Modal";

export default function DailySummariesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const queryClient = useQueryClient();

  const { data: summaries = [], isLoading } = useQuery<DailySummary[]>({
    queryKey: ["daily-summaries", startDateFilter, endDateFilter],
    queryFn: () =>
      dailySummaryService.getAll(
        startDateFilter || endDateFilter
          ? {
              startDate: startDateFilter || undefined,
              endDate: endDateFilter || undefined,
            }
          : undefined
      ),
  });

  const createMutation = useMutation({
    mutationFn: (data: { date: string }) => dailySummaryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-summaries"] });
      setIsModalOpen(false);
      setSelectedDate(new Date().toISOString().split("T")[0]);
    },
  });

  const handleCreate = () => {
    createMutation.mutate({ date: selectedDate });
  };

  const columns: TableColumn<DailySummary>[] = [
    {
      key: "date",
      label: "កាលបរិច្ឆេទ",
      render: (item) => (
        <span className="font-medium text-slate-900">
          {new Date(item.date).toLocaleDateString("km-KH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "totalOrders",
      label: "ការបញ្ជាទិញសរុប",
      render: (item) => (
        <span className="text-slate-700">{item.totalOrders}</span>
      ),
    },
    {
      key: "totalRevenue",
      label: "ចំណូលសរុប",
      render: (item) => (
        <span className="text-green-600 font-semibold">
          ${item.totalRevenue.toFixed(2)}
        </span>
      ),
    },
    {
      key: "totalExpenses",
      label: "ចំណាយសរុប",
      render: (item) => (
        <span className="text-red-600 font-semibold">
          ${item.totalExpenses.toFixed(2)}
        </span>
      ),
    },
    {
      key: "netProfit",
      label: "ចំណេញសុទ្ធ",
      render: (item) => (
        <span
          className={`font-semibold ${
            item.netProfit >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          ${item.netProfit.toFixed(2)}
        </span>
      ),
    },
    {
      key: "avgOrderValue",
      label: "តម្លៃមធ្យមការបញ្ជាទិញ",
      render: (item) => (
        <span className="text-slate-600">
          ${item.avgOrderValue.toFixed(2)}
        </span>
      ),
    },
    {
      key: "topMenuItem",
      label: "មុខម្ហូបពេញនិយម",
      render: (item) => (
        <span className="text-slate-600 text-sm">
          {item.topMenuItem || "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            សង្ខេបប្រចាំថ្ងៃ
          </h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បង្កើតសង្ខេប
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">
              ថ្ងៃចាប់ផ្តើម
            </label>
            <input
              type="date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ថ្ងៃបញ្ចប់</label>
            <input
              type="date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          {(startDateFilter || endDateFilter) && (
            <button
              onClick={() => {
                setStartDateFilter("");
                setEndDateFilter("");
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              លុបចោល
            </button>
          )}
        </div>

        <Table
          columns={columns}
          data={summaries}
          loading={isLoading}
          emptyMessage="រកមិនឃើញសង្ខេបទេ។"
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="បង្កើតសង្ខេបប្រចាំថ្ងៃ"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              កាលបរិច្ឆេទ *
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              សង្ខេបនឹងត្រូវបានគណនាដោយស្វ័យប្រវត្តិពីការបញ្ជាទិញ និងចំណាយនៅថ្ងៃនេះ
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending
                ? "កំពុងដំណើរការ..."
                : "បង្កើតសង្ខេប"}
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
            >
              បោះបង់
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

