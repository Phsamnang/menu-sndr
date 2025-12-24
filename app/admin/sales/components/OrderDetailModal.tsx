"use client";

import { Order } from "@/services/order.service";
import OptimizedImage from "@/components/OptimizedImage";
import { FaTimes } from "react-icons/fa";

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

export default function OrderDetailModal({
  order,
  onClose,
  formatDate,
  formatTime,
}: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                ព័ត៌មានលម្អិតការបញ្ជាទិញ
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                #{order.orderNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <FaTimes className="text-xl text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">កាលបរិច្ឆេទ</p>
              <p className="text-base text-slate-900">
                {order.createdAt
                  ? formatDate(order.createdAt) + " " + formatTime(order.createdAt)
                  : "-"}
              </p>
            </div>
            {order.table && (
              <div>
                <p className="text-sm font-medium text-slate-600">តុ</p>
                <p className="text-base text-slate-900">
                  {order.table.number}
                  {order.table.name ? ` - ${order.table.name}` : ""}
                </p>
              </div>
            )}
            {order.customerName && (
              <div>
                <p className="text-sm font-medium text-slate-600">អតិថិជន</p>
                <p className="text-base text-slate-900">{order.customerName}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-600">ស្ថានភាព</p>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                បានបញ្ចប់
              </span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">មុខម្ហូប</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="w-20 h-20 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                    {item.menuItem.image ? (
                      <OptimizedImage
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                        quality={75}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 text-base">
                      {item.menuItem.name}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {item.menuItem.category?.displayName || ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">
                      {item.quantity} x {item.unitPrice.toLocaleString("km-KH")}៛
                    </p>
                    <p className="text-base font-bold text-slate-900">
                      {item.totalPrice.toLocaleString("km-KH")}៛
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-base">
                <span className="text-slate-600">សរុបមុនបញ្ចុះតម្លៃ:</span>
                <span className="font-medium text-slate-900">
                  {order.subtotal.toLocaleString("km-KH")}៛
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-base">
                  <span className="text-slate-600">
                    បញ្ចុះតម្លៃ
                    {order.discountType === "percentage"
                      ? ` (${order.discountValue}%)`
                      : ""}
                    :
                  </span>
                  <span className="font-medium text-red-600">
                    -{order.discountAmount.toLocaleString("km-KH")}៛
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t border-slate-300 pt-3">
                <span className="text-slate-900">សរុប:</span>
                <span className="text-green-600">
                  {order.total.toLocaleString("km-KH")}៛
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

