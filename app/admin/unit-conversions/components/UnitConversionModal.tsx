import Modal from "@/components/Modal";
import { UnitConversion } from "@/services/unit-conversion.service";
import { Unit } from "@/services/unit.service";

interface UnitConversionModalProps {
  isOpen: boolean;
  editingConversion: UnitConversion | null;
  formData: {
    fromUnitId: string;
    toUnitId: string;
    conversionRate: string;
    description: string;
  };
  units: Unit[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: {
    fromUnitId: string;
    toUnitId: string;
    conversionRate: string;
    description: string;
  }) => void;
}

export default function UnitConversionModal({
  isOpen,
  editingConversion,
  formData,
  units,
  isSubmitting,
  onClose,
  onSubmit,
  onFormDataChange,
}: UnitConversionModalProps) {
  const activeUnits = units.filter((u) => u.isActive);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingConversion
          ? "កែប្រែការបម្លែងឯកតា"
          : "បន្ថែមការបម្លែងឯកតា"
      }
      size="lg"
    >
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ពីឯកតា *</label>
          <select
            value={formData.fromUnitId}
            onChange={(e) =>
              onFormDataChange({ ...formData, fromUnitId: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            disabled={!!editingConversion}
          >
            <option value="">ជ្រើសរើសឯកតា</option>
            {activeUnits.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.displayName} {unit.symbol ? `(${unit.symbol})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ទៅឯកតា *</label>
          <select
            value={formData.toUnitId}
            onChange={(e) =>
              onFormDataChange({ ...formData, toUnitId: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            disabled={!!editingConversion}
          >
            <option value="">ជ្រើសរើសឯកតា</option>
            {activeUnits
              .filter((u) => u.id !== formData.fromUnitId)
              .map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.displayName} {unit.symbol ? `(${unit.symbol})` : ""}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            អត្រាបម្លែង * (1 ឯកតាពី = X ឯកតាទៅ)
          </label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            value={formData.conversionRate}
            onChange={(e) =>
              onFormDataChange({ ...formData, conversionRate: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="ឧ. 1000 (1kg = 1000g)"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ការពិពណ៌នា</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              onFormDataChange({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            placeholder="ការពិពណ៌នាអំពីការបម្លែង..."
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
              : editingConversion
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

