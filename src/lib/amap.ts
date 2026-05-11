/** 高德地图 JS API 版本和插件 */
const AMAP_VERSION = "2.0";
const AMAP_PLUGINS = [
  "AMap.Geolocation",
  "AMap.PlaceSearch",
  "AMap.Driving",
  "AMap.Walking",
  "AMap.Riding",
  "AMap.Marker",
  "AMap.Polyline",
  "AMap.InfoWindow",
];

const LOAD_TIMEOUT = 20000; // 20 秒超时

let loadPromise: Promise<void> | null = null;
let lastError: string | null = null;

export function getLastError(): string | null {
  return lastError;
}

export function resetLoader(): void {
  loadPromise = null;
  lastError = null;
}

export function loadAMapSDK(): Promise<void> {
  if (loadPromise) return loadPromise;

  const key = process.env.NEXT_PUBLIC_AMAP_KEY;
  if (!key || key === "your_amap_key_here") {
    lastError = "请先配置高德地图 API Key（.env.local 中的 NEXT_PUBLIC_AMAP_KEY）";
    loadPromise = Promise.reject(new Error(lastError));
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve();
      return;
    }

    // 配置安全密钥（必须在 script 加载前设置）
    const secret = process.env.NEXT_PUBLIC_AMAP_SECRET;
    if (secret && secret !== "your_amap_security_code_here") {
      window._AMapSecurityConfig = {
        securityJsCode: secret,
      };
    }

    // 超时处理
    const timeoutId = setTimeout(() => {
      loadPromise = null;
      lastError = "高德地图加载超时，请检查网络连接后重试";
      reject(new Error(lastError));
    }, LOAD_TIMEOUT);

    const script = document.createElement("script");
    const plugins = AMAP_PLUGINS.join(",");
    script.src = `https://webapi.amap.com/maps?v=${AMAP_VERSION}&key=${key}&plugin=${plugins}`;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      clearTimeout(timeoutId);
      lastError = null;
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      loadPromise = null;
      lastError = "高德地图 SDK 加载失败，请确认 API Key 是否正确，以及域名是否在白名单中";
      reject(new Error(lastError));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/** 检查 SDK 是否已加载 */
export function isAMapReady(): boolean {
  return typeof window !== "undefined" && !!window.AMap;
}
