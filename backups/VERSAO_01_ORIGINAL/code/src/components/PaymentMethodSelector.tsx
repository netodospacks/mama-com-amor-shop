import React from "react";

export type PaymentMethod = "PIX" | "CARTÃO";

interface PaymentMethodSelectorProps {
  value: PaymentMethod | null | "";
  onChange: (method: PaymentMethod) => void;
  error?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  value,
  onChange,
  error = false,
}) => {
  return (
    <div className="space-y-1 w-full">
      <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium block">
        Escolha a forma de pagamento
      </label>
      <div className="relative">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value as PaymentMethod)}
          className={`w-full bg-neutral-50 dark:bg-neutral-900 border rounded-xl px-4 py-3 text-sm outline-none transition-colors appearance-none ${
            error && !value
              ? "border-red-500 focus:border-red-500 text-red-500"
              : "border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white text-neutral-900 dark:text-white"
          }`}
        >
          <option value="" disabled className="text-neutral-400">
            Escolha a forma de pagamento
          </option>
          <option value="PIX">PIX</option>
          <option value="CARTÃO">CARTÃO</option>
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
      {error && !value && (
        <p className="text-[11px] text-red-500 font-medium pt-0.5">
          Por favor, escolha uma forma de pagamento (PIX ou CARTÃO).
        </p>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
