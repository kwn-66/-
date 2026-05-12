import type { CityConfig } from "@/types";
import chengdu from "./chengdu";
import suzhou from "./suzhou";
import nanjing from "./nanjing";
import qingdao from "./qingdao";
import lanzhou from "./lanzhou";
import baoding from "./baoding";
import haikou from "./haikou";
import changsha from "./changsha";
import xining from "./xining";

const allCities: CityConfig[] = [
  chengdu, suzhou, nanjing, qingdao, lanzhou,
  baoding, haikou, changsha, xining,
];

const byCode = new Map<string, CityConfig>();
const byName = new Map<string, CityConfig>();

allCities.forEach((c) => {
  byCode.set(c.code, c);
  byName.set(c.name, c);
});

/** 根据城市编码获取配置 */
export function getCityByCode(code: string): CityConfig | undefined {
  return byCode.get(code);
}

/** 根据城市名模糊匹配（从地址中提取） */
export function detectCityFromAddress(address?: string): CityConfig | undefined {
  if (!address) return undefined;
  for (const city of allCities) {
    if (address.includes(city.name)) return city;
  }
  return undefined;
}

/** 根据坐标反查城市（通过地址文本匹配） */
export function detectCityFromCoords(
  lat: number,
  lng: number,
  address?: string
): CityConfig {
  const fromAddr = detectCityFromAddress(address);
  if (fromAddr) return fromAddr;
  // fallback to chengdu
  return chengdu;
}

/** 获取默认城市（成都） */
export function getDefaultCity(): CityConfig {
  return chengdu;
}

/** 获取所有城市列表 */
export function getAllCities(): CityConfig[] {
  return allCities;
}

/** 根据城市编码获取可用分类关键词 */
export function getCityCategoryKeywords(cityCode: string): string[] {
  const city = getCityByCode(cityCode);
  if (!city) return [];
  return city.categories.map((c) => c.keyword);
}
