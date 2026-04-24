"use client";

import { useRouter } from "next/navigation";
import { TableType } from "@/services/table-type.service";

interface HeaderProps {
  tableTypes: TableType[];
  selectedTableType: string | null;
  onSelectTableType: (typeName: string) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  heroImageUrl?: string;
}

export function Header({
  tableTypes,
  selectedTableType,
  onSelectTableType,
  searchQuery,
  onSearchChange,
  heroImageUrl,
}: HeaderProps) {
  const router = useRouter();

  return (
    <div>
      {/* ── Sticky top navbar ── */}
      <nav className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900 text-base tracking-tight">
            មីនុយភោជនីយដ្ឋាន
          </span>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-primary border border-primary hover:bg-primary hover:text-white transition-all duration-200"
          >
            ចូលប្រើ
          </button>
        </div>
      </nav>

      {/* ── Hero section ── */}
      <div className="relative overflow-hidden bg-slate-900">
        {/* Background image */}
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}
        {/* Overlay — keeps text readable */}
        <div className="absolute inset-0 bg-slate-900/55" />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 leading-tight">
            ឆ្ងាញ់&nbsp;•&nbsp;ស្រស់&nbsp;•&nbsp;ក្តៅ
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mb-7">
            ស្វែងរកមុខម្ហូបដែលអ្នកចូលចិត្ត
          </p>

          {/* Search */}
          <div className="relative mb-6">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ស្វែងរកមុខម្ហូប..."
              className="w-full pl-11 pr-11 py-3.5 bg-white rounded-2xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Table type pills */}
          {tableTypes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {tableTypes.map((type) => {
                const isActive = selectedTableType === type.name;
                return (
                  <button
                    key={type.id}
                    onClick={() => onSelectTableType(type.name)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border ${
                      isActive
                        ? "bg-primary text-white border-primary shadow-md shadow-primary/30"
                        : "bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {type.displayName}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
