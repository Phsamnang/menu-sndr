"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "./components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white" />
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l2-5h14l2 5M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M3 9a3 3 0 006 0 3 3 0 006 0 3 3 0 006 0M10 21v-7h4v7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Menu Sender</h1>
          <p className="text-primary-foreground/70 text-lg font-medium mb-8">ប្រព័ន្ធគ្រប់គ្រងភោជនីយដ្ឋាន</p>
          <div className="space-y-4 text-left max-w-xs mx-auto">
            {[
              { icon: "🍽️", text: "គ្រប់គ្រងការបញ្ជាទិញ" },
              { icon: "👨‍🍳", text: "ប្រព័ន្ធផ្ទះបាយ" },
              { icon: "📊", text: "របាយការណ៍លក់" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-slate-50 p-6">
        <LoginForm />
      </div>
    </div>
  );
}
