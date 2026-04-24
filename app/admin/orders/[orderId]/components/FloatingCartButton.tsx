'use client';

import { useEffect, useRef, useState } from 'react';

interface FloatingCartButtonProps {
  itemCount: number;
  subtotal: number;
  onClick: () => void;
  isVisible?: boolean;
  pulseKey?: number;
}

export function FloatingCartButton({
  itemCount,
  subtotal,
  onClick,
  isVisible = true,
  pulseKey,
}: FloatingCartButtonProps) {
  const [pulsing, setPulsing] = useState(false);
  const initialPulseKey = useRef(pulseKey);

  useEffect(() => {
    if (pulseKey === undefined) return;
    if (pulseKey === initialPulseKey.current) return;
    setPulsing(true);
    const t = setTimeout(() => setPulsing(false), 800);
    return () => clearTimeout(t);
  }, [pulseKey]);

  if (!isVisible || itemCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-5 left-4 right-4 lg:hidden z-40 bg-primary text-white rounded-2xl py-3.5 px-5 flex items-center gap-3 shadow-xl shadow-primary/40 touch-manipulation animate-pop-in ${
        pulsing ? 'animate-cart-pulse' : ''
      }`}
      aria-label="Open cart"
    >
      {/* Cart icon in frosted square */}
      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>

      {/* Label + total */}
      <div className="flex-1 text-left">
        <div className="text-sm font-bold leading-tight">មើលកន្ត្រក់ ({itemCount} មុខ)</div>
        <div className="text-xs opacity-85 leading-tight mt-0.5">{subtotal.toLocaleString('km-KH')}៛</div>
      </div>

      {/* Chevron */}
      <svg className="w-4 h-4 opacity-80 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
