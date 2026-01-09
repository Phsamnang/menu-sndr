"use client";

import { type OrderItem, type Order } from "@/services/order.service";
import OptimizedImage from "@/components/OptimizedImage";

interface OrderCartSidebarProps {
  orderData: Order | null;
  orderItems: OrderItem[];
  customerName: string;
  discountType: "percentage" | "amount";
  discountValue: number;
  debouncedDiscountValue: number;
  discountAmount: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  deleteItemMutation: {
    isPending: boolean;
    mutate: (itemId: string) => void;
  };
  handleCustomerNameChange: (name: string) => void;
  handleDiscountChange: (value: number) => void;
  setDiscountType: (type: "percentage" | "amount") => void;
  setDiscountValue: (value: number) => void;
  setPaymentMethod: (method: string) => void;
  removeFromCart: (itemId: string) => void;
  handlePrintInvoice: () => void;
  handlePlaceOrder: () => void;
  completePaymentMutation: {
    isPending: boolean;
  };
}

export default function OrderCartSidebar({
  orderData,
  orderItems,
  customerName,
  discountType,
  discountValue,
  debouncedDiscountValue,
  discountAmount,
  subtotal,
  total,
  paymentMethod,
  deleteItemMutation,
  handleCustomerNameChange,
  handleDiscountChange,
  setDiscountType,
  setDiscountValue,
  setPaymentMethod,
  removeFromCart,
  handlePrintInvoice,
  handlePlaceOrder,
  completePaymentMutation,
}: OrderCartSidebarProps) {
  return (
    <div className="lg:w-96 bg-white border-l border-slate-200 flex flex-col max-h-screen">
      <div className="p-4 border-b border-slate-200 flex-shrink-0">
        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4">
          ការបញ្ជាទិញ
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              ឈ្មោះអតិថិជន
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => handleCustomerNameChange(e.target.value)}
              placeholder="ឈ្មោះអតិថិជន..."
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-800">មុខម្ហូប</h3>
        </div>

        {orderItems.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <p className="text-slate-500 text-xs sm:text-sm">កន្ត្រក់ទទេ</p>
          </div>
        ) : (
          <div className="space-y-3 md:space-y-4">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 rounded-lg p-3 md:p-4 border border-slate-200"
              >
                <div className="flex gap-3 md:gap-4">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-200 rounded overflow-hidden flex-shrink-0">
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
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-medium text-slate-900 text-sm sm:text-base flex-1 min-w-0 line-clamp-2">
                        {item.menuItem.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        disabled={
                          deleteItemMutation.isPending ||
                          orderData?.status === "completed" ||
                          (item.menuItem.isCook && item.status === "served")
                        }
                        className="text-red-500 active:text-red-600 md:hover:text-red-600 text-sm disabled:opacity-50 touch-manipulation p-1 flex-shrink-0"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {item.status && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-600">
                            ស្ថានភាព:
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              item.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : item.status === "preparing"
                                ? "bg-blue-100 text-blue-800"
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
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-slate-600">
                          តម្លៃ:
                        </span>
                        <span className="text-xs sm:text-sm text-slate-700 font-medium">
                          {item.unitPrice.toLocaleString("km-KH")}៛
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm text-slate-600">
                          ចំនួន:
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-slate-900">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200">
                        <span className="text-sm font-semibold text-slate-900">
                          សរុប:
                        </span>
                        <span className="text-base font-bold text-orange-500">
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

      <div className="border-t border-slate-200 p-4 space-y-4 flex-shrink-0 bg-white">
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-slate-600">សរុបមុនបញ្ចុះតម្លៃ:</span>
            <span className="font-medium text-slate-900">
              {subtotal.toLocaleString("km-KH")}៛
            </span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs sm:text-sm text-green-600">
              <span>
                បញ្ចុះតម្លៃ
                {discountType === "percentage" ? ` (${discountValue}%)` : ""}:
              </span>
              <span className="font-medium">
                -{discountAmount.toLocaleString("km-KH")}៛
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base sm:text-lg border-t-2 border-indigo-200 pt-2">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              សរុប:
            </span>
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent text-lg sm:text-xl">
              {total.toLocaleString("km-KH")}៛
            </span>
          </div>
        </div>

        {orderData?.status === "completed" && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-green-600"
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
              <span className="text-sm font-semibold text-green-800">
                ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ
              </span>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-2">
            <svg
              className="w-4 h-4 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            បញ្ចុះតម្លៃ
          </label>
          <div className="flex gap-2 mb-2">
            <select
              value={discountType}
              onChange={(e) => {
                setDiscountType(e.target.value as "percentage" | "amount");
                setDiscountValue(0);
              }}
              disabled={orderData?.status === "completed"}
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed shadow-sm"
            >
              <option value="percentage">%</option>
              <option value="amount">៛</option>
            </select>
            <input
              type="number"
              min="0"
              max={discountType === "percentage" ? 100 : undefined}
              step={discountType === "percentage" ? "1" : "100"}
              value={discountValue || ""}
              onChange={(e) => {
                const val =
                  e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                handleDiscountChange(val);
              }}
              placeholder="0"
              disabled={orderData?.status === "completed"}
              className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed shadow-sm"
            />
          </div>
          {discountValue > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">បញ្ចុះតម្លៃ:</span>
                <span className="font-semibold text-green-600">
                  -{discountAmount.toLocaleString("km-KH")}៛
                  {discountType === "percentage" && (
                    <span className="text-slate-500 ml-1">
                      ({discountValue}%)
                    </span>
                  )}
                </span>
              </div>
              {discountValue !== debouncedDiscountValue && (
                <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                  <svg
                    className="w-3 h-3 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>កំពុងរក្សាទុក...</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            វិធីសាស្ត្រទូទាត់
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            disabled={orderData?.status === "completed"}
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
          >
            <option value="cash">សាច់ប្រាក់</option>
            <option value="card">កាត</option>
            <option value="bank_transfer">ផ្ទេរប្រាក់</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrintInvoice}
            disabled={!orderItems || orderItems.length === 0}
            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold active:bg-blue-700 md:hover:bg-blue-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            បោះពុម្ព
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={
              !orderItems ||
              orderItems.length === 0 ||
              orderData?.status === "completed" ||
              completePaymentMutation.isPending
            }
            className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-semibold active:bg-slate-900 md:hover:bg-slate-900 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
          >
            {orderData?.status === "completed"
              ? "បានបង់រួចរាល់"
              : completePaymentMutation.isPending
              ? "កំពុងដំណើរការ..."
              : "បញ្ចប់ការទូទាត់"}
          </button>
        </div>
      </div>
    </div>
  );
}
