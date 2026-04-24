"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { shopInfoService, ShopInfo } from "@/services/shop-info.service";

export default function ShopInfoPage() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
    taxId: "",
  });
  const queryClient = useQueryClient();

  const { data: shopInfo, isLoading } = useQuery<ShopInfo | null>({
    queryKey: ["shopInfo"],
    queryFn: () => shopInfoService.get(),
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
