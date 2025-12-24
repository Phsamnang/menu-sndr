import Modal from "@/components/Modal";
import { TableItem } from "@/services/table.service";
import { TableType } from "@/services/table-type.service";

interface TableModalProps {
  isOpen: boolean;
  editingTable: TableItem | null;
  formData: {
    number: string;
    name: string;
    capacity: number;
    tableTypeId: string;
    status: string;
  };
  tableTypes: TableType[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: {
    number: string;
    name: string;
    capacity: number;
    tableTypeId: string;
    status: string;
  }) => void;
}

export default function TableModal({
  isOpen,
  editingTable,
  formData,
  tableTypes,
  isSubmitting,
  onClose,
  onSubmit,
  onFormDataChange,
}: TableModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTable ? "កែប្រែតុ" : "បន្ថែមតុ"}
    >
      <form onSubmit={onSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            លេខតុ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.number}
            onChange={(e) =>
              onFormDataChange({ ...formData, number: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ឈ្មោះ</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              onFormDataChange({ ...formData, name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ចំនួនអាចអង្គុយ
          </label>
          <input
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                capacity: parseInt(e.target.value) || 4,
              })
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ប្រភេទតុ <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.tableTypeId}
            onChange={(e) =>
              onFormDataChange({
                ...formData,
                tableTypeId: e.target.value,
              })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">ជ្រើសរើសប្រភេទតុ</option>
            {tableTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.displayName}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ស្ថានភាព</label>
          <select
            value={formData.status}
            onChange={(e) =>
              onFormDataChange({ ...formData, status: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="available">អាចប្រើបាន</option>
            <option value="occupied">កំពុងប្រើ</option>
            <option value="reserved">កក់ទុក</option>
            <option value="maintenance">កំពុងជួសជុល</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "កំពុងដំណើរការ..."
              : editingTable
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

