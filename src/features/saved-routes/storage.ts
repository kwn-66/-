import type { SavedRoute } from "@/types";

const STORAGE_KEY = "chengdu_routes";

export function loadRoutes(): SavedRoute[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveRoute(route: SavedRoute): void {
  const routes = loadRoutes();
  routes.unshift(route);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

export function deleteRoute(id: string): void {
  const routes = loadRoutes().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

export function getRouteById(id: string): SavedRoute | undefined {
  return loadRoutes().find((r) => r.id === id);
}
