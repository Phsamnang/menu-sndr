"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import {
  exchangeRateService,
  ExchangeRate,
} from "@/services/exchange-rate.service";
import ExchangeRateModal from "./components/ExchangeRateModal";

export default function ExchangeRatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fromCurrencyFilter, setFromCurrencyFilter] = useState("");
  const [toCurrencyFilter, setToCurrencyFilter] = useState("");
  const queryClient = useQueryClient();

  const { data: exchangeRates = [], isLoading } = useQuery<ExchangeRate[]>({
    queryKey: ["exchange-rates", fromCurrencyFilter, toCurrencyFilter],
    queryFn: () =>
      exchangeRateService.getAll(
        fromCurrencyFilter || toCurrencyFilter
          ? {
              fromCurrency: fromCurrencyFilter || undefined,
              toCurrency: toCurrencyFilter || undefined,
            }
          : undefined
      ),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      fromCurrency: string;
      toCurrency: string;
      rate: number;
      effectiveDate?: string;
      source?: string;
    }) => exchangeRateService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
      setIsModalOpen(false);
    },
  });

  const columns: TableColumn<ExchangeRate>[] = [
    {
      key: "fromCurrency",
      label: "ពី",
      render: (item) => (
        <span className="font-medium text-slate-900">{item.fromCurrency}</span>
      ),
    },
    {
      key: "toCurrency",
      label: "ទៅ",
      render: (item) => (
        <span className="text-slate-700">{item.toCurrency}</span>
      ),
    },
    {
      key: "rate",
      label: "អត្រា",
      render: (item) => (
        <span className="text-slate-600 font-mono font-semibold">
          1 {item.fromCurrency} = {item.rate.toFixed(4)} {item.toCurrency}
        </span>
      ),
    },
    {
      key: "effectiveDate",
      label: "កាលបរិច្ឆេទអនុវត្ត",
      render: (item) => (
        <span className="text-slate-600 text-sm">
          {new Date(item.effectiveDate).toLocaleDateString("km-KH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "source",
      label: "ប្រភព",
      render: (item) => (
        <span className="text-slate-600 text-sm">{item.source || "-"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "បានបង្កើត",
      render: (item) => (
        <span className="text-slate-600 text-sm">
          {new Date(item.createdAt).toLocaleDateString("km-KH")}
        </span>
      ),
    },
  ];

  const currencies = ["USD", "KHR"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            គ្រប់គ្រងអត្រាប្តូរប្រាក់
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
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              បន្ថែមអត្រា
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">ពី</label>
            <select
              value={fromCurrencyFilter}
              onChange={(e) => setFromCurrencyFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">ទាំងអស់</option>
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ទៅ</label>
            <select
              value={toCurrencyFilter}
              onChange={(e) => setToCurrencyFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">ទាំងអស់</option>
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          {(fromCurrencyFilter || toCurrencyFilter) && (
            <button
              onClick={() => {
                setFromCurrencyFilter("");
                setToCurrencyFilter("");
              }}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
            >
              លុបចោល
            </button>
          )}
        </div>

        <Table
          columns={columns}
          data={exchangeRates}
          loading={isLoading}
          emptyMessage="រកមិនឃើញអត្រាប្តូរប្រាក់ទេ។"
        />

        <ExchangeRateModal
          isOpen={isModalOpen}
          isSubmitting={createMutation.isPending}
          onClose={() => setIsModalOpen(false)}
          onSubmit={(data) => {
            createMutation.mutate(data);
          }}
        />
      </div>
    </div>
  );
}


