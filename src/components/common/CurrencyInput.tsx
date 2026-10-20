import React from "react";

interface CurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  currency?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  currency = "PHP",
  placeholder = "0.00",
  className = "",
  id,
  autoFocus,
  min = 0,
  max,
  disabled,
}: CurrencyInputProps) {
  const symbol = currency === "USD" ? "$" : "₱";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow numbers and decimal point only
    const clean = rawVal.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(clean);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className={`relative flex items-center rounded-xl border border-input bg-card shadow-sm focus-within:ring-2 focus-within:ring-primary ${className}`}>
      <span className="pl-3.5 pr-1 font-mono text-base font-semibold text-muted-foreground select-none">
        {symbol}
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        autoFocus={autoFocus}
        disabled={disabled}
        value={value === 0 ? "" : value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-transparent py-2.5 pr-4 pl-1 font-mono text-lg font-semibold text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </div>
  );
}
