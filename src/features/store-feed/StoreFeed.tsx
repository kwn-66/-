"use client";

import { useState } from "react";
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

/** 多平台跳转：优先大众点评 → 美团 → 高德 → 小红书 */
function openStoreLink(name: string, address?: string) {
  const encoded = encodeURIComponent(name);
  const links = [
    { label: "大众点评", url: `https://www.dianping.com/search/keyword/1/0_${encoded}` },
    { label: "美团", url: `https://i.meituan.com/s/${encoded}` },
    { label: "高德地图", url: `https://uri.amap.com/search?keyword=${encoded}` },
    { label: "小红书", url: `https://www.xiaohongshu.com/search_result?keyword=${encoded}` },
  ] as const;

  // 优先打开大众点评，如失效用户可手动选其他
  window.open(links[0].url, "_blank", "noopener,noreferrer");
}

export default function StoreFeed({
  pois,
  selected,
  loading,
  onToggle,
}: StoreFeedProps) {
  const selectedIds = new Set(selected.map((s) => s.id));
  const [expanded, setExpanded] = useState<string | null>(null);

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
      <p className="text-xs text-muted font-medium">店铺推荐 ({pois.length})</p>
      {pois.map((poi) => {
        const isSelected = selectedIds.has(poi.id);
        const isExpanded = expanded === poi.id;
        return (
          <div
            key={poi.id}
            onClick={() => onToggle(poi)}
            className={`rounded-lg border transition-all cursor-pointer active:scale-[0.99] overflow-hidden ${
              isSelected
                ? "border-primary bg-primary-light"
                : "border-border bg-white hover:border-primary/30"
            }`}
          >
            <div className="flex items-start gap-2.5 p-2.5">
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
                      openStoreLink(poi.name, poi.address);
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

                {/* 快捷操作：展开查看多平台链接 */}
                {isExpanded && (
                  <div
                    className="flex gap-1.5 mt-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[
                      { label: "大众点评", url: `https://www.dianping.com/search/keyword/1/0_${encodeURIComponent(poi.name)}` },
                      { label: "美团", url: `https://i.meituan.com/s/${encodeURIComponent(poi.name)}` },
                      { label: "高德", url: `https://uri.amap.com/search?keyword=${encodeURIComponent(poi.name)}` },
                      { label: "小红书", url: `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(poi.name)}` },
                    ].map(({ label, url }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-white border border-border rounded text-xs text-muted hover:border-primary hover:text-primary transition-colors"
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* 展开按钮 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(isExpanded ? null : poi.id);
                }}
                className="shrink-0 w-5 h-5 flex items-center justify-center text-muted hover:text-primary transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
