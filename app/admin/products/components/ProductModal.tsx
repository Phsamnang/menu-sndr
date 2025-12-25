import Modal from "@/components/Modal";
import { Product } from "@/services/product.service";
import { unitService, Unit } from "@/services/unit.service";
import { useQuery } from "@tanstack/react-query";

interface ProductModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  formData: {
    name: string;
    description: string;
    unitId: string;
    category: string;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: {
    name: string;
    description: string;
    unitId: string;
    category: string;
  }) => void;
}

const productCategories = [
  "ស្រា",
  "ម្ហូប",
  "ផ្លែឈើ",
  "បន្លែ",
  "គ្រឿងទេស",
  "ផ្សេងៗ",
];

export default function ProductModal({
  isOpen,
  editingProduct,
  formData,
  isSubmitting,
  onClose,
  onSubmit,
  onFormDataChange,
}: ProductModalProps) {
  const { data: units = [] } = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: () => unitService.getAll(),
    enabled: isOpen,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? "កែប្រែផលិតផល" : "បន្ថែមផលិតផល"}
    >
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ឈ្មោះផលិតផល *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="ឧ. ស្រាបៀរ, ម្ហូប..."
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ប្រភេទ</label>
          <select
            value={formData.category}
            onChange={(e) =>
              onFormDataChange({ ...formData, category: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">ជ្រើសរើសប្រភេទ</option>
            {productCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ឯកតា *</label>
          <select
            value={formData.unitId}
            onChange={(e) =>
              onFormDataChange({ ...formData, unitId: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">ជ្រើសរើសឯកតា</option>
            {units
              .filter((u) => u.isActive)
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName} {u.symbol ? `(${u.symbol})` : ""}
                </option>
              ))}
          </select>
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
            placeholder="ការពិពណ៌នាអំពីផលិតផល..."
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
              : editingProduct
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

