"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { apiClientJson } from "@/utils/api-client";

interface Role {
  id: string;
  name: string;
  displayName: string;
}

interface User {
  id: string;
  username: string;
  roleId: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
}

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
    queryFn: async () => {
      const result = await apiClientJson<User[]>("/api/admin/users");
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch users");
      }
      return result.data;
    },
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const result = await apiClientJson<Role[]>("/api/admin/roles");
      if (!result.success || !result.data) {
        return [];
      }
      return result.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const result = await apiClientJson("/api/admin/users", {
        method: "POST",
        data,
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to create user");
      }
      return result.data;
    },
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
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const result = await apiClientJson(`/api/admin/users/${id}`, {
        method: "PUT",
        data,
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to update user");
      }
      return result.data;
    },
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
    mutationFn: async (id: string) => {
      const result = await apiClientJson(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to delete user");
      }
      return result.data;
    },
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {editingUser ? "កែប្រែអ្នកប្រើប្រាស់" : "បន្ថែមអ្នកប្រើប្រាស់"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ឈ្មោះអ្នកប្រើប្រាស់
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                    disabled={!!editingUser}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ពាក្យសម្ងាត់
                    {editingUser && (
                      <span className="text-xs text-slate-500 ml-2">
                        (ទុកទទេដើម្បីមិនផ្លាស់ប្តូរ)
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    តួនាទី
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) =>
                      setFormData({ ...formData, roleId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">ជ្រើសរើសតួនាទី</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isActive: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">សកម្ម</span>
                  </label>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "កំពុងដំណើរការ..."
                      : editingUser
                      ? "ធ្វើបច្ចុប្បន្នភាព"
                      : "បង្កើត"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingUser(null);
                      setFormData({
                        username: "",
                        password: "",
                        roleId: "",
                        isActive: true,
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    បោះបង់
                  </button>
                </div>
                {(createMutation.error || updateMutation.error) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {createMutation.error?.message ||
                      updateMutation.error?.message}
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
