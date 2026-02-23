export function TableSelectionSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="h-7 sm:h-8 w-40 sm:w-48 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-10 sm:h-10 w-full sm:w-24 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>

        <div className="mb-4 sm:mb-6">
          <div className="h-4 sm:h-5 w-48 sm:w-64 bg-slate-200 rounded animate-pulse"></div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {[1, 2].map((type) => (
            <div key={type} className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2">
                <div className="h-0.5 sm:h-1 w-8 sm:w-12 bg-slate-200 rounded-full animate-pulse"></div>
                <div className="h-5 sm:h-6 w-24 sm:w-32 bg-slate-200 rounded animate-pulse"></div>
                <div className="flex-1 h-0.5 sm:h-1 bg-slate-200 rounded-full animate-pulse min-w-0"></div>
                <div className="h-5 sm:h-6 w-6 sm:w-8 bg-slate-200 rounded-full animate-pulse flex-shrink-0"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-lg shadow-md p-3 sm:p-4 md:p-5 lg:p-6 bg-slate-200 animate-pulse border-2 border-slate-300 min-h-[80px] sm:min-h-[100px] md:min-h-[120px]"
                  >
                    <div className="text-center space-y-2">
                      <div className="h-4 sm:h-5 w-16 sm:w-20 bg-slate-300 rounded mx-auto"></div>
                      <div className="h-5 sm:h-6 w-20 sm:w-24 bg-slate-300 rounded-full mx-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MenuItemSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="relative h-28 sm:h-32 md:h-40 bg-slate-200 animate-pulse"></div>
      <div className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
        <div className="h-3.5 sm:h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-2.5 sm:h-3 w-full bg-slate-200 rounded animate-pulse"></div>
        <div className="h-2.5 sm:h-3 w-2/3 bg-slate-200 rounded animate-pulse"></div>
        <div className="h-4 sm:h-5 w-16 sm:w-20 bg-slate-200 rounded animate-pulse"></div>
        <div className="space-y-1.5 sm:space-y-2">
          <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-7 sm:h-8 w-full bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="h-8 sm:h-9 w-full bg-slate-200 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

export function MenuGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <MenuItemSkeleton key={index} />
      ))}
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="bg-slate-50 rounded-lg p-2 sm:p-2.5 md:p-3 border border-slate-200">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 md:gap-3">
        <div className="flex gap-2 sm:gap-2 md:gap-3 flex-1 min-w-0">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0 animate-pulse"></div>
          <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
            <div className="h-3.5 sm:h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
            <div className="space-y-1">
              <div className="h-2.5 sm:h-3 w-16 sm:w-20 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-2.5 sm:h-3 w-20 sm:w-24 bg-slate-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="fixed lg:static inset-x-0 bottom-0 lg:inset-auto lg:w-96 bg-white border-t lg:border-l border-slate-200 flex flex-col z-50 lg:z-auto max-h-[85vh] lg:max-h-none shadow-lg lg:shadow-none">
      <div className="p-3 sm:p-4 border-b border-slate-200 flex-shrink-0">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="h-5 sm:h-6 w-20 sm:w-24 bg-slate-200 rounded animate-pulse"></div>
          <div className="h-6 w-6 bg-slate-200 rounded animate-pulse lg:hidden"></div>
        </div>
        <div className="space-y-2 sm:space-y-3">
          <div>
            <div className="h-2.5 sm:h-3 w-10 sm:w-12 bg-slate-200 rounded mb-1 animate-pulse"></div>
            <div className="h-9 sm:h-9 w-full bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
          <div>
            <div className="h-2.5 sm:h-3 w-20 sm:w-24 bg-slate-200 rounded mb-1 animate-pulse"></div>
            <div className="h-9 sm:h-9 w-full bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <div className="h-4 sm:h-5 w-16 sm:w-20 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-2 sm:space-y-2 md:space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CartItemSkeleton key={index} />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 p-3 sm:p-4 space-y-3 sm:space-y-4 flex-shrink-0 bg-white">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex justify-between">
            <div className="h-3.5 sm:h-4 w-24 sm:w-32 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-3.5 sm:h-4 w-16 sm:w-20 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-slate-200">
            <div className="h-4 sm:h-5 w-12 sm:w-16 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-5 sm:h-6 w-20 sm:w-24 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div>
          <div className="h-2.5 sm:h-3 w-16 sm:w-20 bg-slate-200 rounded mb-1 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-9 sm:h-10 w-12 sm:w-16 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-9 sm:h-10 flex-1 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        <div>
          <div className="h-2.5 sm:h-3 w-24 sm:w-28 bg-slate-200 rounded mb-1 animate-pulse"></div>
          <div className="h-9 sm:h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-11 sm:h-12 flex-1 bg-slate-200 rounded-lg animate-pulse"></div>
          <div className="h-11 sm:h-12 flex-1 bg-slate-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export function OrdersPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-col lg:flex-row h-screen">
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-4 md:mb-6">
              <div className="w-full sm:w-auto space-y-1.5 sm:space-y-2">
                <div className="h-7 sm:h-8 w-28 sm:w-32 bg-slate-200 rounded animate-pulse"></div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="h-8 w-full sm:w-40 bg-slate-200 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-full sm:w-24 bg-slate-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="h-10 w-full sm:w-32 bg-slate-200 rounded-lg animate-pulse lg:hidden"></div>
                <div className="h-10 w-full sm:w-24 bg-slate-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="h-9 sm:h-10 w-full bg-slate-200 rounded-lg animate-pulse"></div>
            </div>

            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 h-8 sm:h-9 w-16 sm:w-20 bg-slate-200 rounded-full animate-pulse"
                  ></div>
                ))}
              </div>
            </div>

            <MenuGridSkeleton />
          </div>
        </div>

        <CartSkeleton />
      </div>
    </div>
  );
}

