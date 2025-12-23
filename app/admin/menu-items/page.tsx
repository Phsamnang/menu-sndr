"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import { apiClientJson } from "@/utils/api-client";

interface TableType {
  id: string;
  name: string;
  displayName: string;
}

interface Category {
  id: string;
  name: string;
  displayName: string;
}

interface Price {
  id?: string;
  tableTypeId: string;
  tableTypeName?: string;
  amount: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  categoryName?: string;
  isCook?: boolean;
  prices: Price[];
}

interface PaginatedResponse {
  items: MenuItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const ITEMS_PER_PAGE = 10;

export default function MenuItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    categoryId: "",
    isCook: false,
    prices: [] as Price[],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: menuItemsData, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ["menuItems", currentPage, selectedCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });
      if (selectedCategory) {
        params.append("categoryId", selectedCategory);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      const result = await apiClientJson<PaginatedResponse>(
        `/api/admin/menu-items?${params.toString()}`
      );
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch menu items");
      }
      return result.data;
    },
  });

  const menuItems = menuItemsData?.items || [];
  const pagination = menuItemsData?.pagination;

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await apiClientJson<Category[]>("/api/admin/categories");
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch categories");
      }
      return result.data;
    },
  });

  const { data: tableTypes = [] } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: async () => {
      const result = await apiClientJson<TableType[]>("/api/admin/table-types");
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to fetch table types");
      }
      return result.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const result = await apiClientJson("/api/admin/menu-items", {
        method: "POST",
        data,
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to create menu item");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      setIsModalOpen(false);
      setCurrentPage(1);
      setFormData({
        name: "",
        description: "",
        image: "",
        categoryId: "",
        isCook: false,
        prices: [],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const result = await apiClientJson(`/api/admin/menu-items/${id}`, {
        method: "PUT",
        data,
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to update menu item");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      setIsModalOpen(false);
      setEditingItem(null);
      setCurrentPage(1);
      setFormData({
        name: "",
        description: "",
        image: "",
        categoryId: "",
        isCook: false,
        prices: [],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await apiClientJson(`/api/admin/menu-items/${id}`, {
        method: "DELETE",
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to delete menu item");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      image: item.image,
      categoryId: item.categoryId,
      isCook: item.isCook ?? false,
      prices: item.prices.map((p) => ({
        tableTypeId: p.tableTypeId,
        amount: p.amount,
      })),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const updatePrice = (tableTypeId: string, amount: number) => {
    const existingIndex = formData.prices.findIndex(
      (p) => p.tableTypeId === tableTypeId
    );
    if (existingIndex >= 0) {
      const newPrices = [...formData.prices];
      newPrices[existingIndex] = { ...newPrices[existingIndex], amount };
      setFormData({ ...formData, prices: newPrices });
    } else {
      setFormData({
        ...formData,
        prices: [...formData.prices, { tableTypeId, amount }],
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "image_menus_sndr");

      const result = await apiClientJson("/api/imagekit/upload", {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to upload image");
      }

      setFormData((prev) => ({ ...prev, image: result.data.url }));
    } catch (error: any) {
      setUploadError(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">មុខម្ហូប</h1>
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              ត្រលប់
            </Link>
            <button
              onClick={() => {
                setEditingItem(null);
                setFormData({
                  name: "",
                  description: "",
                  image: "",
                  categoryId: "",
                  isCook: false,
                  prices: [],
                });
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
            >
              បន្ថែមមុខម្ហូប
            </button>
          </div>
        </div>

        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">ស្វែងរក</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ស្វែងរកតាមឈ្មោះ, ពិពណ៌នា, ឬប្រភេទ..."
              className="w-full px-4 py-2 border rounded-lg bg-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              ចម្រាញ់តាមប្រភេទ
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border rounded-lg bg-white"
            >
              <option value="">ទាំងអស់</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Table
          columns={[
            {
              key: "image",
              label: "រូបភាព",
              render: (item) => (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-14 object-cover rounded-lg"
                />
              ),
            },
            {
              key: "name",
              label: "ឈ្មោះ",
              render: (item) => (
                <span className="font-medium text-slate-900">{item.name}</span>
              ),
            },
            {
              key: "description",
              label: "ពិពណ៌នា",
              render: (item) => (
                <span className="text-sm text-slate-600 max-w-xs truncate block">
                  {item.description || "-"}
                </span>
              ),
            },
            {
              key: "categoryName",
              label: "ប្រភេទ",
              render: (item) => (
                <span className="text-sm text-slate-700">
                  {item.categoryName}
                </span>
              ),
            },
            {
              key: "isCook",
              label: "ត្រូវការចម្អិន",
              render: (item) => (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.isCook
                      ? "bg-orange-100 text-orange-800"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {item.isCook ? "ត្រូវការ" : "មិនត្រូវការ"}
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
          data={menuItems}
          loading={isLoading}
          emptyMessage="រកមិនឃើញមុខម្ហូបទេ។"
        />
        {!isLoading && menuItemsData && pagination && (
          <div className="mt-4 flex items-center justify-between bg-white rounded-lg shadow-md px-6 py-4">
            <div className="text-sm text-slate-600">
              បង្ហាញ {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              នៃ {pagination.total}
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  មុន
                </button>
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => {
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg ${
                          pagination.page === page
                            ? "bg-slate-800 text-white"
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.page - 2 ||
                    page === pagination.page + 2
                  ) {
                    return (
                      <span key={page} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  បន្ទាប់
                </button>
              </div>
            )}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {editingItem ? "កែប្រែមុខម្ហូប" : "បន្ថែមមុខម្ហូប"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ឈ្មោះ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ពិពណ៌នា
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    rows={3}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    រូបភាព <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                    disabled={uploading}
                  />
                  {uploading && (
                    <p className="text-sm text-blue-600 mt-2">
                      កំពុងផ្ទុកឡើង...
                    </p>
                  )}
                  {uploadError && (
                    <p className="text-sm text-red-600 mt-2">{uploadError}</p>
                  )}
                  {formData.image && (
                    <div className="mt-4">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <p className="text-xs text-slate-500 mt-2 truncate">
                        {formData.image}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    ប្រភេទ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">ជ្រើសរើសប្រភេទ</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isCook}
                      onChange={(e) =>
                        setFormData({ ...formData, isCook: e.target.checked })
                      }
                      className="w-4 h-4 text-slate-800 border-slate-300 rounded focus:ring-slate-500"
                    />
                    <span className="text-sm font-medium">ត្រូវការចម្អិន</span>
                  </label>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    តម្លៃ
                  </label>
                  <div className="space-y-2">
                    {tableTypes.map((type) => {
                      const price = formData.prices.find(
                        (p) => p.tableTypeId === type.id
                      );
                      return (
                        <div key={type.id} className="flex items-center gap-2">
                          <label className="w-32 text-sm">
                            {type.displayName}
                          </label>
                          <div className="flex-1 flex items-center">
                            <input
                              type="number"
                              step="1"
                              value={price?.amount || ""}
                              onChange={(e) =>
                                updatePrice(
                                  type.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="flex-1 px-3 py-2 border rounded-lg"
                              placeholder="0"
                            />
                            <span className="ml-2 text-slate-600">៛</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={!formData.image || uploading}
                    className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    {editingItem ? "ធ្វើបច្ចុប្បន្នភាព" : "បង្កើត"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
                  >
                    បោះបង់
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
