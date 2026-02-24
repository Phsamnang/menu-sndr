'use client';

import { useEffect, useState } from 'react';

interface FloatingCartButtonProps {
  itemCount: number;
  subtotal: number;
  onClick: () => void;
  isVisible?: boolean;
}

export function FloatingCartButton({
  itemCount,
  subtotal,
  onClick,
  isVisible = true,
}: FloatingCartButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevCount, setPrevCount] = useState(itemCount);

  useEffect(() => {
    if (itemCount > prevCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevCount(itemCount);
  }, [itemCount, prevCount]);

  if (!isVisible || itemCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-4 xs:right-6 lg:hidden z-40 touch-manipulation"
      aria-label="Open cart"
    >
      <div className="relative">
        {/* Main button */}
        <div className="bg-primary hover:bg-primary/90 active:bg-primary/80 text-white rounded-full shadow-lg active:shadow-md transition-all p-4 xs:p-5 flex flex-col items-center justify-center gap-1 min-h-[56px] xs:min-h-[60px] min-w-[56px] xs:min-w-[60px]">
          {/* Cart icon */}
          <svg
            className="w-6 h-6 xs:w-7 xs:h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>

          {/* Item count badge */}
          <span className="text-xs xs:text-sm font-bold leading-tight">
            {itemCount}
          </span>
        </div>

        {/* Animated pulse ring on new item */}
        {isAnimating && (
          <div className="absolute inset-0 rounded-full bg-primary animate-pulse" />
        )}

        {/* Price tooltip */}
        <div className="absolute -top-12 xs:-top-14 right-0 bg-slate-900 text-white text-[10px] xs:text-xs font-semibold px-2 xs:px-3 py-1 xs:py-1.5 rounded-lg whitespace-nowrap shadow-lg pointer-events-none">
          {subtotal.toLocaleString('km-KH')}៛
          <div className="absolute top-full right-2 border-4 border-transparent border-t-slate-900" />
        </div>
      </div>
    </button>
  );
}
