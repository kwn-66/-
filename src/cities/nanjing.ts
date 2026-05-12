import type { CityConfig } from "@/types";

const nanjing: CityConfig = {
  code: "nanjing",
  name: "南京",
  center: [118.7969, 32.0603],
  zoom: 12,
  districts: [
    { code: "all", name: "全部南京", center: [118.7969, 32.0603], zoom: 12 },
    { code: "320102", name: "玄武区", center: [118.7978, 32.0487], zoom: 14 },
    { code: "320104", name: "秦淮区", center: [118.7947, 32.0391], zoom: 14 },
    { code: "320105", name: "建邺区", center: [118.7317, 32.0031], zoom: 14 },
    { code: "320106", name: "鼓楼区", center: [118.7697, 32.0664], zoom: 14 },
    { code: "320115", name: "江宁区", center: [118.8397, 31.9535], zoom: 12 },
    { code: "320116", name: "浦口区", center: [118.6280, 32.0593], zoom: 12 },
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

export default nanjing;
