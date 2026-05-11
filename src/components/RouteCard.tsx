"use client";

import type { RoutePlan, TravelMode } from "@/types";

/** 格式化距离 */
function formatDistance(m: number): string {
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

/** 格式化时间 */
function formatDuration(s: number): string {
  if (s < 60) return `${s}秒`;
  const min = Math.ceil(s / 60);
  if (min < 60) return `${min}分钟`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest > 0 ? `${h}小时${rest}分钟` : `${h}小时`;
}

const MODES: { key: TravelMode; label: string }[] = [
  { key: "driving", label: "驾车" },
  { key: "bicycling", label: "骑行" },
  { key: "walking", label: "步行" },
];

interface RouteCardProps {
  planning: boolean;
  routePlan: RoutePlan | null;
  travelMode: TravelMode;
  onTravelModeChange: (mode: TravelMode) => void;
}

export default function RouteCard({
  planning,
  routePlan,
  travelMode,
  onTravelModeChange,
}: RouteCardProps) {
  if (planning) {
    return (
      <div className="p-4 shrink-0">
        <div className="rounded-xl shadow bg-card p-6 text-center">
          <div className="w-5 h-5 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted mt-2">正在规划路线...</p>
        </div>
      </div>
    );
  }

  if (!routePlan || routePlan.segments.length === 0) {
    return (
      <div className="p-4 shrink-0">
        <div className="rounded-xl shadow bg-card p-4 text-center">
          <p className="text-sm text-muted">请输入店铺名称开始规划路线</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 shrink-0">
      <div className="rounded-xl shadow bg-card overflow-hidden">
        {/* 路线总览 */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">路线详情</h3>
            <div className="flex gap-1">
              {MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => onTravelModeChange(m.key)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    travelMode === m.key
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted active:bg-border"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-semibold text-primary">
                {formatDuration(routePlan.totalDuration)}
              </span>
              <span className="text-xs text-muted ml-1">总耗时</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-medium">
                {formatDistance(routePlan.totalDistance)}
              </span>
              <span className="text-xs text-muted ml-1">总距离</span>
            </div>
          </div>
        </div>

        {/* 每段路线（可滚动） */}
        <div className="max-h-48 overflow-y-auto">
          <div className="p-4 space-y-3">
            {routePlan.segments.map((seg, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {/* 序号 + 连接线 */}
                <div className="flex flex-col items-center shrink-0 pt-0.5">
                  <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium">
                    {idx + 1}
                  </div>
                  {idx < routePlan.segments.length - 1 && (
                    <div className="w-px flex-1 min-h-6 bg-border mt-0.5" />
                  )}
                </div>
                {/* 路线信息 */}
                <div className="flex-1 min-w-0 pb-1">
                  <p className="text-sm leading-tight">
                    <span className="text-muted">{seg.from.name}</span>
                    <span className="mx-1 text-border">→</span>
                    <span className="font-medium">{seg.to.name}</span>
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {formatDistance(seg.distance)} · {formatDuration(seg.duration)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
