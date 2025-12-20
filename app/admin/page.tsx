import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-slate-800">
          ផ្ទាំងគ្រប់គ្រង
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/categories"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              ប្រភេទម្ហូប
            </h2>
            <p className="text-slate-600">គ្រប់គ្រងប្រភេទមីនុយ</p>
          </Link>

          <Link
            href="/admin/table-types"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              ប្រភេទតុ
            </h2>
            <p className="text-slate-600">គ្រប់គ្រងប្រភេទតុ និងតម្លៃ</p>
          </Link>

          <Link
            href="/admin/menu-items"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              មុខម្ហូប
            </h2>
            <p className="text-slate-600">គ្រប់គ្រងមុខម្ហូប</p>
          </Link>

          <Link
            href="/"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">មើលមីនុយ</h2>
            <p className="text-slate-600">មើលមីនុយអតិថិជន</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

