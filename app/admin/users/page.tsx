"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { userService, roleService, User, Role } from "@/services/user.service";
import UserModal from "./components/UserModal";

export default function UsersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    roleId: "",
    isActive: true,
  });
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => userService.getAll(),
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: () => roleService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => userService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      setFormData({
        username: "",
        password: "",
        roleId: "",
        isActive: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof formData }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsModalOpen(false);
      setEditingUser(null);
      setFormData({
        username: "",
        password: "",
        roleId: "",
        isActive: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      roleId: user.roleId,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">អ្នកប្រើប្រាស់</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingUser(null);
                setFormData({
                  username: "",
                  password: "",
                  roleId: "",
                  isActive: true,
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមអ្នកប្រើប្រាស់
            </button>
          </div>
        </div>

        <Table
          columns={[
            {
              key: "username",
              label: "ឈ្មោះអ្នកប្រើប្រាស់",
              render: (item) => (
                <span className="font-medium text-slate-900">
                  {item.username}
                </span>
              ),
            },
            {
              key: "role",
              label: "តួនាទី",
              render: (item) => (
                <span className="text-slate-700">{item.role.displayName}</span>
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
                      if (
                        confirm(
                          `តើអ្នកពិតជាចង់លុបអ្នកប្រើប្រាស់ "${item.username}" ឬ?`
                        )
                      ) {
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
          ]}
          data={users}
          loading={isLoading}
          emptyMessage="រកមិនឃើញអ្នកប្រើប្រាស់ទេ។"
        />

        <UserModal
          isOpen={isModalOpen}
          editingUser={editingUser}
          formData={formData}
          roles={roles}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          error={
            createMutation.error?.message || updateMutation.error?.message || null
          }
          onClose={() => {
            setIsModalOpen(false);
            setEditingUser(null);
            setFormData({
              username: "",
              password: "",
              roleId: "",
              isActive: true,
            });
          }}
          onSubmit={handleSubmit}
          onFormDataChange={setFormData}
        />
      </div>
    </div>
  );
}
