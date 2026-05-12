import type { CityConfig } from "@/types";

const lanzhou: CityConfig = {
  code: "lanzhou",
  name: "兰州",
  center: [103.8343, 36.0611],
  zoom: 12,
  districts: [
    { code: "all", name: "全部兰州", center: [103.8343, 36.0611], zoom: 12 },
    { code: "620102", name: "城关区", center: [103.8253, 36.0571], zoom: 14 },
    { code: "620103", name: "七里河区", center: [103.7711, 36.0653], zoom: 14 },
    { code: "620104", name: "西固区", center: [103.6273, 36.0888], zoom: 13 },
    { code: "620105", name: "安宁区", center: [103.7192, 36.1047], zoom: 14 },
  ],
  categories: [
    { id: "nearby_food", name: "附近美食", icon: "🍽️", type: "food", keyword: "美食" },
    { id: "noodles", name: "牛肉面", icon: "🍜", type: "food", keyword: "牛肉面" },
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

export default lanzhou;
