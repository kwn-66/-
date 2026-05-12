"use client";

import { useState, useCallback } from "react";
import type { RoutePlan, MultiRoutePlan, TransportPrefs, AnimationStatus } from "@/types";
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
  multiPlan?: { plans: RoutePlan[]; labels: string[]; currentIndex: number } | null;
  onPlanChange?: (index: number) => void;
  transportPrefs: TransportPrefs;
  onTransportPrefsChange: (prefs: TransportPrefs) => void;
  animStatus?: AnimationStatus;
  animSegmentIndex?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSave?: (title: string) => void;
  saveDisabled?: boolean;
  onRefreshStore?: (index: number) => void;
  onMoveUp?: (orderIndex: number) => void;
  onMoveDown?: (orderIndex: number) => void;
}

export default function RouteCard({
  planning,
  routePlan,
  multiPlan,
  onPlanChange,
  transportPrefs,
  onTransportPrefsChange,
  animStatus,
  animSegmentIndex,
  onPlay,
  onPause,
  onReset,
  onSave,
  saveDisabled,
  onRefreshStore,
  onMoveUp,
  onMoveDown,
}: RouteCardProps) {
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");

  const handleSave = useCallback(() => {
    if (!onSave) return;
    const today = new Date().toISOString().slice(0, 10);
    const title = saveTitle.trim() || `${today} 成都路线`;
    onSave(title);
    setSaveTitle("");
    setShowSaveInput(false);
  }, [onSave, saveTitle]);

  const handleSaveClick = useCallback(() => {
    if (saveDisabled) return;
    const today = new Date().toISOString().slice(0, 10);
    setSaveTitle(`${today} 成都路线`);
    setShowSaveInput(true);
  }, [saveDisabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSave();
      if (e.key === "Escape") {
        setShowSaveInput(false);
        setSaveTitle("");
      }
    },
    [handleSave]
  );
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

          {/* 方案切换标签 */}
          {multiPlan && multiPlan.plans.length > 1 && onPlanChange && (
            <div className="flex gap-1 mb-3">
              {multiPlan.labels.map((label, i) => (
                <button
                  key={label}
                  onClick={() => onPlanChange(i)}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-all active:scale-95 ${
                    i === multiPlan.currentIndex
                      ? "bg-primary text-white border-primary"
                      : "bg-secondary text-muted border-border hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

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
              const color = modeColor(seg.mode, seg.transitType);
              const isTransitLeg = seg.mode === "transit";
              const hasCategory = !!seg.to.categoryIcon;
              const canReorder = seg.orderIndex !== undefined && onMoveUp && onMoveDown;
              const isFirst = seg.orderIndex === 0;
              const isLast = seg.orderIndex !== undefined && seg.orderIndex === routePlan.order.length - 1;

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
                    <p className="text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                      <span className="text-muted">{seg.from.name}</span>
                      <span className="text-border">→</span>
                      <span className="font-medium flex items-center gap-1">
                        {seg.to.name}
                        {seg.to.categoryIcon && (
                          <span className="text-xs" title={seg.to.categoryName}>
                            {seg.to.categoryIcon}
                          </span>
                        )}
                      </span>
                      {onRefreshStore && hasCategory && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRefreshStore(idx + 1);
                          }}
                          className="shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-secondary hover:bg-primary hover:text-white transition-colors"
                          title={`替换${seg.to.name}`}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M1 4v6h6M23 20v-6h-6" />
                            <path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
                          </svg>
                        </button>
                      )}
                      {canReorder && (
                        <span className="inline-flex gap-0.5 ml-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isFirst) onMoveUp!(seg.orderIndex!);
                            }}
                            disabled={isFirst}
                            className="w-4 h-4 flex items-center justify-center rounded-full bg-secondary hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="上移"
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M18 15l-6-6-6 6" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isLast) onMoveDown!(seg.orderIndex!);
                            }}
                            disabled={isLast}
                            className="w-4 h-4 flex items-center justify-center rounded-full bg-secondary hover:bg-primary hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="下移"
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                        </span>
                      )}
                    </p>
                    <p className="text-xs mt-0.5 flex items-center gap-2">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-muted">
                        {isTransitLeg && seg.transitName
                          ? `${seg.transitName}（${seg.stationCount ?? "?"}站）`
                          : modeLabel(seg.mode)}
                        {" · "}
                        {formatDistance(seg.distance)}
                        {" · "}
                        {formatDuration(seg.duration)}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 保存路线 */}
        {onSave && (
          <div className="px-4 py-3 border-t border-border">
            {showSaveInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入路线名称"
                  autoFocus
                  className="flex-1 h-9 px-3 text-sm bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={handleSave}
                  className="shrink-0 h-9 px-4 bg-primary text-white text-xs rounded-lg active:scale-95 transition-all"
                >
                  保存
                </button>
                <button
                  onClick={() => {
                    setShowSaveInput(false);
                    setSaveTitle("");
                  }}
                  className="shrink-0 h-9 w-9 flex items-center justify-center text-muted text-xs rounded-lg hover:bg-secondary"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleSaveClick}
                disabled={saveDisabled}
                className="w-full h-9 flex items-center justify-center gap-1.5 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary-light transition-colors active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                保存路线
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
