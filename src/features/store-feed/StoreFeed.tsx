"use client";

import type { POIResult } from "@/types";

interface StoreFeedProps {
  pois: POIResult[];
  selected: POIResult[];
  loading: boolean;
  onToggle: (poi: POIResult) => void;
}

function formatDistance(m: number | undefined): string {
  if (!m) return "";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function openExternalSearch(name: string) {
  const url = `https://www.baidu.com/s?wd=${encodeURIComponent(name + " 大众点评")}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function StoreFeed({
  pois,
  selected,
  loading,
  onToggle,
}: StoreFeedProps) {
  const selectedIds = new Set(selected.map((s) => s.id));

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="w-5 h-5 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted mt-2">搜索中...</p>
      </div>
    );
  }

  if (pois.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-xs text-muted">未找到相关店铺，试试换个分类或区域</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted font-medium">店铺推荐</p>
      {pois.map((poi) => {
        const isSelected = selectedIds.has(poi.id);
        return (
          <div
            key={poi.id}
            onClick={() => onToggle(poi)}
            className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer active:scale-[0.99] ${
              isSelected
                ? "border-primary bg-primary-light"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            {/* 勾选框 */}
            <div
              className={`shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                isSelected
                  ? "bg-primary border-primary"
                  : "border-muted/30"
              }`}
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className="text-sm font-medium truncate transition-all hover:text-primary hover:scale-[1.02] hover:brightness-110 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    openExternalSearch(poi.name);
                  }}
                >
                  {poi.name}
                </p>
                {poi.distance && (
                  <span className="text-xs text-muted shrink-0">
                    {formatDistance(poi.distance)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted truncate mt-0.5">
                {poi.address}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
