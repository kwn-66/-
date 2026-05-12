/**
 * 路线 hover 交互相关工具
 */

import { modeLabel, modeColor } from "@/route-engine/mode-decider";
import type { RouteSegment } from "@/types";

export interface HoverablePolyline {
  polyline: AMap.Polyline;
  outline: AMap.Polyline;
  segment: RouteSegment;
  segmentIndex: number;
}

const HOVER_WEIGHT = 8;
const NORMAL_WEIGHT = 4;
const HOVER_OUTLINE_WEIGHT = 12;
const NORMAL_OUTLINE_WEIGHT = 7;

/**
 * 在 map 上创建带 hover 交互的路线段
 */
export function createInteractiveRoute(
  map: AMap.Map,
  segment: RouteSegment,
  index: number,
  onHover?: (index: number, e: { lnglat: { lng: number; lat: number } }) => void,
  onLeave?: (index: number) => void
): HoverablePolyline {
  const color = modeColor(segment.mode);

  // 白色描边
  const outline = new window.AMap.Polyline({
    path: segment.path,
    map,
    strokeColor: "#ffffff",
    strokeWeight: NORMAL_OUTLINE_WEIGHT,
    strokeOpacity: 0.9,
    lineJoin: "round",
    lineCap: "round",
    zIndex: 60 + index * 2,
  });

  // 彩色路线
  const polyline = new window.AMap.Polyline({
    path: segment.path,
    map,
    strokeColor: color,
    strokeWeight: NORMAL_WEIGHT,
    strokeOpacity: 0.85,
    lineJoin: "round",
    lineCap: "round",
    zIndex: 61 + index * 2,
  });

  let infoWindow: AMap.InfoWindow | null = null;

  // hover 事件
  polyline.on("mouseover", (e: { lnglat: { lng: number; lat: number } }) => {
    // 高亮：加粗 + 提升层级
    outline.setOptions({
      strokeWeight: HOVER_OUTLINE_WEIGHT,
      zIndex: 200,
    });
    polyline.setOptions({
      strokeWeight: HOVER_WEIGHT,
      zIndex: 201,
    });

    // 显示信息窗
    const distStr =
      segment.distance < 1000
        ? `${segment.distance}m`
        : `${(segment.distance / 1000).toFixed(1)}km`;
    const durStr =
      segment.duration < 60
        ? `${segment.duration}秒`
        : `${Math.ceil(segment.duration / 60)}分钟`;

    if (infoWindow) infoWindow.close();
    const modeStr = segment.transitName
      ? segment.transitName
      : modeLabel(segment.mode);

    const newInfo = new window.AMap.InfoWindow({
      content: `
        <div style="padding: 8px 12px; font-size: 13px; font-family: -apple-system, sans-serif;">
          <div style="font-weight: 600; margin-bottom: 3px;">
            ${modeStr} ${durStr}
          </div>
          <div style="color: #999; font-size: 11px;">
            ${distStr} · ${segment.from.name} → ${segment.to.name}
          </div>
        </div>
      `,
      offset: { x: 0, y: -20 },
    });
    infoWindow = newInfo;
    newInfo.open(map, e.lnglat);

    onHover?.(index, e);
  });

  polyline.on("mouseout", () => {
    outline.setOptions({
      strokeWeight: NORMAL_OUTLINE_WEIGHT,
      zIndex: 60 + index * 2,
    });
    polyline.setOptions({
      strokeWeight: NORMAL_WEIGHT,
      zIndex: 61 + index * 2,
    });
    if (infoWindow) {
      infoWindow.close();
      infoWindow = null;
    }
    onLeave?.(index);
  });

  return { polyline, outline, segment, segmentIndex: index };
}

/**
 * 清理所有交互路线
 */
export function clearInteractiveRoutes(routes: HoverablePolyline[]) {
  for (const r of routes) {
    r.polyline.setMap(null);
    r.outline.setMap(null);
  }
}
