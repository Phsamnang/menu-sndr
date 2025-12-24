"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { tableService, TableItem } from "@/services/table.service";
import { tableTypeService, TableType } from "@/services/table-type.service";
import TableModal from "./components/TableModal";

export default function TablesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [formData, setFormData] = useState({
    number: "",
    name: "",
    capacity: 4,
    tableTypeId: "",
    status: "available",
  });
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
      setIsModalOpen(false);
      setFormData({
        number: "",
        name: "",
        capacity: 4,
        tableTypeId: "",
        status: "available",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      tableService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      setIsModalOpen(false);
      setEditingTable(null);
      setFormData({
        number: "",
        name: "",
        capacity: 4,
        tableTypeId: "",
        status: "available",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">តុ</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingTable(null);
                setFormData({
                  number: "",
                  name: "",
                  capacity: 4,
                  tableTypeId: "",
                  status: "available",
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមតុ
            </button>
          </div>
        </div>

        <Table
          columns={[
            {
              key: "number",
              label: "លេខតុ",
              render: (item) => (
                <span className="font-medium text-slate-900">
                  {item.number}
                </span>
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
                <span className="text-slate-700">
                  {item.tableType.displayName}
                </span>
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
                    className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    កែប្រែ
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(item.id);
                    }}
                    className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
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
            setFormData({
              number: "",
              name: "",
              capacity: 4,
              tableTypeId: "",
              status: "available",
            });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
}
