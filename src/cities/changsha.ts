import type { CityConfig } from "@/types";

const changsha: CityConfig = {
  code: "changsha",
  name: "长沙",
  center: [112.9388, 28.2278],
  zoom: 12,
  districts: [
    { code: "all", name: "全部长沙", center: [112.9388, 28.2278], zoom: 12 },
    { code: "430102", name: "芙蓉区", center: [113.0325, 28.1875], zoom: 14 },
    { code: "430103", name: "天心区", center: [112.9898, 28.1146], zoom: 14 },
    { code: "430104", name: "岳麓区", center: [112.9314, 28.2350], zoom: 14 },
    { code: "430105", name: "开福区", center: [112.9855, 28.2564], zoom: 14 },
    { code: "430111", name: "雨花区", center: [113.0355, 28.1352], zoom: 14 },
    { code: "430112", name: "望城区", center: [112.8310, 28.3531], zoom: 12 },
  ],
  categories: [
    { id: "nearby_food", name: "附近美食", icon: "🍽️", type: "food", keyword: "美食" },
    { id: "milk_tea", name: "茶颜悦色", icon: "🧋", type: "food", keyword: "茶颜悦色" },
    { id: "snack", name: "湘菜小吃", icon: "🌶️", type: "food", keyword: "湘菜" },
    { id: "hotpot", name: "火锅", icon: "🍲", type: "food", keyword: "火锅" },
    { id: "bbq", name: "烧烤", icon: "🍖", type: "food", keyword: "烧烤" },
    { id: "dessert", name: "甜品", icon: "🍰", type: "food", keyword: "甜品" },
    { id: "ktv", name: "KTV", icon: "🎤", type: "entertainment", keyword: "KTV" },
    { id: "massage", name: "按摩足疗", icon: "💆", type: "entertainment", keyword: "按摩" },
    { id: "bath", name: "洗浴汗蒸", icon: "🛁", type: "entertainment", keyword: "洗浴" },
    { id: "cinema", name: "私人影院", icon: "🎬", type: "entertainment", keyword: "私人影院" },
    { id: "gaming", name: "网吧电竞", icon: "🎮", type: "entertainment", keyword: "网吧" },
    { id: "gym", name: "健身中心", icon: "🏋️", type: "entertainment", keyword: "健身" },
  ],
};

export default changsha;
