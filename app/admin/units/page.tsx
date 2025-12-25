"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { unitService, Unit } from "@/services/unit.service";
import UnitModal from "./components/UnitModal";

export default function UnitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    symbol: "",
    order: "0",
  });
  const queryClient = useQueryClient();

  const { data: units = [], isLoading } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: () => unitService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      displayName: string;
      symbol?: string;
      order?: number;
    }) => unitService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setIsModalOpen(false);
      setFormData({ name: "", displayName: "", symbol: "", order: "0" });
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
        displayName?: string;
        symbol?: string;
        order?: number;
        isActive?: boolean;
      };
    }) => unitService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setIsModalOpen(false);
      setEditingUnit(null);
      setFormData({ name: "", displayName: "", symbol: "", order: "0" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => unitService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
    },
  });

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      displayName: unit.displayName,
      symbol: unit.symbol || "",
      order: unit.order.toString(),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUnit) {
      updateMutation.mutate({
        id: editingUnit.id,
        data: {
          name: formData.name,
          displayName: formData.displayName,
          symbol: formData.symbol || undefined,
          order: parseInt(formData.order) || 0,
        },
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        displayName: formData.displayName,
        symbol: formData.symbol || undefined,
        order: parseInt(formData.order) || 0,
      });
    }
  };

  const columns: TableColumn<Unit>[] = [
    {
      key: "name",
      label: "ឈ្មោះ",
      render: (item) => (
        <span className="font-medium text-slate-900">{item.name}</span>
      ),
    },
    {
      key: "displayName",
      label: "ឈ្មោះបង្ហាញ",
      render: (item) => (
        <span className="text-slate-700">{item.displayName}</span>
      ),
    },
    {
      key: "symbol",
      label: "និមិត្តសញ្ញា",
      render: (item) => (
        <span className="text-slate-600 font-mono">
          {item.symbol || "-"}
        </span>
      ),
    },
    {
      key: "order",
      label: "លំដាប់",
      render: (item) => (
        <span className="text-slate-600">{item.order}</span>
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
              if (confirm("តើអ្នកពិតជាចង់លុបឯកតានេះមែនទេ?")) {
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
          <h1 className="text-3xl font-bold text-slate-800">គ្រប់គ្រងឯកតា</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingUnit(null);
                setFormData({ name: "", displayName: "", symbol: "", order: "0" });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមឯកតា
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          data={units}
          loading={isLoading}
          emptyMessage="រកមិនឃើញឯកតាទេ។"
        />

        <UnitModal
          isOpen={isModalOpen}
          editingUnit={editingUnit}
          formData={formData}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setIsModalOpen(false);
            setEditingUnit(null);
            setFormData({ name: "", displayName: "", symbol: "", order: "0" });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
}

