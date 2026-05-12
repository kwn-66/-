"use client";

import type { POIResult } from "@/types";

interface RoutePoolProps {
  stores: POIResult[];
  onRemove: (id: string) => void;
  onPlanRoute: () => void;
  planning: boolean;
}

export default function RoutePool({
  stores,
  onRemove,
  onPlanRoute,
  planning,
}: RoutePoolProps) {
  if (stores.length === 0) return null;

  return (
    <div className="border-t border-border bg-white p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">
          📋 路线池 · 已选 {stores.length} 家
        </span>
        <button
          onClick={onPlanRoute}
          disabled={stores.length < 2 || planning}
          className="px-4 py-1.5 bg-primary text-white text-xs font-medium rounded-full active:scale-95 transition-all disabled:opacity-40 hover:brightness-110"
        >
          {planning ? "规划中..." : "生成路线"}
        </button>
      </div>
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {stores.map((s, i) => (
          <span
            key={s.id}
            className="shrink-0 inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs"
          >
            <span className="text-primary font-medium">{i + 1}</span>
            <span className="truncate max-w-24">{s.name}</span>
            <button
              onClick={() => onRemove(s.id)}
              className="text-muted hover:text-primary ml-0.5"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
