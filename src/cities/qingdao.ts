import type { CityConfig } from "@/types";

const qingdao: CityConfig = {
  code: "qingdao",
  name: "青岛",
  center: [120.3826, 36.0671],
  zoom: 12,
  districts: [
    { code: "all", name: "全部青岛", center: [120.3826, 36.0671], zoom: 12 },
    { code: "370202", name: "市南区", center: [120.4119, 36.0756], zoom: 14 },
    { code: "370212", name: "崂山区", center: [120.4690, 36.1070], zoom: 13 },
    { code: "370203", name: "市北区", center: [120.3748, 36.0877], zoom: 14 },
    { code: "370214", name: "李沧区", center: [120.4327, 36.1453], zoom: 13 },
    { code: "370211", name: "黄岛区", center: [120.1699, 35.9600], zoom: 12 },
    { code: "370215", name: "城阳区", center: [120.3963, 36.3069], zoom: 12 },
  ],
  categories: [
    { id: "nearby_food", name: "附近美食", icon: "🍽️", type: "food", keyword: "美食" },
    { id: "seafood", name: "海鲜", icon: "🦞", type: "food", keyword: "海鲜" },
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

export default qingdao;
