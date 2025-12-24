import Modal from "@/components/Modal";
import { TableType } from "@/services/table-type.service";

interface TableTypeModalProps {
  isOpen: boolean;
  editingType: TableType | null;
  formData: { name: string; displayName: string; order: number };
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: {
    name: string;
    displayName: string;
    order: number;
  }) => void;
}

export default function TableTypeModal({
  isOpen,
  editingType,
  formData,
  isSubmitting,
  onClose,
  onSubmit,
  onFormDataChange,
}: TableTypeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingType ? "កែប្រែប្រភេទតុ" : "បន្ថែមប្រភេទតុ"}
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
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">លំដាប់</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                order: parseInt(e.target.value) || 0,
              })
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
              : editingType
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

