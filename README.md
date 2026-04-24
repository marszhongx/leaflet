# 旅游足迹地图

一个基于 Vite 和 Leaflet 的静态旅行足迹展示页。

当前版本支持：
- 全屏地图展示多个旅行地点
- 点击标记查看地点弹窗
- 弹窗里展示日期、说明和图片缩略图
- 点击缩略图打开灯箱预览
- 使用公开可访问的 OpenStreetMap Retina 底图

## 线上部署注意事项

当前项目默认使用公开可访问的 OpenStreetMap 瓦片：

- `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`

如果你后续想替换成其他第三方底图服务，需要先确认它是否满足以下条件：

1. 支持线上域名直接访问，而不只是本地开发环境
2. 不需要额外的 API key、token 或域名白名单
3. 允许在静态站点环境中直接加载瓦片

如果这些条件不满足，部署到 Vercel 之类的平台后，底图请求可能会返回 `401` 或 `403`，最终表现为地图区域无法正常显示。

因此，除非已经完成正式授权配置，否则不要直接把默认底图替换成需要鉴权的瓦片服务。

## 运行方式

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

如果需要固定本地地址和端口：

```bash
npm run dev -- --host 127.0.0.1 --port 4173
```

构建生产版本：

```bash
npm run build
```

本地预览构建结果：

```bash
npm run preview
```

## 测试

运行全部测试：

```bash
npm test
```

运行单个测试文件：

```bash
npm test -- src/mapView.test.js
```

## 项目结构

- `index.html`：页面入口和地图挂载点
- `src/main.js`：初始化地图、底图、标记和灯箱
- `src/places.js`：地点数据
- `src/mapView.js`：初始视野逻辑
- `src/popupContent.js`：弹窗内容渲染
- `src/lightbox.js`：图片灯箱逻辑
- `src/style.css`：地图、弹窗和灯箱样式
- `public/images/`：旅行卡片图片和相关静态资源

## 数据格式

`src/places.js` 中每个地点对象当前使用以下结构：

```js
{
  name: '北京',
  lat: 39.9042,
  lng: 116.4074,
  date: '2025-10-01',
  note: '故宫和景山的秋天很好看。',
  images: ['/images/beijing-1.png', '/images/beijing-2.png']
}
```

其中 `date`、`note`、`images` 都可以按需要省略。

## 图片资源

当前地点图片使用 `public/images/` 下的 PNG 卡片资源。
如果要继续扩展地点图片，可以：

1. 把新图片放进 `public/images/`
2. 在 `src/places.js` 里补充对应路径
3. 重新启动或刷新开发页面查看效果
