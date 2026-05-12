"use client";

import { useState, useCallback, useRef } from "react";
import { isAMapReady } from "@/lib/amap";
import { detectCityFromCoords, getDefaultCity } from "@/cities/registry";
import type { UserLocation, CityConfig } from "@/types";

interface UseGeolocationReturn {
  locating: boolean;
  location: UserLocation | null;
  city: CityConfig;
  error: string | null;
  getUserLocation: () => Promise<{ location: UserLocation; city: CityConfig }>;
  setCity: (city: CityConfig) => void;
}

export function useGeolocation(): UseGeolocationReturn {
  const [locating, setLocating] = useState(false);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [city, setCityState] = useState<CityConfig>(getDefaultCity);
  const [error, setError] = useState<string | null>(null);
  const geolocationRef = useRef<AMap.Geolocation | null>(null);

  const getUserLocation = useCallback(async (): Promise<{
    location: UserLocation;
    city: CityConfig;
  }> => {
    setLocating(true);
    setError(null);

    return new Promise((resolve) => {
      const resolveWith = (loc: UserLocation) => {
        const detectedCity = detectCityFromCoords(loc.lat, loc.lng, loc.address);
        setLocation(loc);
        setCityState(detectedCity);
        setLocating(false);
        resolve({ location: loc, city: detectedCity });
      };

      const tryNative = () => {
        if (!navigator.geolocation) return tryAMap();

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc: UserLocation = {
              lng: pos.coords.longitude,
              lat: pos.coords.latitude,
            };
            resolveWith(loc);
          },
          () => tryAMap(),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
      };

      const tryAMap = () => {
        if (!isAMapReady()) {
          const fallback = getDefaultCity();
          const loc: UserLocation = {
            lng: fallback.center[0],
            lat: fallback.center[1],
            address: fallback.name,
          };
          setLocating(false);
          setError("定位不可用，使用默认城市");
          resolve({ location: loc, city: fallback });
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
            if (status === "complete" && result.position) {
              const loc: UserLocation = {
                lng: result.position.lng,
                lat: result.position.lat,
                address: result.formattedAddress,
              };
              resolveWith(loc);
            } else {
              const fallback = getDefaultCity();
              const loc: UserLocation = {
                lng: fallback.center[0],
                lat: fallback.center[1],
                address: fallback.name,
              };
              setError("定位失败，使用默认城市");
              resolve({ location: loc, city: fallback });
            }
          });
        } catch {
          const fallback = getDefaultCity();
          const loc: UserLocation = {
            lng: fallback.center[0],
            lat: fallback.center[1],
            address: fallback.name,
          };
          setLocating(false);
          setError("定位失败，使用默认城市");
          resolve({ location: loc, city: fallback });
        }
      };

      tryNative();
    });
  }, []);

  return {
    locating,
    location,
    city,
    error,
    getUserLocation,
    setCity: setCityState,
  };
}
