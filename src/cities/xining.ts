import type { CityConfig } from "@/types";

const xining: CityConfig = {
  code: "xining",
  name: "西宁",
  center: [101.7782, 36.6171],
  zoom: 12,
  districts: [
    { code: "all", name: "全部西宁", center: [101.7782, 36.6171], zoom: 12 },
    { code: "630102", name: "城东区", center: [101.8310, 36.5997], zoom: 14 },
    { code: "630103", name: "城中区", center: [101.7840, 36.6230], zoom: 14 },
    { code: "630104", name: "城西区", center: [101.7658, 36.6282], zoom: 14 },
    { code: "630105", name: "城北区", center: [101.7662, 36.6500], zoom: 14 },
  ],
  categories: [
    { id: "nearby_food", name: "附近美食", icon: "🍽️", type: "food", keyword: "美食" },
    { id: "noodles", name: "面食", icon: "🍜", type: "food", keyword: "面食" },
    { id: "milk_tea", name: "奶茶咖啡", icon: "🧋", type: "food", keyword: "奶茶" },
    { id: "hotpot", name: "火锅", icon: "🍲", type: "food", keyword: "火锅" },
    { id: "snack", name: "小吃快餐", icon: "🌯", type: "food", keyword: "小吃" },
    { id: "bbq", name: "烧烤", icon: "🍖", type: "food", keyword: "烧烤" },
    { id: "ktv", name: "KTV", icon: "🎤", type: "entertainment", keyword: "KTV" },
    { id: "massage", name: "按摩足疗", icon: "💆", type: "entertainment", keyword: "按摩" },
    { id: "bath", name: "洗浴汗蒸", icon: "🛁", type: "entertainment", keyword: "洗浴" },
    { id: "cinema", name: "私人影院", icon: "🎬", type: "entertainment", keyword: "私人影院" },
    { id: "gaming", name: "网吧电竞", icon: "🎮", type: "entertainment", keyword: "网吧" },
    { id: "gym", name: "健身中心", icon: "🏋️", type: "entertainment", keyword: "健身" },
  ],
};

export default xining;
