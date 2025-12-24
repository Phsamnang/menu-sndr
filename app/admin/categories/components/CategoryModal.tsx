import Modal from "@/components/Modal";
import { Category } from "@/services/category.service";

interface CategoryModalProps {
  isOpen: boolean;
  editingCategory: Category | null;
  formData: { name: string; displayName: string };
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: { name: string; displayName: string }) => void;
}

export default function CategoryModal({
  isOpen,
  editingCategory,
  formData,
  isSubmitting,
  onClose,
  onSubmit,
  onFormDataChange,
}: CategoryModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingCategory ? "កែប្រែប្រភេទ" : "បន្ថែមប្រភេទ"}
    >
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ឈ្មោះ</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ឈ្មោះបង្ហាញ</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) =>
              onFormDataChange({ ...formData, displayName: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "កំពុងដំណើរការ..."
              : editingCategory
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
