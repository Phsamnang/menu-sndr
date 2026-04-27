"use client";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-10 border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-extrabold text-gray-900 text-base">
              មីនុយភោជនីយដ្ឋាន
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              ឆ្ងាញ់ • ស្រស់ • ក្តៅ — ស្វែងរកមុខម្ហូបដែលអ្នកចូលចិត្ត
              និងបញ្ជាទិញតាមប្រភេទតុ។
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">ទំនាក់ទំនង</h4>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.518 2.07a2 2 0 01-.45 1.84l-1.1 1.273a11.042 11.042 0 005.516 5.516l1.273-1.1a2 2 0 011.84-.45l2.07.518A2 2 0 0121 16.72V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+855 12 345 678</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@menusndr.com</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>ភ្នំពេញ ប្រទេសកម្ពុជា</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">តំណភ្ជាប់</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a href="/" className="text-gray-500 hover:text-primary transition-colors">
                  ទំព័រដើម
                </a>
              </li>
              <li>
                <a href="/login" className="text-gray-500 hover:text-primary transition-colors">
                  ចូលប្រើ
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 text-sm">តាមដាន</h4>
            <div className="flex items-center gap-2">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-500 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-500 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="Telegram"
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-primary hover:text-white text-gray-500 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-400">
            © {year} មីនុយភោជនីយដ្ឋាន. រក្សាសិទ្ធិទាំងអស់។
          </p>
          <p className="text-[11px] text-gray-400">បានបង្កើតដោយក្រុមអភិវឌ្ឍន៍</p>
        </div>
      </div>
    </footer>
  );
}
