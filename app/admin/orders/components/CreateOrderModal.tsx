interface TableItem {
  id: string;
  number: string;
  name: string | null;
  status: string;
  tableType: {
    id: string;
    name: string;
    displayName: string;
  };
}

interface CreateOrderModalProps {
  isOpen: boolean;
  table: TableItem | null;
  isCreating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CreateOrderModal({
  isOpen,
  table,
  isCreating,
  onConfirm,
  onCancel,
}: CreateOrderModalProps) {
  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              បង្កើតការបញ្ជាទិញថ្មី
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              តុ: {table.number} - {table.tableType.displayName}
            </p>
          </div>
        </div>
        <p className="text-slate-700 mb-6">
          តើអ្នកចង់បង្កើតការបញ្ជាទិញថ្មីសម្រាប់តុនេះទេ?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium active:bg-slate-300 transition-colors"
          >
            បោះបង់
          </button>
          <button
            onClick={onConfirm}
            disabled={isCreating}
            className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-medium active:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isCreating ? "កំពុងបង្កើត..." : "បង្កើត"}
          </button>
        </div>
      </div>
    </div>
  );
}
