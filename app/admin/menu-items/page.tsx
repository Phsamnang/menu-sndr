"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";

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
  prices: Price[];
}

export default function MenuItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    categoryId: "",
    prices: [] as Price[],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      const res = await fetch("/api/admin/menu-items");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: tableTypes = [] } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: async () => {
      const res = await fetch("/api/admin/table-types");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch("/api/admin/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      setIsModalOpen(false);
      setFormData({
        name: "",
        description: "",
        image: "",
        categoryId: "",
        prices: [],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/admin/menu-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        image: "",
        categoryId: "",
        prices: [],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/menu-items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
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

      const res = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to upload image");
      }

      const data = await res.json();
      setFormData((prev) => ({ ...prev, image: data.url }));
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

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ចម្រាញ់តាមប្រភេទ</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg bg-white"
          >
            <option value="">ទាំងអស់</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.displayName}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">កំពុងផ្ទុក...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">រូបភាព</th>
                  <th className="px-6 py-3 text-left">ឈ្មោះ</th>
                  <th className="px-6 py-3 text-left">ពិពណ៌នា</th>
                  <th className="px-6 py-3 text-left">ប្រភេទ</th>
                  <th className="px-6 py-3 text-right">សកម្មភាព</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {menuItems
                  .filter((item) => !selectedCategory || item.categoryId === selectedCategory)
                  .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">
                        {item.description}
                      </td>
                      <td className="px-6 py-4">{item.categoryName}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-3 py-1 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
                        >
                          កែប្រែ
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          លុប
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {menuItems.filter((item) => !selectedCategory || item.categoryId === selectedCategory).length === 0 && (
              <div className="text-center py-12 text-slate-500">
                រកមិនឃើញមុខម្ហូបទេ។
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
                  <label className="block text-sm font-medium mb-2">ឈ្មោះ</label>
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
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    រូបភាព
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
                    <p className="text-sm text-blue-600 mt-2">កំពុងផ្ទុកឡើង...</p>
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
                    ប្រភេទ
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
                  <label className="block text-sm font-medium mb-2">តម្លៃ</label>
                  <div className="space-y-2">
                    {tableTypes.map((type) => {
                      const price = formData.prices.find(
                        (p) => p.tableTypeId === type.id
                      );
                      return (
                        <div key={type.id} className="flex items-center gap-2">
                          <label className="w-32 text-sm">{type.displayName}</label>
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

