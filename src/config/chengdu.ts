import type { District, Category } from "@/types";

export const CHENGDU_DISTRICTS: District[] = [
  { code: "all", name: "全部成都", center: [104.0657, 30.6573], zoom: 12 },
  { code: "510104", name: "锦江区", center: [104.0833, 30.6576], zoom: 14 },
  { code: "510107", name: "武侯区", center: [104.0434, 30.6419], zoom: 14 },
  { code: "510108", name: "成华区", center: [104.1013, 30.6601], zoom: 14 },
  { code: "510105", name: "青羊区", center: [104.0611, 30.6736], zoom: 14 },
  { code: "510109", name: "高新区", center: [104.0470, 30.5762], zoom: 14 },
  { code: "510116", name: "双流区", center: [103.9237, 30.5745], zoom: 13 },
];

export const CHENGDU_CATEGORIES: Category[] = [
  { id: "nearby_food", name: "附近美食", icon: "🍽️", type: "food", keyword: "美食" },
  { id: "milk_tea", name: "奶茶咖啡", icon: "🧋", type: "food", keyword: "奶茶" },
  { id: "hotpot", name: "火锅", icon: "🍲", type: "food", keyword: "火锅" },
  { id: "snack", name: "小吃快餐", icon: "🌯", type: "food", keyword: "小吃" },
  { id: "dessert", name: "甜品", icon: "🍰", type: "food", keyword: "甜品" },
  { id: "bbq", name: "烧烤", icon: "🍖", type: "food", keyword: "烧烤" },
  { id: "ktv", name: "KTV", icon: "🎤", type: "entertainment", keyword: "KTV" },
  { id: "massage", name: "按摩足疗", icon: "💆", type: "entertainment", keyword: "按摩" },
  { id: "bath", name: "洗浴汗蒸", icon: "🛁", type: "entertainment", keyword: "洗浴" },
  { id: "cinema", name: "私人影院", icon: "🎬", type: "entertainment", keyword: "私人影院" },
  { id: "gaming", name: "网吧电竞", icon: "🎮", type: "entertainment", keyword: "网吧" },
  { id: "gym", name: "健身中心", icon: "🏋️", type: "entertainment", keyword: "健身" },
];
