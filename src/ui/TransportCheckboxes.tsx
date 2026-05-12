"use client";

import type { TransportPrefs, TravelMode } from "@/types";

const OPTIONS: { key: TravelMode; label: string; icon: string }[] = [
  { key: "walking", label: "步行", icon: "🚶" },
  { key: "bicycling", label: "骑行", icon: "🚴" },
  { key: "driving", label: "驾车", icon: "🚗" },
  { key: "subway", label: "地铁", icon: "🚇" },
  { key: "bus", label: "公交", icon: "🚌" },
];

interface TransportCheckboxesProps {
  prefs: TransportPrefs;
  onChange: (prefs: TransportPrefs) => void;
  disabled?: boolean;
}

export default function TransportCheckboxes({
  prefs,
  onChange,
  disabled = false,
}: TransportCheckboxesProps) {
  const toggle = (key: TravelMode) => {
    const newPrefs = { ...prefs, [key]: !prefs[key] };
    // 至少保留一种交通方式
    const anyEnabled = newPrefs.walking || newPrefs.bicycling || newPrefs.driving || newPrefs.subway || newPrefs.bus;
    if (!anyEnabled) return;
    onChange(newPrefs);
  };

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.key}
          onClick={() => toggle(opt.key)}
          disabled={disabled}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-full border transition-all active:scale-95 ${
            prefs[opt.key]
              ? "bg-primary text-white border-primary"
              : "bg-white text-muted border-border hover:border-primary/50"
          } disabled:opacity-50`}
        >
          <span className="text-sm">{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
