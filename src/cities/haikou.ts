import type { CityConfig } from "@/types";

const haikou: CityConfig = {
  code: "haikou",
  name: "海口",
  center: [110.1999, 20.0440],
  zoom: 12,
  districts: [
    { code: "all", name: "全部海口", center: [110.1999, 20.0440], zoom: 12 },
    { code: "460105", name: "秀英区", center: [110.2936, 20.0075], zoom: 13 },
    { code: "460106", name: "龙华区", center: [110.3288, 19.9947], zoom: 14 },
    { code: "460107", name: "琼山区", center: [110.3889, 19.9824], zoom: 14 },
    { code: "460108", name: "美兰区", center: [110.3666, 20.0286], zoom: 14 },
  ],
  categories: [
    { id: "nearby_food", name: "附近美食", icon: "🍽️", type: "food", keyword: "美食" },
    { id: "seafood", name: "海鲜", icon: "🦞", type: "food", keyword: "海鲜" },
    { id: "milk_tea", name: "奶茶咖啡", icon: "🧋", type: "food", keyword: "奶茶" },
    { id: "hotpot", name: "火锅", icon: "🍲", type: "food", keyword: "火锅" },
    { id: "snack", name: "小吃快餐", icon: "🌯", type: "food", keyword: "小吃" },
    { id: "dessert", name: "甜品", icon: "🍰", type: "food", keyword: "甜品" },
    { id: "ktv", name: "KTV", icon: "🎤", type: "entertainment", keyword: "KTV" },
    { id: "massage", name: "按摩足疗", icon: "💆", type: "entertainment", keyword: "按摩" },
    { id: "bath", name: "洗浴汗蒸", icon: "🛁", type: "entertainment", keyword: "洗浴" },
    { id: "cinema", name: "私人影院", icon: "🎬", type: "entertainment", keyword: "私人影院" },
    { id: "gaming", name: "网吧电竞", icon: "🎮", type: "entertainment", keyword: "网吧" },
    { id: "gym", name: "健身中心", icon: "🏋️", type: "entertainment", keyword: "健身" },
  ],
};

export default haikou;
