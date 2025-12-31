interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PaginationProps {
  pagination: PaginationInfo;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  pagination,
  currentPage,
  onPageChange,
}: PaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between bg-white rounded-lg shadow-md px-6 py-4">
      <div className="text-sm text-slate-600">
        បង្ហាញ {(pagination.page - 1) * pagination.limit + 1}-
        {Math.min(pagination.page * pagination.limit, pagination.total)} នៃ{" "}
        {pagination.total}
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={!pagination.hasPrevPage}
            className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            មុន
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => {
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.page - 1 && page <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-2 rounded-lg ${
                      pagination.page === page
                        ? "bg-slate-800 text-white"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.page - 2 ||
                page === pagination.page + 2
              ) {
                return (
                  <span key={page} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            }
          )}
          <button
            onClick={() =>
              onPageChange(Math.min(pagination.totalPages, currentPage + 1))
            }
            disabled={!pagination.hasNextPage}
            className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            បន្ទាប់
          </button>
        </div>
      )}
    </div>
  );
}
