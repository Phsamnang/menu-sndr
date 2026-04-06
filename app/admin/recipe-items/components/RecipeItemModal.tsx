import Modal from "@/components/Modal";
import { RecipeItem } from "@/services/recipe-item.service";
import { MenuItem } from "@/services/menu-item.service";
import { Product } from "@/services/product.service";

interface RecipeItemModalProps {
  isOpen: boolean;
  editingItem: RecipeItem | null;
  formData: {
    menuItemId: string;
    productId: string;
    quantity: string;
    notes: string;
  };
  menuItems: MenuItem[];
  products: Product[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: {
    menuItemId: string;
    productId: string;
    quantity: string;
    notes: string;
  }) => void;
}

export default function RecipeItemModal({
  isOpen,
  editingItem,
  formData,
  menuItems,
  products,
  isSubmitting,
  onClose,
  onSubmit,
  onFormDataChange,
}: RecipeItemModalProps) {
  const activeProducts = products.filter((p) => p.isActive);
  const activeMenuItems = menuItems.filter((m) => m.isAvailable);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? "កែប្រែធាតុរូបមន្ត" : "បន្ថែមធាតុរូបមន្ត"}
      size="lg"
    >
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">មុខម្ហូប *</label>
          <select
            value={formData.menuItemId}
            onChange={(e) =>
              onFormDataChange({ ...formData, menuItemId: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            disabled={!!editingItem}
          >
            <option value="">ជ្រើសរើសមុខម្ហូប</option>
            {activeMenuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ផលិតផល *</label>
          <select
            value={formData.productId}
            onChange={(e) =>
              onFormDataChange({ ...formData, productId: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            disabled={!!editingItem}
          >
            <option value="">ជ្រើសរើសផលិតផល</option>
            {activeProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
                {product.baseUnit
                  ? ` (${product.baseUnit.symbol || product.baseUnit.displayName})`
                  : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            បរិមាណ * (ក្នុងមួយមុខម្ហូប)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={formData.quantity}
            onChange={(e) =>
              onFormDataChange({ ...formData, quantity: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="ឧ. 0.5"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">កំណត់ចំណាំ</label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              onFormDataChange({ ...formData, notes: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="កំណត់ចំណាំ..."
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "កំពុងដំណើរការ..."
              : editingItem
              ? "ធ្វើបច្ចុប្បន្នភាព"
              : "បង្កើត"}
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
    </Modal>
  );
}

