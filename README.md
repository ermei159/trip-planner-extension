# 行间 · Trip Planner Chrome 扩展

此项目把之前生成的 Trip Planner 网页应用打包为 Chrome Manifest V3 扩展。点击工具栏图标，会在新标签页打开本地旅行规划器。行程数据保存在浏览器本地。

## 在线介绍与下载

发布后访问：`https://ermei159.github.io/trip-planner-extension/`

网页的“下载扩展”按钮会下载本仓库 ZIP 压缩包。解压后，在 Chrome 打开 `chrome://extensions`，开启“开发者模式”，点击“加载已解压的扩展程序”，选择解压后直接包含 `manifest.json` 的文件夹（本项目 ZIP 顶层就是扩展目录）。Edge 用户可在 `edge://extensions` 完成相同步骤。

## 使用高德生成路线

首次创建行程时，填写出发地、目的地城市、日期、天数和偏好。扩展会通过项目后端使用高德 Web 服务 API，搜索目的地景点与美食，按地点距离安排顺序，并查询相邻停留点之间的步行或驾车路线。用户无需申请或填写 Key；高德 Key 只配置在后端 Secret 中，不会进入扩展或公开仓库。

## 部署路线 API

后端使用 Cloudflare Worker。进入 `api/` 后运行：

```powershell
npx wrangler login
npx wrangler deploy
npx wrangler secret put AMAP_KEY
```

`secret put` 会提示输入 Key。部署完成后，将 Worker 的 `workers.dev` 地址填入 `api-config.json` 的 `apiBase` 并推送到 `main`。扩展会从介绍网站读取这个公开服务地址，无需重新打包。Key 通过 Wrangler Secret 设置，不能写入源码或提交到 GitHub。Worker 对请求做了输入校验和基础频率限制；该限制是防止误用的第一层保护，不是精确的额度计量系统。

## 发布

仓库包含 `.github/workflows/pages.yml`。推送到 `main` 后，GitHub Actions 会自动发布仓库根目录到 GitHub Pages。首次发布如需选择 Pages 来源，请打开仓库 **Settings → Pages**，把 **Build and deployment / Source** 设为 **GitHub Actions**。

## 项目结构

- `index.html`、`style.css`、`site.js`：项目介绍页和下载按钮
- `extension/manifest.json`、`extension/background.js`：浏览器扩展入口与后端请求
- `api/worker.js`、`api/wrangler.jsonc`：高德路线 API 后端与部署配置
- `extension/app/`：旅行规划器网页应用
- `extension-source/`：React + Vite 源码；可在此修改功能并重新构建
- `downloads/trip-planner-extension.zip`：介绍页下载的安装包
- `.github/workflows/pages.yml`：GitHub Pages 自动部署流程

## 修改与重新构建扩展

```powershell
cd extension-source
npm install
npm run build
```

构建结果会直接写入 `extension/app/`。修改完成后重新压缩 `extension/` 文件夹，并更新 `downloads/trip-planner-extension.zip`，提交到 `main` 即可更新网站。

## 限制

扩展通过开发者模式安装，不是 Chrome Web Store 上架版。路线请求会使用项目所有者配置在 Worker Secret 中的高德 Key，调用量受该高德账号配额限制。行程数据保存在用户本地浏览器。
