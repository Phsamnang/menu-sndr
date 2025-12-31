import Modal from "@/components/Modal";
import { Promotion } from "@/services/promotion.service";
import { useState, useEffect } from "react";

interface PromotionModalProps {
  isOpen: boolean;
  editingPromotion: Promotion | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const promotionTypes = [
  { value: "percentage", label: "ភាគរយ (%)" },
  { value: "fixed_amount", label: "ទឹកប្រាក់ថេរ ($)" },
  { value: "buy_x_get_y", label: "ទិញ X ទទួល Y" },
  { value: "happy_hour", label: "ម៉ោងសប្បាយ" },
];

const daysOfWeek = [
  { value: "monday", label: "ច័ន្ទ" },
  { value: "tuesday", label: "អង្គារ" },
  { value: "wednesday", label: "ពុធ" },
  { value: "thursday", label: "ព្រហស្បតិ៍" },
  { value: "friday", label: "សុក្រ" },
  { value: "saturday", label: "សៅរ៍" },
  { value: "sunday", label: "អាទិត្យ" },
];

export default function PromotionModal({
  isOpen,
  editingPromotion,
  isSubmitting,
  onClose,
  onSubmit,
}: PromotionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    code: "",
    type: "percentage",
    value: "",
    minOrderAmount: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    applicableDays: [] as string[],
    usageLimit: "",
    isActive: true,
  });

  useEffect(() => {
    if (editingPromotion) {
      const applicableDays = editingPromotion.applicableDays
        ? JSON.parse(editingPromotion.applicableDays)
        : [];
      setFormData({
        name: editingPromotion.name,
        description: editingPromotion.description || "",
        code: editingPromotion.code || "",
        type: editingPromotion.type,
        value: editingPromotion.value.toString(),
        minOrderAmount: editingPromotion.minOrderAmount?.toString() || "",
        maxDiscount: editingPromotion.maxDiscount?.toString() || "",
        startDate: editingPromotion.startDate.split("T")[0],
        endDate: editingPromotion.endDate.split("T")[0],
        startTime: editingPromotion.startTime || "",
        endTime: editingPromotion.endTime || "",
        applicableDays: Array.isArray(applicableDays) ? applicableDays : [],
        usageLimit: editingPromotion.usageLimit?.toString() || "",
        isActive: editingPromotion.isActive,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        code: "",
        type: "percentage",
        value: "",
        minOrderAmount: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        applicableDays: [],
        usageLimit: "",
        isActive: true,
      });
    }
  }, [editingPromotion, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      name: formData.name,
      description: formData.description || undefined,
      code: formData.code || undefined,
      type: formData.type,
      value: parseFloat(formData.value),
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
    };

    if (formData.minOrderAmount) {
      data.minOrderAmount = parseFloat(formData.minOrderAmount);
    }
    if (formData.maxDiscount) {
      data.maxDiscount = parseFloat(formData.maxDiscount);
    }
    if (formData.startTime) {
      data.startTime = formData.startTime;
    }
    if (formData.endTime) {
      data.endTime = formData.endTime;
    }
    if (formData.applicableDays.length > 0) {
      data.applicableDays = formData.applicableDays;
    }
    if (formData.usageLimit) {
      data.usageLimit = parseInt(formData.usageLimit);
    }

    onSubmit(data);
  };

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      applicableDays: prev.applicableDays.includes(day)
        ? prev.applicableDays.filter((d) => d !== day)
        : [...prev.applicableDays, day],
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        editingPromotion
          ? "កែប្រែការផ្តល់ជូន"
          : "បន្ថែមការផ្តល់ជូន"
      }
      size="2xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ឈ្មោះ *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="ឧ. ការបញ្ចុះតម្លៃ 20%"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ការពិពណ៌នា</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            rows={2}
            placeholder="ការពិពណ៌នាអំពីការផ្តល់ជូន..."
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">កូដ</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="ឧ. SAVE20"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ប្រភេទ *</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            {promotionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            តម្លៃ *{" "}
            {formData.type === "percentage" ? "(%)" : "($)"}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.value}
            onChange={(e) =>
              setFormData({ ...formData, value: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder={formData.type === "percentage" ? "20" : "5"}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              តម្លៃបញ្ជាទិញអប្បបរមា ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.minOrderAmount}
              onChange={(e) =>
                setFormData({ ...formData, minOrderAmount: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              ការបញ្ចុះតម្លៃអតិបរមា ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.maxDiscount}
              onChange={(e) =>
                setFormData({ ...formData, maxDiscount: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              ថ្ងៃចាប់ផ្តើម *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              ថ្ងៃបញ្ចប់ *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        </div>

        {(formData.type === "happy_hour" || formData.type === "buy_x_get_y") && (
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ម៉ោងចាប់ផ្តើម
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="17:00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                ម៉ោងបញ្ចប់
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="19:00"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            ថ្ងៃដែលអាចប្រើប្រាស់
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                  formData.applicableDays.includes(day.value)
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            កំណត់ការប្រើប្រាស់ (0 = គ្មានកំណត់)
          </label>
          <input
            type="number"
            min="0"
            value={formData.usageLimit}
            onChange={(e) =>
              setFormData({ ...formData, usageLimit: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="0"
          />
        </div>

        {editingPromotion && (
          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">សកម្ម</span>
            </label>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? "កំពុងដំណើរការ..."
              : editingPromotion
              ? "ធ្វើបច្ចុប្បន្នភាព"
              : "បង្កើត"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300"
          >
            បោះបង់
          </button>
        </div>
      </form>
    </Modal>
  );
}

