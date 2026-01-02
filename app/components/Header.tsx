"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent mb-1">
              មីនុយភោជនីយដ្ឋាន
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              ជ្រើសរើសប្រភេទតុ និងប្រភេទមុខម្ហូបដើម្បីមើលមុខម្ហូប
            </p>
          </div>
          <Button
            onClick={() => router.push("/login")}
            className="ml-4 shadow-md hover:shadow-lg"
          >
            ចូលប្រើប្រាស់
          </Button>
        </div>
      </div>
    </div>
  );
}

