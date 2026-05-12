"use client";

import type { Category } from "@/types";

interface CategoryCardsProps {
  categories: Category[];
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function CategoryCards({
  categories,
  selected,
  onChange,
}: CategoryCardsProps) {
  function handleToggle(id: string) {
    if (selected.includes(id)) {
      const next = selected.filter((s) => s !== id);
      onChange(next.length === 0 ? selected : next);
    } else {
      onChange([...selected, id]);
    }
  }

  const foodCats = categories.filter((c) => c.type === "food");
  const entCats = categories.filter((c) => c.type === "entertainment");

  return (
    <div className="space-y-2">
      {/* 美食 */}
      <div>
        <p className="text-xs text-muted mb-1.5 ml-1">🍜 美食</p>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {foodCats.map((c) => {
            const active = selected.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => handleToggle(c.id)}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all active:scale-95 ${
                  active
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-foreground border-border hover:border-primary/40"
                }`}
              >
                <span className="text-sm leading-none">{c.icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 休闲娱乐 */}
      <div>
        <p className="text-xs text-muted mb-1.5 ml-1">🎮 休闲娱乐</p>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {entCats.map((c) => {
            const active = selected.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => handleToggle(c.id)}
                className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition-all active:scale-95 ${
                  active
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-foreground border-border hover:border-primary/40"
                }`}
              >
                <span className="text-sm leading-none">{c.icon}</span>
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
