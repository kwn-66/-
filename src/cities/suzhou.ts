import type { CityConfig } from "@/types";

const suzhou: CityConfig = {
  code: "suzhou",
  name: "苏州",
  center: [120.5954, 31.2989],
  zoom: 12,
  districts: [
    { code: "all", name: "全部苏州", center: [120.5954, 31.2989], zoom: 12 },
    { code: "320505", name: "姑苏区", center: [120.6173, 31.3363], zoom: 14 },
    { code: "320506", name: "吴中区", center: [120.6240, 31.2709], zoom: 13 },
    { code: "320507", name: "相城区", center: [120.6526, 31.4350], zoom: 13 },
    { code: "320508", name: "虎丘区", center: [120.5673, 31.2946], zoom: 14 },
    { code: "320509", name: "吴江区", center: [120.6416, 31.1592], zoom: 12 },
    { code: "320583", name: "昆山市", center: [120.9818, 31.3856], zoom: 12 },
  ],
  categories: [
    { id: "nearby_food", name: "附近美食", icon: "🍽️", type: "food", keyword: "美食" },
    { id: "milk_tea", name: "奶茶咖啡", icon: "🧋", type: "food", keyword: "奶茶" },
    { id: "hotpot", name: "火锅", icon: "🍲", type: "food", keyword: "火锅" },
    { id: "snack", name: "苏式面馆", icon: "🍜", type: "food", keyword: "苏式面" },
    { id: "dessert", name: "甜品糕点", icon: "🍰", type: "food", keyword: "甜品" },
    { id: "bbq", name: "烧烤", icon: "🍖", type: "food", keyword: "烧烤" },
    { id: "ktv", name: "KTV", icon: "🎤", type: "entertainment", keyword: "KTV" },
    { id: "massage", name: "按摩足疗", icon: "💆", type: "entertainment", keyword: "按摩" },
    { id: "bath", name: "洗浴汗蒸", icon: "🛁", type: "entertainment", keyword: "洗浴" },
    { id: "cinema", name: "私人影院", icon: "🎬", type: "entertainment", keyword: "私人影院" },
    { id: "gaming", name: "网吧电竞", icon: "🎮", type: "entertainment", keyword: "网吧" },
    { id: "gym", name: "健身中心", icon: "🏋️", type: "entertainment", keyword: "健身" },
  ],
};

export default suzhou;
