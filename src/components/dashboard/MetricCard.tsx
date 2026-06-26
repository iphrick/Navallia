import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title:     string;
  value:     string | number;
  subtitle?: string;
  icon:      LucideIcon;
  trend?: {
    value:      number;
    label:      string;
    isPositive: boolean;
  };
  colorClass?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorClass = "text-[#92400E] bg-[#92400E]/10",
}: MetricCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl p-5 flex flex-col justify-between h-full group transition-all duration-200 hover:shadow-leather"
      style={{
        background:  "linear-gradient(135deg, #1C1C1C 0%, #181818 100%)",
        border:      "1px solid #2a2a2a",
        borderTop:   "2px solid #92400E",
        boxShadow:   "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* subtle leather grain overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)",
        }}
      />

      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-lg ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
              trend.isPositive
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-red-400 bg-red-500/10"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>

      <div>
        <p className="text-[10px] font-bold tracking-[0.2em] text-[#505050] uppercase mb-1">
          {title}
        </p>
        <p className="font-display text-3xl font-bold text-white tracking-tight">
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-[#505050] mt-1.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
