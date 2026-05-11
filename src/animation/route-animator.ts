/**
 * 路线动画引擎
 * 管理沿路线路径移动的动画 marker，支持播放/暂停/重置
 */

export interface AnimatorState {
  status: "idle" | "playing" | "paused";
  currentSegmentIndex: number;
  progress: number; // 0-1 within current segment
}

export type AnimatorCallback = (state: AnimatorState) => void;

const DEFAULT_SPEED = 600; // 像素/秒

export class RouteAnimator {
  private allPaths: [number, number][][];
  private map: AMap.Map | null;
  private animMarker: AMap.Marker | null;
  private polyline: AMap.Polyline | null;
  private rafId: number | null = null;
  private callback: AnimatorCallback | null = null;

  private state: AnimatorState = {
    status: "idle",
    currentSegmentIndex: 0,
    progress: 0,
  };

  private currentPointIndex = 0;
  private segmentPoints: [number, number][] = [];
  private speed = DEFAULT_SPEED;

  constructor() {
    this.allPaths = [];
    this.map = null;
    this.animMarker = null;
    this.polyline = null;
  }

  /** 初始化动画 */
  init(
    map: AMap.Map,
    segmentPaths: [number, number][][],
    onStateChange?: AnimatorCallback
  ) {
    this.cleanup();
    this.map = map;
    this.allPaths = segmentPaths;
    this.callback = onStateChange || null;

    // 创建动画标记（小车图标）
    const content = document.createElement("div");
    content.innerHTML = `
      <div style="
        width: 24px; height: 24px;
        background: #007AFF;
        border: 3px solid #FFFFFF;
        border-radius: 50%;
        box-shadow: 0 2px 12px rgba(0,122,255,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 6px; height: 6px;
          background: #FFFFFF;
          border-radius: 50%;
        "></div>
      </div>
    `;

    this.animMarker = new window.AMap.Marker({
      content,
      offset: { x: -12, y: -12 },
      zIndex: 200,
    });

    // 创建高亮路线
    this.polyline = new window.AMap.Polyline({
      strokeColor: "#007AFF",
      strokeWeight: 5,
      strokeOpacity: 0.9,
      lineJoin: "round",
      lineCap: "round",
      zIndex: 150,
    });

    // 定位到起点
    if (this.animMarker && this.polyline && segmentPaths.length > 0 && segmentPaths[0].length > 0) {
      const start = segmentPaths[0][0];
      this.animMarker.setPosition(start);
      this.animMarker.setMap(map);
      this.polyline.setMap(map);
    }

    this.state = { status: "idle", currentSegmentIndex: 0, progress: 0 };
    this.currentPointIndex = 0;
    this.segmentPoints = [];
    this.notify();
  }

  /** 开始播放 */
  play() {
    if (this.state.status === "playing") return;
    if (this.allPaths.length === 0) return;

    this.state.status = "playing";
    this.notify();
    this.animate();
  }

  /** 暂停 */
  pause() {
    if (this.state.status !== "playing") return;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.state.status = "paused";
    this.notify();
  }

  /** 重置到起点 */
  reset() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.state = { status: "idle", currentSegmentIndex: 0, progress: 0 };
    this.currentPointIndex = 0;
    this.segmentPoints = [];

    if (this.animMarker && this.allPaths.length > 0 && this.allPaths[0].length > 0) {
      this.animMarker.setPosition(this.allPaths[0][0]);
    }
    if (this.polyline) {
      this.polyline.setPath([]);
    }
    this.notify();
  }

  /** 销毁 */
  cleanup() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.animMarker) {
      this.animMarker.setMap(null);
      this.animMarker = null;
    }
    if (this.polyline) {
      this.polyline.setMap(null);
      this.polyline = null;
    }
    this.allPaths = [];
    this.segmentPoints = [];
    this.map = null;
  }

  getState(): AnimatorState {
    return { ...this.state };
  }

  setSpeed(speed: number) {
    this.speed = speed;
  }

  private notify() {
    this.callback?.(this.getState());
  }

  private animate() {
    if (this.state.status !== "playing") return;

    // 当前段的路径
    if (
      this.segmentPoints.length === 0 &&
      this.state.currentSegmentIndex < this.allPaths.length
    ) {
      this.segmentPoints = [...this.allPaths[this.state.currentSegmentIndex]];
      this.currentPointIndex = 0;
      // 更新高亮路线
      if (this.polyline && this.segmentPoints.length > 0) {
        this.polyline.setPath([this.segmentPoints[0]]);
      }
    }

    if (this.segmentPoints.length < 2) {
      // 跳到下一段
      this.state.currentSegmentIndex++;
      this.state.progress = 0;
      this.segmentPoints = [];
      this.notify();

      if (this.state.currentSegmentIndex >= this.allPaths.length) {
        // 动画结束
        this.state.status = "idle";
        this.state.currentSegmentIndex = this.allPaths.length - 1;
        this.state.progress = 1;
        this.notify();
        return;
      }
      this.rafId = requestAnimationFrame(() => this.animate());
      return;
    }

    // 沿着当前段路径移动
    const p0 = this.segmentPoints[this.currentPointIndex];
    const p1 = this.segmentPoints[this.currentPointIndex + 1];

    // 两点间的像素距离（粗略估算：1度 ≈ 111km）
    const dx = (p1[0] - p0[0]) * 111000;
    const dy = (p1[1] - p0[1]) * 111000;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 每帧移动距离（假设 60fps）
    const stepPerFrame = this.speed / 60;

    // 如果两点很近，直接跳过
    if (dist < stepPerFrame) {
      this.currentPointIndex++;
      this.state.progress =
        this.currentPointIndex / (this.segmentPoints.length - 1);
      this.notify();

      if (this.currentPointIndex >= this.segmentPoints.length - 1) {
        // 当前段结束
        this.state.currentSegmentIndex++;
        this.state.progress = 0;
        this.segmentPoints = [];
        this.notify();

        if (this.state.currentSegmentIndex >= this.allPaths.length) {
          this.state.status = "idle";
          this.state.currentSegmentIndex = this.allPaths.length - 1;
          this.state.progress = 1;
          this.notify();
          return;
        }
      }
      this.rafId = requestAnimationFrame(() => this.animate());
      return;
    }

    // 插值计算新位置
    const t = Math.min(stepPerFrame / dist, 1);
    const newLng = p0[0] + (p1[0] - p0[0]) * t;
    const newLat = p0[1] + (p1[1] - p0[1]) * t;

    // 更新标记位置
    if (this.animMarker) {
      this.animMarker.setPosition([newLng, newLat]);
    }

    // 更新高亮路线
    if (this.polyline) {
      const drawnPath = this.segmentPoints.slice(0, this.currentPointIndex + 1);
      drawnPath.push([newLng, newLat]);
      this.polyline.setPath(drawnPath);
    }

    this.state.progress =
      this.currentPointIndex / (this.segmentPoints.length - 1);
    this.notify();

    this.rafId = requestAnimationFrame(() => this.animate());
  }
}
