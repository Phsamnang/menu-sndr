import { TableItem } from "@/lib/types";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-5 md:p-6 mx-2 sm:mx-0">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-red-600"
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
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              លុបការបញ្ជាទិញ
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 break-words">
              តុ: {table?.number} - {table?.tableType.displayName}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1 break-words">
              លេខបញ្ជាទិញ: {orderNumber}
            </p>
          </div>
        </div>
        <p className="text-sm sm:text-base text-slate-700 mb-5 sm:mb-6 leading-relaxed">
          តើអ្នកពិតជាចង់លុបការបញ្ជាទិញនេះទេ? សកម្មភាពនេះមិនអាចត្រឡប់ក្រោយបានទេ។
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            disabled={isCancelling}
            className="flex-1 px-4 py-3 sm:py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium active:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base"
          >
            បោះបង់
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 px-4 py-3 sm:py-2.5 bg-red-600 text-white rounded-lg font-medium active:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base"
          >
            {isCancelling ? "កំពុងលុប..." : "លុប"}
          </button>
        </div>
      </div>
    </div>
  );
}

