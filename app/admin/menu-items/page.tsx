"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Table, { TableColumn } from "@/components/Table";
import {
  menuItemService,
  MenuItem,
  Category,
  TableType,
  Price,
  PaginatedResponse,
} from "@/services/menu-item.service";
import { categoryService } from "@/services/category.service";
import { tableTypeService } from "@/services/table-type.service";
import Pagination from "./components/Pagination";
import MenuItemModal from "./components/MenuItemModal";

const ITEMS_PER_PAGE = 10;

export default function MenuItemsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: menuItemsData, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ["menuItems", currentPage, selectedCategory, searchQuery],
    queryFn: () =>
      menuItemService.getAll({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        categoryId: selectedCategory || undefined,
        search: searchQuery.trim() || undefined,
      }),
  });

  const menuItems = menuItemsData?.items || [];
  const pagination = menuItemsData?.pagination;

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  const { data: tableTypes = [] } = useQuery<TableType[]>({
    queryKey: ["tableTypes"],
    queryFn: () => tableTypeService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      image: string;
      categoryId: string;
      isCook: boolean;
      prices: Price[];
    }) => menuItemService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      setIsModalOpen(false);
      setCurrentPage(1);
      setEditingItem(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        description: string;
        image: string;
        categoryId: string;
        isCook: boolean;
        prices: Price[];
      };
    }) => menuItemService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      setIsModalOpen(false);
      setEditingItem(null);
      setCurrentPage(1);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => menuItemService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
    },
  });

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (data: {
    name: string;
    description: string;
    image: string;
    categoryId: string;
    isCook: boolean;
    prices: Price[];
  }) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const columns: TableColumn<MenuItem>[] = [
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
        <span className="text-sm text-slate-700">{item.categoryName}</span>
      ),
    },
    {
      key: "isCook",
      label: "ត្រូវការចម្អិន",
      render: (item) => (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            item.isCook
              ? "bg-primary/10 text-primary"
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
            className="btn-primary-sm"
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
  ];

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
                setIsModalOpen(true);
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
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
          columns={columns}
          data={menuItems}
          loading={isLoading}
          emptyMessage="រកមិនឃើញមុខម្ហូបទេ។"
        />
        {!isLoading && menuItemsData && pagination && (
          <Pagination
            pagination={pagination}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

        <MenuItemModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          categories={categories}
          tableTypes={tableTypes}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
