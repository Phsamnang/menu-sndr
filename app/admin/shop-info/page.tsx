"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { shopInfoService, ShopInfo } from "@/services/shop-info.service";
import axiosInstance from "@/utils/axios-client";
import { apiClientJson } from "@/utils/api-client";

export default function ShopInfoPage() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
    taxId: "",
  });
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroUploading, setHeroUploading] = useState(false);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: shopInfo, isLoading } = useQuery<ShopInfo | null>({
    queryKey: ["shopInfo"],
    queryFn: () => shopInfoService.get(),
  });

  const { data: heroSetting } = useQuery({
    queryKey: ["setting", "hero_image_url"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/admin/settings?category=appearance");
      const items: any[] = res.data?.data?.items || [];
      return items.find((s: any) => s.key === "hero_image_url") || null;
    },
  });

  useEffect(() => {
    if (shopInfo) {
      setFormData({
        name: shopInfo.name || "",
        address: shopInfo.address || "",
        phone: shopInfo.phone || "",
        email: shopInfo.email || "",
        logo: shopInfo.logo || "",
        taxId: shopInfo.taxId || "",
      });
    }
  }, [shopInfo]);

  useEffect(() => {
    if (heroSetting?.value) setHeroImageUrl(heroSetting.value);
  }, [heroSetting]);

  const updateMutation = useMutation({
    mutationFn: (data: typeof formData) => shopInfoService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopInfo"] });
      toast.success("បានរក្សាទុកព័ត៌មានហាងដោយជោគជ័យ!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "មិនអាចរក្សាទុកព័ត៌មានហាងបានទេ");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "hero_images");
      const result = await apiClientJson("/api/imagekit/upload", {
        method: "POST",
        data: form,
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Failed to upload image");
      }
      const url: string = result.data.url;
      if (!url) throw new Error("No URL returned");
      await axiosInstance.patch("/api/admin/settings", {
        key: "hero_image_url",
        value: url,
        type: "string",
        category: "appearance",
        description: "Hero background image for the customer menu page",
        isPublic: true,
      });
      setHeroImageUrl(url);
      queryClient.invalidateQueries({ queryKey: ["setting", "hero_image_url"] });
      toast.success("រូបភាព Hero បានរក្សាទុកដោយជោគជ័យ!");
    } catch (err: any) {
      toast.error(err?.message || "មិនអាចផ្ទុករូបភាពបានទេ");
    } finally {
      setHeroUploading(false);
      if (heroFileRef.current) heroFileRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">កំពុងផ្ទុក...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800">ព័ត៌មានហាង</h1>
        </div>

        {/* Hero Image */}
        <div className="bg-white rounded-[20px] border border-[#E9ECEF] overflow-hidden mb-6">
          <div className="px-[22px] py-5 border-b border-[#E9ECEF] bg-[#F4F6FB]">
            <h2 className="text-[13px] font-semibold text-[#6C757D] uppercase tracking-[0.05em]">
              រូបភាព Hero (ទំព័រមីនុយ)
            </h2>
          </div>
          <div className="p-6 flex flex-col sm:flex-row gap-6 items-start">
            {/* Preview */}
            <div className="w-full sm:w-64 h-36 rounded-xl overflow-hidden border border-[#E9ECEF] bg-slate-100 flex-shrink-0">
              {heroImageUrl ? (
                <img
                  src={heroImageUrl}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">មិនទាន់មានរូបភាព</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-3">
              <p className="text-sm text-slate-500">
                រូបភាពនេះនឹងបង្ហាញជាផ្ទៃខាងក្រោយនៅក្នុងទំព័រមីនុយសម្រាប់អតិថិជន។
              </p>
              <input
                ref={heroFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHeroUpload}
              />
              <button
                type="button"
                disabled={heroUploading}
                onClick={() => heroFileRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed w-fit"
              >
                {heroUploading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    កំពុងផ្ទុក...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    ជ្រើសរូបភាព
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[20px] border border-[#E9ECEF] overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="px-[22px] py-5 border-b border-[#E9ECEF] bg-[#F4F6FB]">
              <h2 className="text-[13px] font-semibold text-[#6C757D] uppercase tracking-[0.05em]">
                ព័ត៌មានទូទៅ
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ឈ្មោះហាង <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">លេខពន្ធ</label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) =>
                      setFormData({ ...formData, taxId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">ទូរស័ព្ទ</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">អ៊ីម៉ែល</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">អាសយដ្ឋាន</label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  លោហៈហាង (URL)
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) =>
                    setFormData({ ...formData, logo: e.target.value })
                  }
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E9ECEF] bg-[#FAFBFD] flex justify-end gap-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
