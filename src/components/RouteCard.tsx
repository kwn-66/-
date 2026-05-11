"use client";

import type { RoutePlan, TransportPrefs, AnimationStatus } from "@/types";
import { modeLabel, modeColor } from "@/route-engine/mode-decider";
import TransportCheckboxes from "@/ui/TransportCheckboxes";

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

interface RouteCardProps {
  planning: boolean;
  routePlan: RoutePlan | null;
  transportPrefs: TransportPrefs;
  onTransportPrefsChange: (prefs: TransportPrefs) => void;
  animStatus?: AnimationStatus;
  animSegmentIndex?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
}

export default function RouteCard({
  planning,
  routePlan,
  transportPrefs,
  onTransportPrefsChange,
  animStatus,
  animSegmentIndex,
  onPlay,
  onPause,
  onReset,
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
        <div className="rounded-xl shadow bg-card p-4">
          {/* 交通方式选择 */}
          <div className="mb-3">
            <TransportCheckboxes
              prefs={transportPrefs}
              onChange={onTransportPrefsChange}
            />
          </div>
          <p className="text-sm text-muted text-center">
            请输入店铺名称开始规划路线
          </p>
        </div>
      </div>
    );
  }

  const isAnimating = animStatus === "playing";
  const hasAnimation = !!onPlay;

  return (
    <div className="p-4 shrink-0">
      <div className="rounded-xl shadow bg-card overflow-hidden">
        {/* 路线总览 */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">路线详情</h3>
            {/* 动画控制 */}
            {hasAnimation && (
              <div className="flex items-center gap-1">
                {animStatus === "playing" ? (
                  <button
                    onClick={onPause}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={onPlay}
                    className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                )}
                {onReset && (
                  <button
                    onClick={onReset}
                    className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 4v6h6M23 20v-6h-6" />
                      <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* 交通方式勾选 */}
          <div className="mb-3">
            <TransportCheckboxes
              prefs={transportPrefs}
              onChange={onTransportPrefsChange}
              disabled={isAnimating}
            />
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
          <div className="p-4 space-y-2">
            {routePlan.segments.map((seg, idx) => {
              const isActive =
                animSegmentIndex !== undefined && animSegmentIndex === idx && isAnimating;
              const color = modeColor(seg.mode);

              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-primary-light scale-[1.02]"
                      : ""
                  }`}
                >
                  {/* 序号 + 连接线 */}
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <div
                      className="w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-medium transition-transform"
                      style={{ backgroundColor: isActive ? "#007AFF" : color }}
                    >
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
                    <p className="text-xs mt-0.5 flex items-center gap-2">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-muted">
                        {modeLabel(seg.mode)} · {formatDistance(seg.distance)} ·{" "}
                        {formatDuration(seg.duration)}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
