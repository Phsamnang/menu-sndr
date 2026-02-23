import { TableItem } from "@/lib/types";

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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 sm:p-5 md:p-6 mx-2 sm:mx-0">
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
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
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              បង្កើតការបញ្ជាទិញថ្មី
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 break-words">
              តុ: {table.number} - {table.tableType.displayName}
            </p>
          </div>
        </div>
        <p className="text-sm sm:text-base text-slate-700 mb-5 sm:mb-6 leading-relaxed">
          តើអ្នកចង់បង្កើតការបញ្ជាទិញថ្មីសម្រាប់តុនេះទេ?
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            disabled={isCreating}
            className="flex-1 px-4 py-3 sm:py-2.5 bg-slate-200 text-slate-700 rounded-lg font-medium active:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base"
          >
            បោះបង់
          </button>
          <button
            onClick={onConfirm}
            disabled={isCreating}
            className="flex-1 px-4 py-3 sm:py-2.5 bg-slate-800 text-white rounded-lg font-medium active:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation min-h-[44px] sm:min-h-0 text-sm sm:text-base"
          >
            {isCreating && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isCreating ? "កំពុងបង្កើត..." : "បង្កើត"}
          </button>
        </div>
      </div>
    </div>
  );
}
