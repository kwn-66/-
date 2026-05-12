import type { POIResult, ShopInput } from "@/types";
import { isAMapReady } from "@/lib/amap";

const PAGE_SIZE = 5;
const DISCOVER_PAGE_SIZE = 15;

/** 搜索 POI */
export function searchPOI(keyword: string, city?: string): Promise<POIResult[]> {
  return searchPOIWithOptions(keyword, { pageSize: PAGE_SIZE, city });
}

/** 扩展搜索 */
export function searchPOIWithOptions(
  keyword: string,
  options?: {
    pageSize?: number;
    city?: string;
    district?: string;
  }
): Promise<POIResult[]> {
  return new Promise((resolve, reject) => {
    if (!isAMapReady()) {
      reject(new Error("地图 SDK 未就绪"));
      return;
    }

    const city = options?.city || "成都";

    try {
      const searchOptions: AMap.PlaceSearchOptions = {
        city,
        citylimit: true,
        pageSize: options?.pageSize ?? PAGE_SIZE,
        pageIndex: 1,
      };

      // 区域筛选：在搜索关键词前加区域名
      let searchKeyword = keyword;
      if (options?.district && options.district !== "全部成都") {
        searchKeyword = `${options.district} ${keyword}`;
      }

      const placeSearch = new window.AMap.PlaceSearch(searchOptions);

      placeSearch.search(
        searchKeyword,
        (status: string, result: AMap.PlaceSearchResult) => {
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
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

/** 按分类搜索店铺（浏览发现模式） */
export async function searchByCategory(
  keyword: string,
  city?: string,
  district?: string
): Promise<POIResult[]> {
  return searchPOIWithOptions(keyword, {
    pageSize: DISCOVER_PAGE_SIZE,
    city,
    district,
  });
}

/** 按多个分类批量搜索并去重 */
export async function searchMultiCategories(
  keywords: string[],
  city?: string,
  district?: string
): Promise<POIResult[]> {
  const allResults = await Promise.all(
    keywords.map((kw) => searchByCategory(kw, city, district))
  );
  const seen = new Set<string>();
  return allResults.flat().filter((poi) => {
    if (seen.has(poi.id)) return false;
    seen.add(poi.id);
    return true;
  });
}

/** 批量搜索店铺，返回每个店铺的 POI 匹配结果 */
export async function searchAllShops(
  shops: ShopInput[],
  city?: string
): Promise<ShopInput[]> {
  const results = await Promise.all(
    shops.map(async (shop) => {
      const name = shop.name.trim();
      if (!name) return shop;

      try {
        const pois = await searchPOI(name, city);
        const cityName = city || "成都";
        const localPois = pois.filter(
          (poi) => poi.city?.includes(cityName) || poi.city === cityName
        );
        return {
          ...shop,
          poi: localPois[0] || pois[0] || null,
          loading: false,
        };
      } catch {
        return { ...shop, poi: null, loading: false };
      }
    })
  );

  return results;
}
