"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ChartDataPoint } from "@/types/dashboard";

const LEATHER  = "#92400E";
const BEIGE    = "#F5F5DC";
const CARD_BG  = "#1C1C1C";
const BORDER   = "#2a2a2a";
const MUTED    = "#404040";

interface RevenueChartProps {
  data:   ChartDataPoint[];
  title?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div
      className="rounded-lg px-4 py-3 text-sm shadow-industrial"
      style={{ background: "#111", border: `1px solid ${BORDER}` }}
    >
      <p className="text-[10px] tracking-widest uppercase text-[#505050] mb-1">{label}</p>
      <p className="font-display font-semibold text-white">{fmt(payload[0].value)}</p>
    </div>
  );
}

export function RevenueChart({ data, title = "Evolução do Faturamento" }: RevenueChartProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style:              "currency",
      currency:           "BRL",
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <div
      className="p-6 w-full h-full min-h-[350px] flex flex-col rounded-xl"
      style={{
        background: `linear-gradient(135deg, ${CARD_BG} 0%, #181818 100%)`,
        border:     `1px solid ${BORDER}`,
        borderTop:  `2px solid ${LEATHER}`,
        boxShadow:  "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[9px] font-bold tracking-[0.25em] text-[#505050] uppercase mb-0.5">
            Faturamento
          </p>
          <h3 className="font-display text-base font-semibold text-white tracking-wide">
            {title}
          </h3>
        </div>
        <div
          className="h-2 w-2 rounded-full"
          style={{ background: LEATHER, boxShadow: `0 0 6px ${LEATHER}` }}
        />
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#404040] text-sm">
          Sem dados suficientes no período.
        </div>
      ) : (
        <div className="flex-1 w-full min-h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="leatherGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={LEATHER} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={LEATHER} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={MUTED}
                strokeOpacity={0.3}
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#404040"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
                tick={{ fill: "#505050" }}
              />
              <YAxis
                stroke="#404040"
                fontSize={11}
                tickFormatter={fmt}
                tickLine={false}
                axisLine={false}
                dx={-10}
                tick={{ fill: "#505050" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={LEATHER}
                strokeWidth={2.5}
                fill="url(#leatherGrad)"
                dot={{ r: 3.5, fill: LEATHER, strokeWidth: 2, stroke: "#111" }}
                activeDot={{ r: 5, fill: BEIGE, strokeWidth: 2, stroke: LEATHER }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
