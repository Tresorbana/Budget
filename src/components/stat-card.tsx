import { LucideIcon, Edit2, Check, X } from "lucide-react";
import { useState } from "react";

import { Input } from "./ui/input";
import { Card } from "./ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent";
  onTrendChange?: (value: string) => void;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  variant = "default",
  onTrendChange,
}: StatCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(trend?.value.replace("%", "") || "");

  const variantStyles = {
    default: "border-[#2c3f2d] bg-[#1a251a]/90 text-white",
    primary:
      "border-[#2f7f33]/50 bg-gradient-to-br from-[#1e3a22] via-[#28562d] to-[#17301d] text-white",
    accent:
      "border-[#0bda3c]/40 bg-[#102315] text-[#d6ffe1] shadow-[0_0_25px_rgba(11,218,60,0.15)]",
  };

  const handleSave = () => {
    if (onTrendChange && editValue) {
      onTrendChange(`${editValue}%`);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(trend?.value.replace("%", "") || "");
    setIsEditing(false);
  };

  return (
    <Card className={`p-5 md:p-6 backdrop-blur ${variantStyles[variant]} break-words`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p
            className={`mb-2 text-sm uppercase tracking-[0.25em] text-[#5c7c61] ${
              variant !== "default" ? "text-white/70" : ""
            }`}
          >
            {title}
          </p>
          <h3 className="text-2xl md:text-3xl font-semibold leading-tight break-words overflow-wrap-anywhere">
            {value}
          </h3>
          {trend && (
            <div className="mt-1 flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-6 w-16 text-xs bg-[#0f160f] border-[#2c3f2d] text-white"
                    autoFocus
                  />
                  <span className="text-xs">%</span>
                  <button
                    onClick={handleSave}
                    className="text-[#0bda3c] hover:text-[#0bda3c]/80"
                  >
                    <Check className="size-3" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="text-[#fa5238] hover:text-[#fa5238]/80"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <>
                  <p
                    className={`text-sm font-semibold ${
                      trend.isPositive ? "text-[#0bda3c]" : "text-[#fa5238]"
                    }`}
                  >
                    {trend.isPositive ? "+" : ""}
                    {trend.value}
                  </p>
                  {onTrendChange && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-white/50 hover:text-white/80"
                    >
                      <Edit2 className="size-3" />
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <div
          className={`rounded-2xl p-3 flex-shrink-0 ${
            variant === "primary"
              ? "bg-white/10 text-white"
              : "bg-white/5 text-white"
          }`}
        >
          <Icon className="size-6" />
        </div>
      </div>
    </Card>
  );
}
