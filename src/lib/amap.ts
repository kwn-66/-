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

let loadPromise: Promise<void> | null = null;

export function loadAMapSDK(): Promise<void> {
  if (loadPromise) return loadPromise;

  const key = process.env.NEXT_PUBLIC_AMAP_KEY;
  if (!key || key === "your_amap_key_here") {
    loadPromise = Promise.reject(
      new Error("请先配置高德地图 API Key（.env.local 中的 NEXT_PUBLIC_AMAP_KEY）")
    );
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    // 如果已经加载过
    if (window.AMap) {
      resolve();
      return;
    }

    // 配置安全密钥（高德 2021年12月后新申请的 Key 必须）
    const secret = process.env.NEXT_PUBLIC_AMAP_SECRET;
    if (secret && secret !== "your_amap_security_code_here") {
      window._AMapSecurityConfig = {
        securityJsCode: secret,
      };
    }

    const script = document.createElement("script");
    const plugins = AMAP_PLUGINS.join(",");
    script.src = `https://webapi.amap.com/maps?v=${AMAP_VERSION}&key=${key}&plugin=${plugins}`;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("高德地图 SDK 加载失败"));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

/** 检查 SDK 是否已加载 */
export function isAMapReady(): boolean {
  return typeof window !== "undefined" && !!window.AMap;
}
