"use client";

import { useState, useEffect } from "react";
import { MenuItem, Category, TableType, Price } from "@/services/menu-item.service";
import { apiClientJson } from "@/utils/api-client";

interface MenuItemFormData {
  name: string;
  description: string;
  image: string;
  categoryId: string;
  isCook: boolean;
  prices: Price[];
}

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: MenuItem | null;
  categories: Category[];
  tableTypes: TableType[];
  onSubmit: (data: MenuItemFormData) => void;
}

export default function MenuItemModal({
  isOpen,
  onClose,
  editingItem,
  categories,
  tableTypes,
  onSubmit,
}: MenuItemModalProps) {
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    image: "",
    categoryId: "",
    isCook: false,
    prices: [],
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        description: editingItem.description,
        image: editingItem.image,
        categoryId: editingItem.categoryId,
        isCook: editingItem.isCook ?? false,
        prices: editingItem.prices.map((p) => ({
          tableTypeId: p.tableTypeId,
          amount: p.amount,
        })),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        image: "",
        categoryId: "",
        isCook: false,
        prices: [],
      });
    }
    setUploadError(null);
  }, [editingItem, isOpen]);

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append("file", file);
      formDataToUpload.append("folder", "image_menus_sndr");

      const result = await apiClientJson("/api/imagekit/upload", {
        method: "POST",
        data: formDataToUpload,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto z-50">
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
              <p className="text-sm text-primary mt-2">
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
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:bg-primary/40 disabled:cursor-not-allowed"
            >
              {editingItem ? "ធ្វើបច្ចុប្បន្នភាព" : "បង្កើត"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
            >
              បោះបង់
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

