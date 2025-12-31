"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import {
  unitConversionService,
  UnitConversion,
} from "@/services/unit-conversion.service";
import { unitService } from "@/services/unit.service";
import UnitConversionModal from "./components/UnitConversionModal";

export default function UnitConversionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConversion, setEditingConversion] =
    useState<UnitConversion | null>(null);
  const [formData, setFormData] = useState({
    fromUnitId: "",
    toUnitId: "",
    conversionRate: "",
    description: "",
  });
  const queryClient = useQueryClient();

  const { data: conversions = [], isLoading } = useQuery<UnitConversion[]>({
    queryKey: ["unit-conversions"],
    queryFn: () => unitConversionService.getAll(),
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: () => unitService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      fromUnitId: string;
      toUnitId: string;
      conversionRate: number;
      description?: string;
    }) => unitConversionService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-conversions"] });
      setIsModalOpen(false);
      setFormData({
        fromUnitId: "",
        toUnitId: "",
        conversionRate: "",
        description: "",
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
        conversionRate?: number;
        description?: string;
      };
    }) => unitConversionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-conversions"] });
      setIsModalOpen(false);
      setEditingConversion(null);
      setFormData({
        fromUnitId: "",
        toUnitId: "",
        conversionRate: "",
        description: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => unitConversionService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unit-conversions"] });
    },
  });

  const handleEdit = (conversion: UnitConversion) => {
    setEditingConversion(conversion);
    setFormData({
      fromUnitId: conversion.fromUnitId,
      toUnitId: conversion.toUnitId,
      conversionRate: conversion.conversionRate.toString(),
      description: conversion.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConversion) {
      updateMutation.mutate({
        id: editingConversion.id,
        data: {
          conversionRate: parseFloat(formData.conversionRate),
          description: formData.description || undefined,
        },
      });
    } else {
      createMutation.mutate({
        fromUnitId: formData.fromUnitId,
        toUnitId: formData.toUnitId,
        conversionRate: parseFloat(formData.conversionRate),
        description: formData.description || undefined,
      });
    }
  };

  const columns: TableColumn<UnitConversion>[] = [
    {
      key: "fromUnit",
      label: "ពី",
      render: (item) => (
        <span className="font-medium text-slate-900">
          {item.fromUnit.displayName} ({item.fromUnit.symbol || item.fromUnit.name})
        </span>
      ),
    },
    {
      key: "toUnit",
      label: "ទៅ",
      render: (item) => (
        <span className="text-slate-700">
          {item.toUnit.displayName} ({item.toUnit.symbol || item.toUnit.name})
        </span>
      ),
    },
    {
      key: "conversionRate",
      label: "អត្រាបម្លែង",
      render: (item) => (
        <span className="text-slate-600 font-mono">
          1 {item.fromUnit.symbol || item.fromUnit.name} = {item.conversionRate}{" "}
          {item.toUnit.symbol || item.toUnit.name}
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
              if (confirm("តើអ្នកពិតជាចង់លុបការបម្លែងនេះមែនទេ?")) {
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
            គ្រប់គ្រងការបម្លែងឯកតា
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
                setEditingConversion(null);
                setFormData({
                  fromUnitId: "",
                  toUnitId: "",
                  conversionRate: "",
                  description: "",
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមការបម្លែង
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={conversions}
          loading={isLoading}
          emptyMessage="រកមិនឃើញការបម្លែងឯកតាទេ។"
        />

        <UnitConversionModal
          isOpen={isModalOpen}
          editingConversion={editingConversion}
          formData={formData}
          units={units}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setIsModalOpen(false);
            setEditingConversion(null);
            setFormData({
              fromUnitId: "",
              toUnitId: "",
              conversionRate: "",
              description: "",
            });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
}

