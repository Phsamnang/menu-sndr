import Modal from "@/components/Modal";
import { Expense } from "@/services/expense.service";

interface ExpenseModalProps {
  isOpen: boolean;
  editingExpense: Expense | null;
  formData: {
    title: string;
    category: string;
    date: string;
  };
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onFormDataChange: (data: {
    title: string;
    category: string;
    date: string;
  }) => void;
}

const expenseCategories = [
  "វត្ថុធាតុដើម",
  "ប្រាក់ខែ",
  "ជួល",
  "ឧបករណ៍",
  "ផ្សេងៗ",
];

export default function ExpenseModal({
  isOpen,
  editingExpense,
  formData,
  isSubmitting,
  onClose,
  onSubmit,
  onFormDataChange,
}: ExpenseModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? "កែប្រែចំណាយ" : "បន្ថែមចំណាយ"}
      size="sm"
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ចំណងជើង *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              onFormDataChange({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            required
            placeholder="ឧ. ការទិញវត្ថុធាតុដើម"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ប្រភេទ *
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              onFormDataChange({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all bg-white"
            required
          >
            <option value="">ជ្រើសរើសប្រភេទ</option>
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            កាលបរិច្ឆេទ *
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) =>
              onFormDataChange({ ...formData, date: e.target.value })
            }
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {isSubmitting
              ? "កំពុងដំណើរការ..."
              : editingExpense
              ? "ធ្វើបច្ចុប្បន្នភាព"
              : "បង្កើត"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
          >
            បោះបង់
          </button>
        </div>
      </form>
    </Modal>
  );
}
