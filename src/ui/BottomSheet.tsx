"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type SheetState = "collapsed" | "half" | "expanded";

interface BottomSheetProps {
  /** 底部抽屉当前状态 */
  state: SheetState;
  /** 状态变更回调 */
  onStateChange: (state: SheetState) => void;
  /** 折叠态摘要（总耗时/总距离等） */
  collapsedContent: React.ReactNode;
  /** 主内容（路线段列表等） */
  children: React.ReactNode;
  /** 底部操作栏（保存按钮等） */
  footer?: React.ReactNode;
}

const HEIGHTS: Record<SheetState, string> = {
  collapsed: "h-16",
  half: "h-[40vh]",
  expanded: "h-[75vh]",
};

const STATE_ORDER: SheetState[] = ["collapsed", "half", "expanded"];

export default function BottomSheet({
  state,
  onStateChange,
  collapsedContent,
  children,
  footer,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const startState = useRef<SheetState>(state);
  const [dragging, setDragging] = useState(false);

  // 同步外部状态
  useEffect(() => {
    startState.current = state;
  }, [state]);

  // 根据拖拽距离决定目标状态
  const resolveState = useCallback(
    (deltaY: number): SheetState => {
      const curIdx = STATE_ORDER.indexOf(startState.current);
      // 向上拖（负值）= 展开，向下拖（正值）= 收起
      if (deltaY < -60) {
        return STATE_ORDER[Math.min(curIdx + 1, 2)];
      } else if (deltaY > 60) {
        return STATE_ORDER[Math.max(curIdx - 1, 0)];
      }
      return startState.current;
    },
    []
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    setDragging(true);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const deltaY = e.changedTouches[0].clientY - startY.current;
      const newState = resolveState(deltaY);
      onStateChange(newState);
      setDragging(false);
    },
    [resolveState, onStateChange]
  );

  // 点击拖拽手柄切换状态
  const handleToggle = useCallback(() => {
    const curIdx = STATE_ORDER.indexOf(state);
    const next = STATE_ORDER[(curIdx + 1) % 3];
    onStateChange(next);
  }, [state, onStateChange]);

  return (
    <div
      ref={sheetRef}
      className={`absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl shadow-lg flex flex-col
        transition-[height] duration-300 ease-out z-50 ${HEIGHTS[state]}
        ${dragging ? "transition-none" : ""}`}
    >
      {/* 拖拽手柄 */}
      <div
        className="shrink-0 flex justify-center py-2 cursor-pointer touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleToggle}
      >
        <div className="w-10 h-1 rounded-full bg-border/60" />
      </div>

      {/* 折叠态摘要 */}
      {state === "collapsed" && (
        <div className="px-4 pb-3">{collapsedContent}</div>
      )}

      {/* 半展开 / 全展开：显示完整内容 */}
      {(state === "half" || state === "expanded") && (
        <>
          <div className="flex-1 overflow-y-auto px-4">{children}</div>
          {footer && (
            <div className="shrink-0 px-4 py-3 border-t border-border">
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
}
