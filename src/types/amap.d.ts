/* eslint-disable @typescript-eslint/no-explicit-any */

interface Window {
  AMap: any;
  _AMapSecurityConfig?: {
    securityJsCode: string;
  };
}

declare namespace AMap {
  class Map {
    constructor(container: string | HTMLElement, opts?: MapOptions);
    destroy(): void;
    setCenter(center: [number, number]): void;
    setZoom(zoom: number): void;
    setFitView(overlays?: any[], immediately?: boolean, avoid?: number[]): void;
    add(overlay: any): void;
    remove(overlay: any): void;
    clearMap(): void;
    getCenter(): { lng: number; lat: number };
    getZoom(): number;
    on(event: string, handler: (e: any) => void): void;
    off(event: string, handler: (e: any) => void): void;
  }

  interface MapOptions {
    zoom?: number;
    center?: [number, number];
    resizeEnable?: boolean;
    viewMode?: "2D" | "3D";
    mapStyle?: string;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    setPosition(position: [number, number]): void;
    getPosition(): { lng: number; lat: number };
    setMap(map: Map | null): void;
    setLabel(label: { content: string; offset?: { x: number; y: number } }): void;
    setContent(content: string): void;
    on(event: string, handler: (e: any) => void): void;
    remove(): void;
  }

  interface MarkerOptions {
    position?: [number, number];
    map?: Map;
    icon?: string;
    offset?: { x: number; y: number };
    animation?: string;
  }

  class Polyline {
    constructor(opts?: PolylineOptions);
    setMap(map: Map | null): void;
    setPath(path: [number, number][]): void;
  }

  interface PolylineOptions {
    path?: [number, number][];
    map?: Map;
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
    strokeStyle?: "solid" | "dashed";
    lineJoin?: "round" | "miter";
    lineCap?: "round" | "butt";
    showDir?: boolean;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    setContent(content: string): void;
    open(map: Map, position?: [number, number]): void;
    close(): void;
  }

  interface InfoWindowOptions {
    content?: string;
    offset?: { x: number; y: number };
  }

  class Geolocation {
    constructor(opts?: GeolocationOptions);
    getCurrentPosition(
      callback: (status: string, result: GeolocationResult) => void
    ): void;
  }

  interface GeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    showButton?: boolean;
    buttonPosition?: string;
  }

  interface GeolocationResult {
    position: { lng: number; lat: number };
    formattedAddress: string;
  }

  class PlaceSearch {
    constructor(opts?: PlaceSearchOptions);
    search(
      keyword: string,
      callback: (status: string, result: PlaceSearchResult) => void
    ): void;
    setCity(city: string): void;
    setType(type: string): void;
  }

  interface PlaceSearchOptions {
    city?: string;
    citylimit?: boolean;
    pageSize?: number;
    pageIndex?: number;
  }

  interface PlaceSearchResult {
    poiList: {
      pois: POI[];
      count: number;
    };
  }

  interface POI {
    id: string;
    name: string;
    address: string;
    location: { lng: number; lat: number };
    pname: string;
    cityname: string;
    adname: string;
    distance?: number;
  }

  class Driving {
    constructor(opts?: DrivingOptions);
    search(
      origin: [number, number],
      destination: [number, number],
      callback: (status: string, result: DrivingResult) => void
    ): void;
  }

  interface DrivingOptions {
    policy?: number;
    extensions?: string;
  }

  interface DrivingResult {
    routes: Route[];
  }

  class Walking {
    constructor(opts?: WalkingOptions);
    search(
      origin: [number, number],
      destination: [number, number],
      callback: (status: string, result: WalkingResult) => void
    ): void;
  }

  interface WalkingOptions {
    policy?: number;
  }

  interface WalkingResult {
    routes: Route[];
  }

  class Riding {
    constructor(opts?: RidingOptions);
    search(
      origin: [number, number],
      destination: [number, number],
      callback: (status: string, result: RidingResult) => void
    ): void;
  }

  interface RidingOptions {
    policy?: number;
  }

  interface RidingResult {
    routes: Route[];
  }

  class Transfer {
    constructor(opts?: TransferOptions);
    search(
      origin: [number, number],
      destination: [number, number],
      callback: (status: string, result: TransferResult) => void
    ): void;
  }

  interface TransferOptions {
    policy?: number;
    city?: string;
    cityd?: string;
    extensions?: string;
  }

  interface TransferResult {
    routes: TransitRoute[];
  }

  interface TransitRoute {
    distance: number;
    time: number;
    segments: TransitSegment[];
  }

  interface TransitSegment {
    transit_mode: string;
    distance: number;
    time: number;
    path: [number, number][];
    transit?: {
      name: string;
      via_num: number;
      start_stop: { name: string; location: { lng: number; lat: number } };
      end_stop: { name: string; location: { lng: number; lat: number } };
    };
    walking?: { distance: number; time: number; steps: Step[] };
  }

  interface Route {
    distance: number;
    time: number;
    steps: Step[];
  }

  interface Step {
    instruction: string;
    distance: number;
    time: number;
    path: [number, number][];
  }
}
