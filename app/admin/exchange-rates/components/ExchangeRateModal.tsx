import Modal from "@/components/Modal";
import { useState } from "react";

interface ExchangeRateModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: {
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    effectiveDate?: string;
    source?: string;
  }) => void;
}

const currencies = ["USD", "KHR"];
const sources = ["manual", "api", "bank"];

export default function ExchangeRateModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: ExchangeRateModalProps) {
  const [formData, setFormData] = useState({
    fromCurrency: "USD",
    toCurrency: "KHR",
    rate: "",
    effectiveDate: new Date().toISOString().split("T")[0],
    source: "manual",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fromCurrency: formData.fromCurrency,
      toCurrency: formData.toCurrency,
      rate: parseFloat(formData.rate),
      effectiveDate: formData.effectiveDate,
      source: formData.source,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="បន្ថែមអត្រាប្តូរប្រាក់"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">ពី *</label>
            <select
              value={formData.fromCurrency}
              onChange={(e) =>
                setFormData({ ...formData, fromCurrency: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ទៅ *</label>
            <select
              value={formData.toCurrency}
              onChange={(e) =>
                setFormData({ ...formData, toCurrency: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              {currencies
                .filter((c) => c !== formData.fromCurrency)
                .map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            អត្រា * (1 {formData.fromCurrency} = X {formData.toCurrency})
          </label>
          <input
            type="number"
            step="0.0001"
            min="0.0001"
            value={formData.rate}
            onChange={(e) =>
              setFormData({ ...formData, rate: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
            placeholder="ឧ. 4100 (1 USD = 4100 KHR)"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            កាលបរិច្ឆេទអនុវត្ត *
          </label>
          <input
            type="date"
            value={formData.effectiveDate}
            onChange={(e) =>
              setFormData({ ...formData, effectiveDate: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">ប្រភព</label>
          <select
            value={formData.source}
            onChange={(e) =>
              setFormData({ ...formData, source: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            {sources.map((source) => (
              <option key={source} value={source}>
                {source === "manual"
                  ? "ដៃ"
                  : source === "api"
                  ? "API"
                  : "ធនាគារ"}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "កំពុងដំណើរការ..." : "បង្កើត"}
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


