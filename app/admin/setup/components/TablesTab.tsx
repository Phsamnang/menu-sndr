"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import Table from "@/components/Table";
import { tableService, TableItem } from "@/services/table.service";
import { tableTypeService, TableType } from "@/services/table-type.service";
import TableModal from "./TableModal";

const EMPTY_FORM = {
  number: "",
  name: "",
  capacity: 4,
  tableTypeId: "",
  status: "available",
};

export default function TablesTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const queryClient = useQueryClient();

  const { data: tables = [], isLoading } = useQuery<TableItem[]>({
    queryKey: ["tables"],
    queryFn: () => tableService.getAll(),
  });

  const { data: tableTypes = [] } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: () => tableTypeService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => tableService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("បានបន្ថែមតុដោយជោគជ័យ!");
      setIsModalOpen(false);
      setFormData(EMPTY_FORM);
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចបន្ថែមតុបានទេ");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      tableService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("បានកែប្រែតុដោយជោគជ័យ!");
      setIsModalOpen(false);
      setEditingTable(null);
      setFormData(EMPTY_FORM);
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចកែប្រែតុបានទេ");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      toast.success("បានលុបតុដោយជោគជ័យ!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចលុបតុនេះបានទេ");
    },
  });

  const handleEdit = (table: TableItem) => {
    setEditingTable(table);
    setFormData({
      number: table.number,
      name: table.name || "",
      capacity: table.capacity,
      tableTypeId: table.tableTypeId,
      status: table.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTable) {
      updateMutation.mutate({ id: editingTable.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "អាចប្រើបាន";
      case "occupied":
        return "កំពុងប្រើ";
      case "reserved":
        return "កក់ទុក";
      case "maintenance":
        return "កំពុងជួសជុល";
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            setEditingTable(null);
            setFormData(EMPTY_FORM);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          បន្ថែមតុ
        </button>
      </div>

      <Table
        columns={[
          {
            key: "number",
            label: "លេខតុ",
            render: (item) => (
              <span className="font-medium text-slate-900">{item.number}</span>
            ),
          },
          {
            key: "name",
            label: "ឈ្មោះ",
            render: (item) => (
              <span className="text-slate-700">{item.name || "-"}</span>
            ),
          },
          {
            key: "capacity",
            label: "ចំនួនអាចអង្គុយ",
            render: (item) => (
              <span className="text-slate-700">{item.capacity}</span>
            ),
          },
          {
            key: "tableType",
            label: "ប្រភេទតុ",
            render: (item) => (
              <span className="text-slate-700">{item.tableType.displayName}</span>
            ),
          },
          {
            key: "status",
            label: "ស្ថានភាព",
            render: (item) => (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  item.status
                )}`}
              >
                {getStatusLabel(item.status)}
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
                  className="btn-primary-sm"
                >
                  កែប្រែ
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!confirm(`លុបតុ "${item.number}" មែនទេ?`)) return;
                    deleteMutation.mutate(item.id);
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  លុប
                </button>
              </div>
            ),
          },
        ]}
        data={tables}
        loading={isLoading}
        emptyMessage="រកមិនឃើញតុទេ។"
      />

      <TableModal
        isOpen={isModalOpen}
        editingTable={editingTable}
        formData={formData}
        tableTypes={tableTypes}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTable(null);
          setFormData(EMPTY_FORM);
        }}
        onSubmit={handleSubmit}
        onFormDataChange={setFormData}
      />
    </div>
  );
}
