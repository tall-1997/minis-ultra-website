# Minis Ultra 静态官网

纯 HTML / CSS / JS，无构建步骤。图标为站点自制 SVG（`js/site.js` 注入）。

## 线上地址

GitHub Pages（推送到 `main` 由 `.github/workflows/pages.yml` 自动部署）：
**https://tall-1997.github.io/minis-ultra-website/**

## 本地预览

用任意静态服务器打开本项目目录，例如：

```
python -m http.server 8080
```

浏览器打开 `http://127.0.0.1:8080/`。直接双击 `index.html` 也可以，但实时数据 / 测速 / 历史版本依赖 fetch，需要 http(s) 环境。

## 页面

| 文件 | 内容 |
|---|---|
| `index.html` | 定位、能力、和原版差异摘要 |
| `compare.html` | 与官方 OpenMinis 对照表 |
| `download.html` | 实时信息、直链、加速镜像测速、历史版本下载 |
| `sandbox.html` | Ubuntu PRoot、主机通道、工具链（在线拉取仓库 LINUX.md） |
| `changelog.html` | 全版本更新日志（在线取 GitHub Release 说明与中文发行说明） |
| `notes.html` | 完整中文发行说明（在线取 docs/RELEASE-NOTES.zh.md） |
| `faq.html` | 安装与共存问答 |
| `404.html` | 未找到页 |

## 特性与文件分工

- **固定深色主题**：全站采用单一深色配色（CSS 变量，`color-scheme: dark`），无浅色模式。
- **实时数据**（`js/api.js`）：版本 / 体积 / SHA-256（GitHub 资产 digest）/ 下载直链 / 上下游 Star，本地缓存 + 后台刷新；失败自动回退 `js/config.js` 静态值。
- **多通道动态拉取**（限流 / 被墙也能拿到数据）：
  - 发行列表优先 GitHub API；API 不可用时自动改用仓库内 `docs/RELEASE-NOTES.zh.md`（含全部 tag、正文、versionCode、发布日期、约定直链），页面状态条会标注「备用通道」；全部远程通道失败才回退静态值。
  - 仓库文件（发行说明、LINUX.md）按序回退：`raw.githubusercontent.com` → `ghfast.top` → `gh-proxy.com` → `gcore/fastly/cdn.jsdelivr.net` → 站内本地副本，全部远程通道均带 CORS 头。
  - Star 数在 API 不可用时走 `img.shields.io` 的 JSON 徽章兜底（支持 4.6k 这类缩写）；都取不到时显示「—」而不是 0。
- **直链下载**：下载按钮指向 `…/releases/download/<tag>/<apk>`，点击直接下载安装包，不跳转 Release 页。
- **加速镜像 + 测速**（`js/downloads.js`）：批量 HEAD 探测连通与延迟，按延迟排序并标记最快；镜像清单在 `js/config.js` 的 `mirrors` 数组，失效直接增删。
- **历史版本 + 更新日志**（`js/history.js`）：在线拉取 GitHub 全部 `*-linux` 发行（tag / 日期 / 体积 / SHA-256 / Release 说明），离线回退 `js/config.js` 的 `history` 站内摘要；1.20-linux 无 APK 资产会专门标注。
- **轻量 Markdown 渲染**（`js/md.js`）：发行说明 / LINUX.md 转 HTML，文本全部转义，不引入第三方库。

## 性能与部署注意

- 字体（Google Fonts）以 `preload` 非阻塞加载并启用 `display=swap`；字体不可达时回退系统字体（PingFang SC / Microsoft YaHei / 等宽字体栈）。
- `js/config.js` 与 `js/api.js` 等在 `</body>` 前按序加载，不阻塞首屏解析。
- 背景噪声为预生成 PNG 图块，避免移动端 `feTurbulence` 滤镜开销。
- 页面缓存版本号统一为 `?v=17`；修改 CSS / JS 后请整体递增。

## 注意

- 未认证 GitHub API 限流 60 次/时/IP；限流时站点自动切换备用通道，本地缓存也可显著降低请求量。
- 第三方加速镜像前缀可用性会漂移，测速结果只代表探测瞬间。
- 1.35.1 / 1.33 / 1.27 只存在于发行说明文档，GitHub 上没有对应发布 tag，不在历史下载列表中；1.36.15 没有独立发行说明章节（内容并入 1.36.16 说明），备用通道下不单独成卡。
- 部署后如需规范 og:url / canonical / sitemap，需补上正式域名后再添加。
