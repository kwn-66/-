"use client";

import { useState } from "react";
import type { POIResult, CategoryGroup } from "@/types";

interface StoreFeedProps {
  groups: CategoryGroup[];
  selected: POIResult[];
  loading: boolean;
  onToggle: (poi: POIResult) => void;
}

function formatDistance(m: number | undefined): string {
  if (!m) return "";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function openStoreLink(name: string, city?: string) {
  const query = encodeURIComponent(city ? `${name} ${city}` : name);
  window.open(
    `https://www.dianping.com/search/keyword/1/0_${query}`,
    "_blank",
    "noopener,noreferrer"
  );
}

export default function StoreFeed({
  groups,
  selected,
  loading,
  onToggle,
}: StoreFeedProps) {
  const selectedIds = new Set(selected.map((s) => s.id));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [expandedLinks, setExpandedLinks] = useState<string | null>(null);

  function toggleCollapse(catId: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="w-5 h-5 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted mt-2">搜索中...</p>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-xs text-muted">未找到相关店铺，试试换个分类或区域</p>
      </div>
    );
  }

  const totalCount = groups.reduce((sum, g) => sum + g.pois.length, 0);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted font-medium">
        店铺推荐 · {groups.length} 类 {totalCount} 家
      </p>

      {groups.map((group) => {
        if (group.pois.length === 0) return null;
        const isCollapsed = collapsed.has(group.categoryId);

        return (
          <div key={group.categoryId} className="bg-white rounded-xl border border-border overflow-hidden">
            {/* 分类标题 */}
            <button
              onClick={() => toggleCollapse(group.categoryId)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <span className="text-base">{group.icon}</span>
                {group.categoryName}
                <span className="text-xs text-muted font-normal ml-1">
                  ({group.pois.length})
                </span>
              </h4>
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                className={`text-muted transition-transform ${isCollapsed ? "" : "rotate-180"}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* 店铺列表 */}
            {!isCollapsed && (
              <div className="divide-y divide-border/50">
                {group.pois.map((poi) => {
                  const isSelected = selectedIds.has(poi.id);
                  const showLinks = expandedLinks === poi.id;
                  return (
                    <div
                      key={poi.id}
                      onClick={() => onToggle(poi)}
                      className={`flex items-start gap-2.5 px-3 py-2.5 transition-colors cursor-pointer active:bg-secondary/50 ${
                        isSelected ? "bg-primary-light" : ""
                      }`}
                    >
                      {/* 勾选框 */}
                      <div
                        className={`shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                          isSelected ? "bg-primary border-primary" : "border-muted/30"
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
                            className="text-sm font-medium truncate transition-all hover:text-primary hover:scale-[1.02] cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              openStoreLink(poi.name);
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

                        {/* 展开多平台链接 */}
                        {showLinks && (
                          <div
                            className="flex gap-1 mt-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {[
                              { label: "美团", url: `https://i.meituan.com/s/${encodeURIComponent(poi.name)}` },
                              { label: "大众点评", url: `https://www.dianping.com/search/keyword/1/0_${encodeURIComponent(poi.name)}` },
                              { label: "高德", url: `https://uri.amap.com/search?keyword=${encodeURIComponent(poi.name)}` },
                              { label: "抖音", url: `https://www.douyin.com/search/${encodeURIComponent(poi.name)}` },
                            ].map(({ label, url }) => (
                              <a
                                key={label}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-1.5 py-0.5 bg-secondary border border-border rounded text-xs text-muted hover:border-primary hover:text-primary transition-colors"
                              >
                                {label}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 更多链接按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedLinks(showLinks ? null : poi.id);
                        }}
                        className="shrink-0 w-4 h-4 flex items-center justify-center text-muted hover:text-primary transition-colors"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
