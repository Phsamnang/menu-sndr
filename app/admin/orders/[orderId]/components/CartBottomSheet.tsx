'use client';

import { useEffect, useRef } from 'react';

interface CartBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function CartBottomSheet({
  isOpen,
  onClose,
  children,
}: CartBottomSheetProps) {
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const diff = endY - startYRef.current;

    // If dragged down more than 50px, close the sheet
    if (diff > 50) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        ref={bottomSheetRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{
          animation: isOpen
            ? 'slideUp 0.3s ease-out'
            : 'slideDown 0.3s ease-out',
        }}
      >
        {/* Drag handle */}
        <div className="sticky top-0 flex justify-center pt-2 pb-1 bg-white rounded-t-2xl border-b border-slate-100">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="pb-6">{children}</div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
