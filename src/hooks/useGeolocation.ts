"use client";

import { useState, useCallback, useRef } from "react";
import { isAMapReady } from "@/lib/amap";
import type { UserLocation } from "@/types";

/** 成都市中心坐标（默认兜底位置） */
export const CHENGDU_CENTER: UserLocation = {
  lng: 104.0657,
  lat: 30.6573,
  address: "成都市天府广场",
};

interface UseGeolocationReturn {
  locating: boolean;
  location: UserLocation | null;
  error: string | null;
  getUserLocation: () => Promise<UserLocation>;
}

export function useGeolocation(): UseGeolocationReturn {
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const geolocationRef = useRef<AMap.Geolocation | null>(null);

  const getUserLocation = useCallback(async (): Promise<UserLocation> => {
    setLocating(true);
    setError(null);

    return new Promise((resolve) => {
      // 先尝试浏览器原生定位（更快更准）
      const tryNative = () => {
        if (!navigator.geolocation) return tryAMap();

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc: UserLocation = {
              lng: pos.coords.longitude,
              lat: pos.coords.latitude,
            };
            setLocation(loc);
            setLocating(false);
            resolve(loc);
          },
          () => {
            // 原生定位失败，降级到高德 IP 定位
            tryAMap();
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      };

      // 降级：使用高德 IP 定位（无需用户授权，精度较低但可用）
      const tryAMap = () => {
        if (!isAMapReady()) {
          setLocating(false);
          setError("定位不可用，使用默认成都位置");
          resolve(CHENGDU_CENTER);
          return;
        }

        try {
          if (!geolocationRef.current) {
            geolocationRef.current = new window.AMap.Geolocation({
              enableHighAccuracy: true,
              timeout: 10000,
            });
          }

          geolocationRef.current!.getCurrentPosition((status, result) => {
            setLocating(false);
            if (status === "complete" && result.position) {
              const loc: UserLocation = {
                lng: result.position.lng,
                lat: result.position.lat,
                address: result.formattedAddress,
              };
              setLocation(loc);
              resolve(loc);
            } else {
              setError("定位失败，使用默认成都位置");
              resolve(CHENGDU_CENTER);
            }
          });
        } catch {
          setLocating(false);
          setError("定位失败，使用默认成都位置");
          resolve(CHENGDU_CENTER);
        }
      };

      tryNative();
    });
  }, []);

  return { locating, location, error, getUserLocation };
}
