# 成都 AI 本地生活路线规划平台 — Phase 1 MVP 设计文档

**日期**: 2026-05-12
**状态**: 待审核

---

## 一、产品定位

帮助用户发现成都本地美食与休闲娱乐，自动生成混合交通消费路线。

核心交互方式：
- **模式A（保留）**：手动输入店名 → POI搜索 → 规划路线
- **模式B（新增）**：浏览区域+分类 → 发现店铺Feed → 勾选 → 规划路线

## 二、页面状态机

页面不变，底部面板改为4个Tab按钮互斥切换：

| Tab | 面板 | 来源 |
|-----|------|------|
| 手动输入 | ShopInput | 保留 |
| 浏览发现 | 区域 + 分类 + Feed + 路线池 | 新增 |
| 路线详情 | RouteCard + 动画控制 | 保留+增强 |
| 我的路线 | 已保存路线列表 | 新增 |

路由后自动切到「路线详情」tab。

## 三、新增模块

### 3.1 城市配置（config/chengdu.ts）

预留全国扩展接口。成都配置包含：

- **区域列表**：全部成都、锦江区、武侯区、高新区、青羊区、成华区、双流区
  每个区域含 code/name/center/zoom
- **分类列表**：美食6个 + 休闲娱乐6个
  每个分类含 id/name/icon/type/keyword

### 3.2 区域筛选（features/district/DistrictFilter.tsx）

横向滑动胶囊标签。「全部成都」与具体区域互斥。

### 3.3 分类卡片（features/category/CategoryCards.tsx）

两行横向滑动（美食一行、休闲一行），emoji+文字多选胶囊。

### 3.4 店铺 Feed（features/store-feed/StoreFeed.tsx）

美团风格卡片列表，每张显示：
- 勾选框、店名（hover放大放亮）、评分、人均、距离、地址、分类
- 点击店名 → `window.open()` 跳转大众点评搜索页
- 勾选 → 加入路线池

数据源：高德 POI PlaceSearch，按所选区域+分类关键词搜索，citylimit:true，pageSize:15

### 3.5 路线池（features/route-pool/RoutePool.tsx）

底部固定栏：
- 显示已选数量
- 横向滑动标签，可删除单店
- 「生成路线」按钮（最少2家）

### 3.6 AI 自动推荐

不勾店时 Feed 底部出现「帮我推荐」按钮，自动选3家评分最高的店生成路线。

### 3.7 路线持久化（features/saved-routes/）

**storage.ts**：localStorage CRUD 封装
**SavedRoutes.tsx**：卡片列表，显示标题/店铺数/总时间/总距离/创建日期，支持查看（恢复地图状态）和删除。

### 3.8 路线保存

规划完成后 RouteCard 底部出现「保存路线」按钮 → 弹出输入框让用户填标题 → 默认标题 "YYYY-MM-DD 成都路线" → 存 localStorage。

## 四、类型扩展（types/index.ts 新增）

```ts
interface District { code: string; name: string; center: [number, number]; zoom: number; }
interface Category { id: string; name: string; icon: string; type: "food" | "entertainment"; keyword: string; }
interface SavedRoute { id: string; title: string; createdAt: string; city: string; districts: string[]; categories: string[]; stores: POIResult[]; plan: RoutePlan; }
```

## 五、文件树

```
src/
├── config/chengdu.ts              # 新增
├── features/
│   ├── district/DistrictFilter.tsx # 新增
│   ├── category/CategoryCards.tsx   # 新增
│   ├── store-feed/StoreFeed.tsx     # 新增
│   ├── route-pool/RoutePool.tsx     # 新增
│   └── saved-routes/
│       ├── SavedRoutes.tsx          # 新增
│       └── storage.ts               # 新增
├── types/index.ts                   # 扩展
├── services/poi.ts                  # 增强（分类+区域+更多结果）
└── app/page.tsx                     # 改为4 Tab状态机
```

## 六、数据流

```
选区域 → 选分类 → 自动POI搜索
              ↓
        【店铺 Feed】
        ☑ 勾选店铺
              ↓
        【路线池】增删
              ↓
       「生成路线」
              ↓
  planSmartRoute() → 路线详情 + 地图动画
              ↓
       「保存路线」
              ↓
     localStorage 持久化 → 我的路线
```

## 七、不影响项

- AMap SDK 加载逻辑不变
- 路线规划引擎不变（route-engine/）
- 动画引擎不变（animation/）
- 现有 ShopInput/RouteCard 组件仅增强不重写
