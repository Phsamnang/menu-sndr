import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <div className="text-center py-16">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800"></div>
      <p className="text-slate-600 mt-4 text-base font-medium">
        កំពុងផ្ទុកមីនុយ...
      </p>
    </div>
  );
}

