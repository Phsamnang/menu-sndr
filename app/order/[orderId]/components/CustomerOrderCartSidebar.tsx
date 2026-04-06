"use client";

import { useMemo } from "react";
import OptimizedImage from "@/components/OptimizedImage";
import { type OrderItem, type Order } from "@/services/order.service";

interface CustomerOrderCartSidebarProps {
  orderId: string;
  orderData: Order | null;
  orderItems: OrderItem[];
  showSidebar?: boolean;
  onCloseSidebar?: () => void;
}

export default function CustomerOrderCartSidebar({
  orderId,
  orderData,
  orderItems,
  showSidebar = true,
  onCloseSidebar,
}: CustomerOrderCartSidebarProps) {
  // Computed values
  const subtotal = useMemo(() => orderData?.subtotal || 0, [orderData]);
  const discountAmount = useMemo(() => orderData?.discountAmount || 0, [orderData]);
  const total = useMemo(() => orderData?.total || 0, [orderData]);

  return (
    <>
      {/* Sidebar wrapper - visible on mobile and desktop */}
      <div
        className={`w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col relative h-full lg:h-screen`}
        style={{ touchAction: "pan-y" }}
      >
        <div className="p-2.5 xs:p-3 sm:p-4 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
            <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-slate-800">
              ការបញ្ជាទិញ
            </h2>
            {onCloseSidebar && (
              <button
                onClick={onCloseSidebar}
                className="p-2 xs:p-2.5 text-slate-400 active:text-slate-600 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-5 h-5 xs:w-6 xs:h-6"
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
              </button>
            )}
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-2.5 xs:p-3 sm:p-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex justify-between items-center mb-2 xs:mb-3 sm:mb-4">
            <h3 className="font-semibold text-slate-800 text-xs xs:text-sm sm:text-base">
              មុខម្ហូប
            </h3>
          </div>

          {orderItems.length === 0 ? (
            <div className="text-center py-8 xs:py-10 md:py-12">
              <p className="text-slate-500 text-[10px] xs:text-xs sm:text-sm">
                កន្ត្រក់ទទេ
              </p>
            </div>
          ) : (
            <div className="space-y-2 xs:space-y-3 md:space-y-4">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 rounded-lg p-2 xs:p-3 md:p-4 border border-slate-200 relative"
                  style={{ touchAction: "manipulation" }}
                >
                  <div className="flex gap-2 xs:gap-3 md:gap-4">
                    <div className="w-16 h-16 xs:w-20 xs:h-20 md:w-24 md:h-24 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                      {item.menuItem.image ? (
                        <OptimizedImage
                          src={item.menuItem.image}
                          alt={item.menuItem.name}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                          quality={75}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-10 h-10 text-slate-300"
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
                      <div className="flex items-start justify-between gap-1.5 xs:gap-2 mb-1 xs:mb-1.5">
                        <h4 className="font-medium text-slate-900 text-[10px] xs:text-xs sm:text-sm md:text-base flex-1 min-w-0 line-clamp-2">
                          {item.menuItem.name}
                        </h4>
                      </div>
                      <div className="space-y-1 xs:space-y-1.5">
                        {item.status && (
                          <div className="flex items-center justify-between gap-1.5 xs:gap-2">
                            <span className="text-[9px] xs:text-xs text-slate-600">
                              ស្ថានភាព:
                            </span>
                            <span
                              className={`text-[8px] xs:text-[10px] px-1.5 xs:px-2 py-0.5 rounded-full font-medium ${
                                item.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : item.status === "preparing"
                                  ? "badge-primary"
                                  : item.status === "ready"
                                  ? "bg-purple-100 text-purple-800"
                                  : item.status === "served"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {item.status === "pending"
                                ? "រង់ចាំ"
                                : item.status === "preparing"
                                ? "កំពុងរៀបចំ"
                                : item.status === "ready"
                                ? "រួចរាល់"
                                : item.status === "served"
                                ? "បានដឹកជញ្ជូន"
                                : item.status}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-1.5 xs:gap-2">
                          <span className="text-[9px] xs:text-xs sm:text-xs text-slate-600">
                            តម្លៃ:
                          </span>
                          <span className="text-[9px] xs:text-xs sm:text-xs text-slate-700 font-medium">
                            {item.unitPrice.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1.5 xs:gap-2">
                          <span className="text-[9px] xs:text-xs sm:text-xs text-slate-600">
                            ចំនួន:
                          </span>
                          <span className="text-[9px] xs:text-xs sm:text-xs font-medium text-slate-900">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1.5 xs:gap-2 pt-1 xs:pt-1.5 border-t border-slate-200">
                          <span className="text-xs xs:text-sm font-semibold text-slate-900">
                            សរុប:
                          </span>
                          <span className="text-sm xs:text-base font-bold text-primary">
                            {item.totalPrice.toLocaleString("km-KH")}៛
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 p-2.5 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4 flex-shrink-0 bg-white">
          <div className="space-y-1.5 xs:space-y-2">
            <div className="flex justify-between text-[9px] xs:text-xs sm:text-sm">
              <span className="text-slate-600">សរុបមុនបញ្ចុះតម្លៃ:</span>
              <span className="font-medium text-slate-900">
                {subtotal.toLocaleString("km-KH")}៛
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[9px] xs:text-xs sm:text-sm text-green-600">
                <span>បញ្ចុះតម្លៃ:</span>
                <span className="font-medium">
                  -{discountAmount.toLocaleString("km-KH")}៛
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xs xs:text-sm sm:text-lg border-t-2 border-indigo-200 pt-1.5 xs:pt-2">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                សរុប:
              </span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-sm xs:text-base sm:text-xl">
                {total.toLocaleString("km-KH")}៛
              </span>
            </div>
          </div>

          {orderData?.status === "completed" && (
            <div className="p-2 xs:p-2.5 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-1.5 xs:gap-2">
                <svg
                  className="w-4 h-4 xs:w-5 xs:h-5 text-green-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-[10px] xs:text-xs sm:text-sm font-semibold text-green-800">
                  ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ
                </span>
              </div>
            </div>
          )}

          {orderData?.status !== "completed" && (
            <div className="p-2 xs:p-2.5 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-[9px] xs:text-xs sm:text-xs text-blue-800 text-center">
                សូមរង់ចាំអ្នកបម្រើដើម្បីជួយអ្នក
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
