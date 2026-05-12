import type { CityConfig } from "@/types";

const baoding: CityConfig = {
  code: "baoding",
  name: "保定",
  center: [115.4646, 38.8739],
  zoom: 12,
  districts: [
    { code: "all", name: "全部保定", center: [115.4646, 38.8739], zoom: 12 },
    { code: "130602", name: "竞秀区", center: [115.4581, 38.8777], zoom: 14 },
    { code: "130606", name: "莲池区", center: [115.5255, 38.8836], zoom: 14 },
    { code: "130607", name: "满城区", center: [115.3220, 38.9489], zoom: 13 },
    { code: "130608", name: "清苑区", center: [115.4900, 38.7655], zoom: 13 },
  ],
  categories: [
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
  ],
};

export default baoding;
