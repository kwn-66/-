"use client";

import { useState, useRef, useCallback } from "react";
import type { ShopInput as ShopInputType } from "@/types";

interface ShopInputProps {
  shops: ShopInputType[];
  onShopsChange: (shops: ShopInputType[]) => void;
  onPlanRoute: () => void;
}

let nextId = 1;
function generateId(): string {
  return `shop_${nextId++}_${Date.now()}`;
}

export default function ShopInput({
  shops,
  onShopsChange,
  onPlanRoute,
}: ShopInputProps) {
  const [expanded, setExpanded] = useState(false);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const addShop = useCallback(
    (afterId?: string) => {
      const newShop: ShopInputType = { id: generateId(), name: "" };
      if (afterId) {
        const idx = shops.findIndex((s) => s.id === afterId);
        const updated = [...shops];
        updated.splice(idx + 1, 0, newShop);
        onShopsChange(updated);
      } else {
        onShopsChange([...shops, newShop]);
      }
      // 聚焦新输入框（等 DOM 更新后）
      requestAnimationFrame(() => {
        inputRefs.current.get(newShop.id)?.focus();
      });
    },
    [shops, onShopsChange]
  );

  const removeShop = useCallback(
    (id: string) => {
      if (shops.length <= 1) return;
      onShopsChange(shops.filter((s) => s.id !== id));
    },
    [shops, onShopsChange]
  );

  const updateShopName = useCallback(
    (id: string, name: string) => {
      onShopsChange(shops.map((s) => (s.id === id ? { ...s, name } : s)));
    },
    [shops, onShopsChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const idx = shops.findIndex((s) => s.id === id);
        // 如果是最后一个输入框，回车新增
        if (idx === shops.length - 1) {
          addShop(id);
        } else {
          // 否则跳到下一个输入框
          const next = shops[idx + 1];
          if (next) inputRefs.current.get(next.id)?.focus();
        }
      }
      // 退格清空时，如果是空输入框且不是最后一个，删除它
      if (e.key === "Backspace") {
        const shop = shops.find((s) => s.id === id);
        if (shop && !shop.name && shops.length > 1) {
          e.preventDefault();
          removeShop(id);
          // 聚焦前一个
          const idx = shops.findIndex((s) => s.id === id);
          const prev = shops[idx - 1];
          if (prev) {
            requestAnimationFrame(() => {
              inputRefs.current.get(prev.id)?.focus();
            });
          }
        }
      }
    },
    [shops, addShop, removeShop]
  );

  const hasShops = shops.some((s) => s.name.trim());

  return (
    <div className="px-4 pt-3 pb-2 shrink-0">
      <div className="bg-card rounded-xl shadow p-3">
        {/* 标题行 */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <h2 className="text-sm font-medium">
            探店店铺
            <span className="text-muted font-normal ml-1 text-xs">
              ({shops.filter((s) => s.name.trim()).length} 家)
            </span>
          </h2>
          <svg
            className={`w-4 h-4 text-muted transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* 输入框列表 */}
        <div className={`space-y-2 ${expanded ? "mt-3" : "hidden"}`}>
          {shops.map((shop, idx) => (
            <div key={shop.id} className="flex items-center gap-2">
              {/* 序号 */}
              <span className="text-xs text-muted w-5 shrink-0 text-right">
                {idx + 1}.
              </span>

              {/* 输入框 */}
              <input
                ref={(el) => {
                  if (el) inputRefs.current.set(shop.id, el);
                  else inputRefs.current.delete(shop.id);
                }}
                type="text"
                value={shop.name}
                onChange={(e) => updateShopName(shop.id, e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, shop.id)}
                placeholder={idx === 0 ? "如：霸王茶姬" : "输入店铺名称"}
                className="flex-1 h-9 px-3 text-sm bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
              />

              {/* 删除按钮 */}
              {shops.length > 1 && (
                <button
                  onClick={() => removeShop(shop.id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-muted hover:bg-secondary active:scale-90 transition-all shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* 添加按钮 */}
          <button
            onClick={() => addShop()}
            className="w-full h-9 flex items-center justify-center gap-1 text-sm text-muted rounded-lg border border-dashed border-border hover:border-primary hover:text-primary transition-colors active:scale-[0.99]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            添加店铺
          </button>
        </div>

        {/* 快捷输入（折叠时显示第一个输入框） */}
        {!expanded && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted w-5 shrink-0 text-right">1.</span>
            <input
              type="text"
              value={shops[0]?.name || ""}
              onChange={(e) => {
                if (shops[0]) updateShopName(shops[0].id, e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!expanded) setExpanded(true);
                  if (shops.length === 1 && shops[0].name.trim()) {
                    addShop();
                  }
                }
              }}
              onFocus={() => setExpanded(true)}
              placeholder="输入店铺名称，如：霸王茶姬"
              className="flex-1 h-9 px-3 text-sm bg-secondary rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
          </div>
        )}

        {/* 规划路线按钮 */}
        {hasShops && (
          <button
            onClick={onPlanRoute}
            className="w-full mt-3 h-10 bg-primary text-white text-sm font-medium rounded-lg active:scale-[0.98] transition-all hover:brightness-110"
          >
            规划路线
          </button>
        )}
      </div>
    </div>
  );
}
