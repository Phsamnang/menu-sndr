import React from "react";

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
  header?: React.ReactNode;
}

export default function Table<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "រកមិនឃើញទិន្នន័យទេ។",
  loading = false,
  onRowClick,
  className = "",
  header,
}: TableProps<T>) {
  const shellClass = `bg-white rounded-[20px] border border-[#E9ECEF] overflow-hidden ${className}`;

  if (loading) {
    return (
      <div className={shellClass}>
        {header && (
          <div className="px-[22px] py-[18px] border-b border-[#E9ECEF]">
            {header}
          </div>
        )}
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-primary" />
          <p className="text-slate-500 mt-4 text-sm">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  const alignClass = (align?: "left" | "right" | "center") =>
    align === "right"
      ? "text-right"
      : align === "center"
      ? "text-center"
      : "text-left";

  return (
    <div className={shellClass}>
      {header && (
        <div className="px-[22px] py-[18px] border-b border-[#E9ECEF] flex items-center gap-3">
          {header}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F4F6FB]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-[22px] py-2.5 text-[11px] font-semibold text-[#6C757D] uppercase tracking-[0.05em] whitespace-nowrap ${alignClass(
                    column.align
                  )} ${column.className || ""}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-14 text-center text-slate-500 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`border-t border-[#E9ECEF] transition-colors hover:bg-[#FAFBFD] ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-[22px] py-3.5 text-[13.5px] text-slate-900 align-middle ${alignClass(
                        column.align
                      )} ${column.className || ""}`}
                    >
                      {column.render
                        ? column.render(item)
                        : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
