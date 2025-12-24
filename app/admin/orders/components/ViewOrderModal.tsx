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

interface Order {
  id: string;
  orderNumber: string;
  tableId: string | null;
  customerName: string | null;
  status: string;
  discountType: string | null;
  discountValue: number | null;
  subtotal: number;
  discountAmount: number;
  total: number;
  items: Array<{
    id: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  createdAt?: string;
}

interface ViewOrderModalProps {
  isOpen: boolean;
  table: TableItem | null;
  order: Order | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ViewOrderModal({
  isOpen,
  table,
  order,
  onConfirm,
  onCancel,
}: ViewOrderModalProps) {
  if (!isOpen || !table || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-green-600"
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
              មើលការបញ្ជាទិញ
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              តុ: {table.number} - {table.tableType.displayName}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              លេខបញ្ជាទិញ: {order.orderNumber}
            </p>
          </div>
        </div>
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">ចំនួនមុខម្ហូប:</span>
            <span className="font-medium text-slate-900">
              {order.items.length}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">សរុប:</span>
            <span className="font-bold text-slate-900">
              {order.total.toLocaleString("km-KH")}៛
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">ស្ថានភាព:</span>
            <span
              className={`font-medium ${
                order.status === "new"
                  ? "text-blue-600"
                  : order.status === "on_process"
                  ? "text-yellow-600"
                  : "text-slate-600"
              }`}
            >
              {order.status === "new"
                ? "ថ្មី"
                : order.status === "on_process"
                ? "កំពុងដំណើរការ"
                : order.status}
            </span>
          </div>
        </div>
        <p className="text-slate-700 mb-6">
          តើអ្នកចង់មើលការបញ្ជាទិញនេះទេ?
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
            className="flex-1 px-4 py-2.5 bg-slate-800 text-white rounded-lg font-medium active:bg-slate-900 transition-colors"
          >
            មើល
          </button>
        </div>
      </div>
    </div>
  );
}

