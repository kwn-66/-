import type { POIResult, ShopInput } from "@/types";
import { isAMapReady } from "@/lib/amap";

const SEARCH_CITY = "成都";
const PAGE_SIZE = 5;

/** 搜索成都范围内的 POI */
export function searchPOI(keyword: string): Promise<POIResult[]> {
  return new Promise((resolve, reject) => {
    if (!isAMapReady()) {
      reject(new Error("地图 SDK 未就绪"));
      return;
    }

    try {
      const placeSearch = new window.AMap.PlaceSearch({
        city: SEARCH_CITY,
        citylimit: true,
        pageSize: PAGE_SIZE,
        pageIndex: 1,
      });

      placeSearch.search(keyword, (status: string, result: AMap.PlaceSearchResult) => {
        if (status === "complete" && result.poiList?.pois) {
          const results: POIResult[] = result.poiList.pois.map(
            (poi: AMap.POI) => ({
              id: poi.id,
              name: poi.name,
              address: poi.address || "",
              location: [poi.location.lng, poi.location.lat] as [
                number,
                number,
              ],
              city: poi.cityname,
              distance: poi.distance,
            })
          );
          resolve(results);
        } else {
          resolve([]);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

/** 批量搜索店铺，返回每个店铺的 POI 匹配结果 */
export async function searchAllShops(
  shops: ShopInput[]
): Promise<ShopInput[]> {
  const results = await Promise.all(
    shops.map(async (shop) => {
      const name = shop.name.trim();
      if (!name) return shop;

      try {
        const pois = await searchPOI(name);
        const chengduPois = pois.filter(
          (poi) => poi.city === "成都市" || poi.city === "成都"
        );
        // 优先匹配成都本地结果，没有则用第一个结果
        return {
          ...shop,
          poi: chengduPois[0] || pois[0] || null,
          loading: false,
        };
      } catch {
        return { ...shop, poi: null, loading: false };
      }
    })
  );

  return results;
}
