import React from "react";
import { Medal } from "lucide-react";
import { BarberRanking, ServiceRanking } from "@/types/dashboard";

interface RankingListProps {
  title: string;
  type:  "barber" | "service";
  data:  BarberRanking[] | ServiceRanking[];
}

const RANK_COLORS = [
  { bg: "rgba(146,64,14,0.15)", border: "rgba(146,64,14,0.35)", text: "#D97706" },  // 1st — leather gold
  { bg: "rgba(120,120,120,0.1)",border: "rgba(120,120,120,0.25)",text: "#A3A3A3" }, // 2nd — steel
  { bg: "rgba(80,60,40,0.1)",   border: "rgba(80,60,40,0.25)",  text: "#78716C" },  // 3rd — bronze
];

export function RankingList({ title, type, data }: RankingListProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

  return (
    <div
      className="p-5 rounded-xl"
      style={{
        background: "linear-gradient(135deg, #1C1C1C 0%, #181818 100%)",
        border:     "1px solid #2a2a2a",
        borderTop:  "2px solid #92400E",
        boxShadow:  "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Medal className="h-4 w-4 text-[#92400E]" />
        <p className="font-display text-sm font-semibold tracking-wide text-white uppercase">
          {title}
        </p>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center text-[#404040] text-sm">
          Nenhum dado no período.
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((item, index) => {
            const name    = item.name;
            const revenue = item.revenue;
            const count   =
              type === "barber"
                ? (item as BarberRanking).appointmentsCount
                : (item as ServiceRanking).count;

            const rank   = RANK_COLORS[index] ?? null;
            const rankBg = rank
              ? { background: rank.bg, border: `1px solid ${rank.border}` }
              : { background: "rgba(255,255,255,0.02)", border: "1px solid #222" };

            return (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:brightness-110"
                style={rankBg}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="font-display text-sm font-bold w-5 text-center"
                    style={{ color: rank?.text ?? "#404040" }}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white leading-none">{name}</p>
                    <p className="text-[11px] text-[#505050] mt-0.5">
                      {count} {type === "barber" ? "atendimentos" : "realizados"}
                    </p>
                  </div>
                </div>
                <p className="font-display text-sm font-bold text-[#F5F5DC]">
                  {fmt(revenue)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
