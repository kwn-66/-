import type { POIResult, ShopInput } from "@/types";
import { isAMapReady } from "@/lib/amap";

const SEARCH_CITY = "成都";
const PAGE_SIZE = 5;
const DISCOVER_PAGE_SIZE = 15;

/** 搜索成都范围内的 POI */
export function searchPOI(keyword: string): Promise<POIResult[]> {
  return searchPOIWithOptions(keyword, { pageSize: PAGE_SIZE });
}

/** 扩展搜索 */
export function searchPOIWithOptions(
  keyword: string,
  options?: {
    pageSize?: number;
    district?: string;
  }
): Promise<POIResult[]> {
  return new Promise((resolve, reject) => {
    if (!isAMapReady()) {
      reject(new Error("地图 SDK 未就绪"));
      return;
    }

    try {
      const searchOptions: AMap.PlaceSearchOptions = {
        city: SEARCH_CITY,
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
  district?: string
): Promise<POIResult[]> {
  return searchPOIWithOptions(keyword, {
    pageSize: DISCOVER_PAGE_SIZE,
    district,
  });
}

/** 按多个分类批量搜索并去重 */
export async function searchMultiCategories(
  keywords: string[],
  district?: string
): Promise<POIResult[]> {
  const allResults = await Promise.all(
    keywords.map((kw) => searchByCategory(kw, district))
  );
  // 去重
  const seen = new Set<string>();
  return allResults.flat().filter((poi) => {
    if (seen.has(poi.id)) return false;
    seen.add(poi.id);
    return true;
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
