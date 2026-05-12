"use client";

import type { District } from "@/types";

interface DistrictFilterProps {
  districts: District[];
  selected: string[];
  onChange: (codes: string[]) => void;
}

export default function DistrictFilter({
  districts,
  selected,
  onChange,
}: DistrictFilterProps) {
  function handleToggle(code: string) {
    if (code === "all") {
      onChange(["all"]);
      return;
    }
    // 去掉 "all"，切换具体区域
    let next = selected.filter((c) => c !== "all");
    if (next.includes(code)) {
      next = next.filter((c) => c !== code);
    } else {
      next = [...next, code];
    }
    // 如果全不选，回退到全部
    if (next.length === 0) next = ["all"];
    onChange(next);
  }

  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      {districts.map((d) => {
        const active = selected.includes(d.code);
        return (
          <button
            key={d.code}
            onClick={() => handleToggle(d.code)}
            className={`shrink-0 px-3 py-1.5 text-xs rounded-full border transition-all active:scale-95 ${
              active
                ? "bg-primary text-white border-primary"
                : "bg-white text-foreground border-border hover:border-primary/40"
            }`}
          >
            {d.name}
          </button>
        );
      })}
    </div>
  );
}
