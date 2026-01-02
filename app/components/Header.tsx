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
            <div className="flex items-center justify-center gap-3 mb-1">
              <img
                src="/icons/online-presence.svg"
                alt="Online Presence"
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-slate-800"
                style={{ filter: "brightness(0) saturate(100%)" }}
              />
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
                មីនុយភោជនីយដ្ឋាន
              </h1>
            </div>
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

