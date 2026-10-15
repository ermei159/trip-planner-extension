# 行间 · Trip Planner Chrome 扩展

此项目把之前生成的 Trip Planner 网页应用打包为 Chrome Manifest V3 扩展。点击工具栏图标，会在新标签页打开本地旅行规划器。行程数据保存在浏览器本地。

## 在线介绍与下载

发布后访问：`https://ermei159.github.io/trip-planner-extension/`

网页的“下载扩展”按钮会下载本仓库 ZIP 压缩包。解压后，在 Chrome 打开 `chrome://extensions`，开启“开发者模式”，点击“加载已解压的扩展程序”，选择压缩包中的 `extension` 文件夹。Edge 用户可在 `edge://extensions` 完成相同步骤。

## 使用高德生成路线

首次创建行程时，填写出发地、目的地城市、日期、天数和偏好。扩展会搜索目的地景点与美食，按地点距离安排顺序，并查询相邻停留点之间的步行或驾车路线。首次使用会提示设置高德开放平台的 **Web 服务 API Key**；也可在扩展右上角“高德设置”中填写。Key 只存储在当前浏览器扩展的本地存储中，不会上传到本仓库。已配置 Codex 的 GaoDe MCP 连接不能直接被已下载的浏览器扩展调用，因此这里使用高德 Web 服务 API。

## 发布

仓库包含 `.github/workflows/pages.yml`。推送到 `main` 后，GitHub Actions 会自动发布仓库根目录到 GitHub Pages。首次发布如需选择 Pages 来源，请打开仓库 **Settings → Pages**，把 **Build and deployment / Source** 设为 **GitHub Actions**。

## 项目结构

- `index.html`、`style.css`、`site.js`：项目介绍页和下载按钮
- `extension/manifest.json`、`extension/background.js`：浏览器扩展入口
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

扩展通过开发者模式安装，不是 Chrome Web Store 上架版。路线生成需要用户自己的高德 Web 服务 API Key，受高德账号的配额和 Key 设置限制。行程数据与 Key 保存在本地浏览器。
