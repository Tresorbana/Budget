import { useCurrency } from "@/hooks/useCurrency";

import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  placeholder = "0",
  required,
}: CurrencyInputProps) {
  const { symbol } = useCurrency();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, "");
    onChange(inputValue);
  };

  const formatValue = (val: string) => {
    if (!val) return "";
    return parseInt(val).toLocaleString();
  };

  return (
    <div className="space-y-2">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {symbol}
        </span>
        <Input
          type="text"
          value={formatValue(value)}
          onChange={handleChange}
          placeholder={placeholder}
          className="pl-16 bg-input-background"
        />
      </div>
    </div>
  );
}
