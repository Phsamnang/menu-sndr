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
  const subtotal = useMemo(() => orderData?.subtotal || 0, [orderData]);
  const discountAmount = useMemo(() => orderData?.discountAmount || 0, [orderData]);
  const total = useMemo(() => orderData?.total || 0, [orderData]);

  return (
    <div
      className="w-full lg:w-80 bg-white border-l border-slate-200 flex flex-col h-full"
      style={{ touchAction: "pan-y" }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          {onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 touch-manipulation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <h2 className="text-sm font-bold text-slate-800">ការបញ្ជាទិញ</h2>
        </div>
        {orderData?.table && (
          <span className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-medium text-slate-700">
            តុ {orderData.table.number}
          </span>
        )}
      </div>

      {/* ── Items header ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 flex-shrink-0">
        <span className="text-xs font-semibold text-slate-700">មុខម្ហូប</span>
      </div>

      {/* ── Scrollable items ── */}
      <div className="flex-1 overflow-y-auto min-h-0" style={{ WebkitOverflowScrolling: "touch" }}>
        {orderItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
            <svg className="w-8 h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xs">កន្ត្រក់ទទេ</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {orderItems.map((item) => (
              <div key={item.id} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <div className="flex gap-2.5">
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-slate-200 overflow-hidden flex-shrink-0">
                    {item.menuItem.image ? (
                      <OptimizedImage
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        quality={70}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug mb-1">
                      {item.menuItem.name}
                    </p>

                    {/* Status badge */}
                    {item.status && item.status !== "pending" && (
                      <span className={`inline-flex text-[10px] px-1.5 py-0.5 rounded-full font-medium mb-1 ${
                        item.status === "preparing" ? "bg-primary/10 text-primary"
                        : item.status === "ready" ? "bg-primary/10 text-primary"
                        : item.status === "served" ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                      }`}>
                        {item.status === "preparing" ? "កំពុងរៀបចំ"
                          : item.status === "ready" ? "រួចរាល់"
                          : item.status === "served" ? "បានដឹក"
                          : item.status}
                      </span>
                    )}

                    {/* Price × qty = total */}
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-primary">
                        {item.unitPrice.toLocaleString("km-KH")}៛
                      </p>
                      <span className="text-xs text-slate-500">x{item.quantity}</span>
                      <p className="text-xs font-bold text-slate-700">
                        {item.totalPrice.toLocaleString("km-KH")}៛
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-slate-200 p-3 space-y-2.5 flex-shrink-0 bg-white">
        {/* Summary */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>សរុបមុន</span>
            <span className="font-medium text-slate-700">{subtotal.toLocaleString("km-KH")}៛</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-slate-500">
              <span>បញ្ចុះតម្លៃ</span>
              <span className="font-medium text-red-500">-{discountAmount.toLocaleString("km-KH")}៛</span>
            </div>
          )}
          <div className="flex justify-between pt-1.5 border-t border-slate-200">
            <span className="text-sm font-bold text-slate-800">សរុប</span>
            <span className="text-sm font-bold text-primary">{total.toLocaleString("km-KH")}៛</span>
          </div>
        </div>

        {/* Status notice */}
        {orderData?.status === "completed" ? (
          <div className="flex items-center justify-center gap-2 py-2 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-green-800">ការបញ្ជាទិញនេះបានបង់រួចរាល់ហើយ</span>
          </div>
        ) : (
          <div className="py-2 bg-primary/10 border border-primary/20 rounded-lg text-center">
            <p className="text-xs text-primary">សូមរង់ចាំអ្នកបម្រើដើម្បីជួយអ្នក</p>
          </div>
        )}
      </div>
    </div>
  );
}
