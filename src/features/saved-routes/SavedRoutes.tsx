"use client";

import { useState, useCallback } from "react";
import type { SavedRoute } from "@/types";
import { loadRoutes, deleteRoute } from "./storage";

interface SavedRoutesProps {
  onViewRoute: (route: SavedRoute) => void;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 7) return `${days}天前`;
  return `${Math.floor(days / 7)}周前`;
}

function formatDuration(s: number): string {
  const min = Math.ceil(s / 60);
  if (min < 60) return `${min}分钟`;
  const h = Math.floor(min / 60);
  const rest = min % 60;
  return rest > 0 ? `${h}h${rest}m` : `${h}h`;
}

function formatDistance(m: number): string {
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

export default function SavedRoutes({ onViewRoute }: SavedRoutesProps) {
  const [routes, setRoutes] = useState<SavedRoute[]>(() => loadRoutes());
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRoutes(loadRoutes());
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (confirmDelete === id) {
      deleteRoute(id);
      setConfirmDelete(null);
      refresh();
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  }, [confirmDelete, refresh]);

  if (routes.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm text-muted">暂无保存的路线</p>
        <p className="text-xs text-muted mt-1">规划路线后可保存到此处</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {routes.map((r) => (
        <div
          key={r.id}
          className="bg-card rounded-xl shadow-sm p-3 border border-border"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium truncate">{r.title}</h3>
              <p className="text-xs text-muted mt-1">
                {r.stores.length} 家店 · {formatDuration(r.plan.totalDuration)} ·{" "}
                {formatDistance(r.plan.totalDistance)}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {formatTimeAgo(r.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={() => onViewRoute(r)}
              className="flex-1 h-8 bg-primary text-white text-xs rounded-lg active:scale-95 transition-all"
            >
              查看路线
            </button>
            <button
              onClick={() => handleDelete(r.id)}
              className={`h-8 px-4 text-xs rounded-lg transition-all active:scale-95 ${
                confirmDelete === r.id
                  ? "bg-red-500 text-white"
                  : "bg-secondary text-muted hover:text-red-500"
              }`}
            >
              {confirmDelete === r.id ? "确认删除" : "删除"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
