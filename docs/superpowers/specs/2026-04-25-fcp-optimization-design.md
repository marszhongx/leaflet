# FCP 优化设计

## 背景

当前应用是 Vite + Leaflet 单页地图。`src/main.js` 同步导入 Leaflet、Leaflet CSS、地点数据、弹窗/lightbox 逻辑以及 Vercel Analytics / Speed Insights。首屏需要等待地图相关脚本执行后才出现主要内容，本次优化以本地 Lighthouse / PageSpeed 的 mobile 和 desktop First Contentful Paint 表现为验收重点。

## 目标

- 首屏尽快绘制可见内容，改善 Lighthouse mobile 和 desktop 的 FCP。
- 保持最终 Leaflet 地图体验不变：地图、marker、popup、图片 lightbox 都正常工作。
- 首屏加载态要接近最终 Leaflet/OSM 地图观感，避免地图加载完成时视觉跳变明显。

## 非目标

- 不新增后端、远程数据源或地点编辑能力。
- 不改变地点数据结构。
- 不替换 Leaflet 或 OSM tile layer。
- 不引入图片、字体或新的 UI 依赖来实现骨架屏。

## 方案

采用“Leaflet 风格骨架屏 + 异步地图启动”的方案。

首屏由 HTML 和 CSS 直接提供一个轻量骨架层。骨架层只表现地图本身，不显示“旅游足迹”“地图加载中”等文字。视觉上模拟 Leaflet + OSM：浅灰米色瓦片底、瓦片网格、淡色道路/水系线稿，以及接近 Leaflet 默认蓝色水滴形 marker 的简化 SVG。

`src/main.js` 作为轻量入口，不再同步导入 Leaflet、Leaflet CSS、地点数据和 Vercel 统计模块。地图初始化逻辑迁移到独立模块，例如 `src/mapApp.js`，由入口动态导入。地图模块加载并初始化完成后，给页面添加 ready 状态，让骨架层淡出并退出交互。

Vercel Analytics 和 Speed Insights 改为动态加载，并在地图启动之后或浏览器空闲时执行，减少对首屏主线程和关键请求的影响。

## 组件与职责

### `index.html`

- 保留 `#map` 作为 Leaflet 挂载点。
- 在 `#map` 内预置骨架层 DOM。
- 骨架层使用内联 SVG，避免额外资源请求。

### `src/style.css`

- 继续保证 `html`、`body`、`#map` 和 `.leaflet-container` 全屏。
- 添加骨架层样式：绝对定位覆盖地图区域、浅色地图底、淡出过渡。
- 添加 ready 状态样式，在地图初始化完成后隐藏骨架层。

### `src/main.js`

- 保持入口轻量。
- 动态导入地图初始化模块。
- 动态导入 Vercel 统计模块，并尽量延后执行。
- 捕获地图启动失败时保留骨架层，避免首屏空白。

### `src/mapApp.js`

- 承接现有 `src/main.js` 中的 Leaflet 初始化逻辑。
- 导入 Leaflet、Leaflet CSS、地图视图逻辑、marker icon、popup、lightbox、places、tile layer options。
- 创建地图、添加 tile layer、渲染 marker、绑定 popup/lightbox、应用初始 viewport。
- 初始化完成后返回或触发 ready 状态。

## 数据流

1. 浏览器解析 `index.html`，立即得到 `#map` 和骨架层。
2. CSS 加载后绘制 Leaflet 风格地图骨架屏，形成更早的 FCP 内容。
3. `src/main.js` 执行，动态导入 `src/mapApp.js`。
4. `src/mapApp.js` 加载 Leaflet 及现有地图依赖并初始化真实地图。
5. 地图初始化成功后添加 ready 状态，骨架层淡出。
6. 浏览器空闲或地图启动后动态加载 Vercel Analytics / Speed Insights。

## 错误处理

如果地图模块动态导入或初始化失败，不移除骨架层，避免用户看到空白首屏。错误只记录到控制台，不新增用户可见错误 UI。

## 测试与验收

### 自动化测试

- 更新 `main.test.js`，确认入口使用动态加载策略，不再同步注入 Vercel Analytics / Speed Insights。
- 为新的地图初始化模块保留或迁移现有行为覆盖。
- 保持现有 `mapView.test.js`、popup、lightbox、places、tile layer、marker icon 相关测试通过。

### 构建验证

- 运行 `npm test`。
- 运行 `npm run build`。

### 浏览器验证

- 启动本地 dev 或 preview 服务。
- 确认首屏先显示无文字 Leaflet 风格骨架屏。
- 确认真实地图加载完成后骨架屏淡出。
- 确认 marker、popup、图片 lightbox 正常工作。
- 用 Chrome DevTools Lighthouse 分别测试 mobile 和 desktop，观察 FCP 改善情况。
