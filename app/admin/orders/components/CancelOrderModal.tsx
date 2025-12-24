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

interface CancelOrderModalProps {
  isOpen: boolean;
  table: TableItem | null;
  orderNumber: string;
  isCancelling: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CancelOrderModal({
  isOpen,
  table,
  orderNumber,
  isCancelling,
  onConfirm,
  onCancel,
}: CancelOrderModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              លុបការបញ្ជាទិញ
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              តុ: {table?.number} - {table?.tableType.displayName}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              លេខបញ្ជាទិញ: {orderNumber}
            </p>
          </div>
        </div>
        <p className="text-slate-700 mb-6">
          តើអ្នកពិតជាចង់លុបការបញ្ជាទិញនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isCancelling}
            className="flex-1 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium active:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            បោះបង់
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium active:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? "កំពុងលុប..." : "លុប"}
          </button>
        </div>
      </div>
    </div>
  );
}

