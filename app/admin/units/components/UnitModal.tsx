import Modal from "@/components/Modal";
import { Unit } from "@/services/unit.service";

interface UnitModalProps {
  isOpen: boolean;
  editingUnit: Unit | null;
  formData: {
    name: string;
    displayName: string;
    symbol: string;
    order: string;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: {
    name: string;
    displayName: string;
    symbol: string;
    order: string;
  }) => void;
}

export default function UnitModal({
  isOpen,
  editingUnit,
  formData,
  isSubmitting,
  onClose,
  onSubmit,
  onFormDataChange,
}: UnitModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUnit ? "កែប្រែឯកតា" : "បន្ថែមឯកតា"}
    >
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ឈ្មោះ *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="kg, g, liter, piece..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ឈ្មោះបង្ហាញ *</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) =>
              onFormDataChange({ ...formData, displayName: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="គីឡូក្រាម, ក្រាម, លីត្រ..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">និមិត្តសញ្ញា</label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) =>
              onFormDataChange({ ...formData, symbol: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="kg, g, L, ml, pcs..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">លំដាប់</label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              onFormDataChange({ ...formData, order: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="0"
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
              : editingUnit
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

