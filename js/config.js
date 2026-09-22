/* 站点配置：静态回退值 + 加速镜像清单（可自行增删镜像前缀）+ 历史版本站内摘要 */
window.SITE_CONFIG = {
  repo: "tall-1997/OpenMinis-Linux",
  upstream: "OpenMinis/OpenMinis",
  tag: "1.36.21-linux",
  rollingTag: "android-latest",
  apk: "minis-ultra-com.openminis.linux.apk",
  versionCode: 74,
  fallback: {
    version: "1.36.21-linux",
    size: 0, // 0 = 未知
    sha256: "", // 未知时显示 —；GitHub API 未公开 digest 时无法提供
    starsFork: null, // null = 未知，显示 —（在线时由 API 或 shields.io 兜底）
    starsUp: null,
    updated: ""
  },
  /* 加速镜像前缀：最终链接 = prefix + 直连下载地址
     直连地址: https://github.com/tall-1997/OpenMinis-Linux/releases/download/<tag>/<apk> */
  mirrors: [
    { name: "GitHub 直连", prefix: "" },
    { name: "ghfast.top", prefix: "https://ghfast.top/" },
    { name: "gh-proxy.com", prefix: "https://gh-proxy.com/" },
    { name: "ghproxy.net", prefix: "https://ghproxy.net/" },
    { name: "ghps.cc", prefix: "https://ghps.cc/" },
    { name: "github.moeyy.xyz", prefix: "https://github.moeyy.xyz/" },
    { name: "gh.ddlc.top", prefix: "https://gh.ddlc.top/" },
    { name: "ghproxy.link", prefix: "https://ghproxy.link/" },
    { name: "gh.llkk.cc", prefix: "https://gh.llkk.cc/" }
  ],
  /* 历史版本站内摘要（离线回退用；在线时优先 GitHub API，限流时用仓库发行说明）。
     noApk=true 表示该版本没有任何 APK 资产（1.20-linux）。 */
  history: [
    { tag: "1.36.21-linux", code: 74, log: "输入框焦点收敛：打开会话清焦收键盘，仅助手确实流式输出且未滚走时回焦；人格提示词导入按正文/文件名去重与覆盖确认，内置 SOUL.md 不可删；并行子代理独立卡片与芯片、单个失败不连坐；execute_code 的 Rhino 1.7.14 兼容修复。" },
    { tag: "1.36.20-linux", code: 73, log: "设置→权限新增工具模式（询问/全部允许/只读/计划/全部拒绝），与系统权限分两层；文件工具做会话与项目隔离，拒绝跨会话/跨项目路径；客户机 CA 证书权限、subject hash 与 SSL_CERT_FILE 持久化。" },
    { tag: "1.36.19-linux", code: 72, log: "minis-dev-setup 拆轻量版（约 30 秒必需包）与完整版（可选），加 5 分钟超时与 SIGTERM 优雅退出；每次 overlay 注入 Android CA；minis-mirror auto 用 /dev/tcp 快筛不依赖 curl；apt 锁串行；开机种子包；minis-open 默认应用内预览。" },
    { tag: "1.36.18-linux", code: 71, log: "修沙箱引导：Android 系统 CA 写入客户机，apt/网络引导修复。详见 GitHub Release 页面说明。" },
    { tag: "1.36.17-linux", code: 70, log: "工作区收敛：启动时把已归档会话遗留在私有目录的共享文件搬进项目工作区；移出/解散分组拷回私有目录且不删项目树；自动归档同步搬文件；会话列表 FAB 收敛为新建文件夹。" },
    { tag: "1.36.16-linux", code: 69, log: "Termux 终端换 terminal-view:0.118.0，去掉自研 emulator；提供商置顶与一键并行刷新（Provider 库 v5）；镜像自愈与包世界（启动 minis-mirror auto、重置后只装缺失包）；时区 symlink 修复；技能 requirements.json；仓库移除 src/ios。" },
    { tag: "1.36.14-linux", code: 67, log: "项目工作区：一个文件夹多会话共享 workspace/附件/浏览器缓存，日记仍按会话隔离；主页 FAB 新建工作区会话；1.36.13 之前旧会话归入默认工作区；AI 过程折叠条精简；HttpBody passthrough 支持 JSON/multipart/原始字节，密钥不进沙箱。" },
    { tag: "1.36.13-linux", code: 66, log: "一会话一工作区：每个会话独立 workspace/memory/附件/浏览器缓存，技能与 MCP 配置装在工作区外；删会话清工作区目录；内置人格重写并强制覆盖一次；移除人格扩展入口。" },
    { tag: "1.36.12-linux", code: 65, log: "检查更新不再卡死：没给安装权限时先落盘再跳设置，返回后继续安装流程；磁盘已有完整且大小匹配的 APK 不再重复下载；生命周期去重，防多次恢复弹多个安装界面。" },
    { tag: "1.36.11-linux", code: 64, log: "已有会话人格纠偏：系统提示注明旧回复可能旧人设，按供应商注入 <persona-binding>；AI 过程折叠改为增量收起（思考/工具一完成即收进摘要）；子代理顶栏芯片可看实时日志，结束后输出 Trace/Report。" },
    { tag: "1.36.10-linux", code: 63, log: "人格提示词不再撑长设置页：主页只显示当前文件名，二级页编辑正文；可导入 .md/.txt 人格文件；按供应商绑定人格，未绑定跟随默认。" },
    { tag: "1.36.9-linux", code: 62, log: "AI 过程折叠真正生效（修复 1.36.8 开关失效原因）；release 构建保留 Rhino execute_code（ProGuard keep）；ModelsApi 共用 OkHttpClient 连接池。" },
    { tag: "1.36.8-linux", code: 61, log: "看门狗改单调时钟 elapsedRealtime，API 35 解冻重置；无障碍 offload 轮询改事件等待；流式刷新抽出 StreamSessionController 并附节流单测；5xx 用 Regex 识别。" },
    { tag: "1.36.7-linux", code: 60, log: "agentTools 列表与 provider 实例记忆化（此前每次访问全量重建工具定义与连接池）；会话列表 updated_at 索引（Room 15→16，含降级迁移）。" },
    { tag: "1.36.6-linux", code: 59, log: "聊天生成图片：generate_image 接真正的生图接口，图片落气泡附件；厂商专用协议按 Base URL Host 分流；豆包/火山方舟原生生图生视频接口。" },
    { tag: "1.36.5-linux", code: 58, log: "浏览器地址栏/UA/设置移到底栏，默认高度 80%；检查更新在滚动包正文过短时从同版本 tag 补说明；网页搜索支持自定义引擎（{query}/{key}）。" },
    { tag: "1.36.4-linux", code: 57, log: "聊天生成视频：纯视频模型（Sora/Veo/Kling 等）发消息即出片，文本会话可 generate_video 调用；模型详情加视频输出开关；OpenAI 兼容 POST /videos。" },
    { tag: "1.36.3-linux", code: 56, log: "热修发消息崩溃：限流闸门改用 channelFlow，避免 Flow invariant is violated。429 分桶与模型组回退不变。" },
    { tag: "1.36.2-linux", code: 55, log: "429 分类不再把额度不足等当瞬时限流连打；按桶限流；仅会话选中模型组时才按组回退。" },
    { tag: "1.36.1-linux", code: 54, log: "缺参模型默认值真正生效（256k 上下文 / 128k 输出 / 思考 max / 文本）；步进器 − / 数字 / + 中间可输入，确定时按 min/max 夹紧。" },
    { tag: "1.36-linux", code: 53, log: "models.dev 归一化匹配（去厂商前缀、统一大小写、./_→-）；DataLearner 补洞；中转站脏名按字重合；未知 id 默认 256k 上下文 / 128k 输出 / 思考 max / 文本。" },
    { tag: "1.35-linux", code: 51, log: "审批卡片与聊天内横幅新增「本会话全部允许」；人格扩展入口；协作角色可编辑；工具限额并入多智能体页。" },
    { tag: "1.34.1-linux", code: 50, log: "去除提示词模板 / 工作区规则保存时的注入措辞过滤（删除 PromptSafetyFilter）；工作区规则不再写入系统提示词。" },
    { tag: "1.34-linux", code: 49, log: "会话提示词模板（按会话热切换）；工具限额（Shell 超时 / file_read 字符行数 / 子代理轮次）；工作区规则文件库；SecurityGate 拦截红条与 ASK 对话内审批卡。" },
    { tag: "1.32.1-linux", code: 47, log: "热修：Room 升到数据格式 14 后启动守卫仍写 12 导致二次启动误报「数据来自更新的版本」；本版守卫对齐 14，会话不用清。" },
    { tag: "1.32-linux", code: 46, log: "cronjob 定时任务（AlarmManager 一次性/间隔）；插件市场（MCP 预设 + 在线 OpenAPI，SSRF 校验，密钥不进模型上下文）；spawn_agent 九种协作角色。" },
    { tag: "1.31-linux", log: "数据库升级 Room 14（code_symbols / code_edges、kanban_tasks）。" },
    { tag: "1.30.2-linux", code: 44, log: "内嵌浏览器顶部横条跟手拖拽（上拖全屏、下拖回收）；设置页「进化」开关显示当前状态。" },
    { tag: "1.30.1-linux", code: 43, log: "检查更新下载：四节点并行探测选最快（github 直连 + 三个镜像兑底）、后台下载 + 断点续传（Range + sha256 验证）、旧安装包自动清理。" },
    { tag: "1.30-linux", code: 42, log: "步进器可直接输入数值（越界置灰）；子代理轮次上限改为说明文案；提问卡片按钮不再被遮挡。" },
    { tag: "1.29-linux", code: 41, log: "修复：explore / plan 只读白名单加入 grep_source，只读侦察类子代理恢复可用。" },
    { tag: "1.28-linux", code: 40, log: "子代理失败重试韧性：有界重试循环（退避 2s→5s 带抖动）、重试轮换池内端点、重试次数可调（1–5 默认 3）、失败不连坐兄弟任务。" },
    { tag: "1.26-linux", code: 38, log: "spawn_agent 一次 tasks[] 并行派出 explore / plan / worker / general-purpose；结果按「子代理 i/N」汇总；顶层 prompt 仍可单任务。" },
    { tag: "1.25-linux", log: "原生 Kotlin 进化层（默认关）：纠正 / 闲时收割 / 技能补丁走提案审批写入 LEARNED.md；信念衰减与合并；按会话场景注入 [backend]/[workflow]/[writing]。" },
    { tag: "1.24-linux", log: "修复子代理压力测试 Scudo OOM 闪退：markdown / ContentDiag 不再对整段超长文本跑 ICU Matcher.reset；日日志 8MB 封顶。" },
    { tag: "1.23-linux", log: "子代理各自独立 PersistentShell 通道（真并行）；设置 → 多智能体按并发上限生成「子代理 N」选模型；恢复 WebApp 钉到主屏；BrowserUse SameSite=None 自动 Secure；HostEventHooks 同步落盘。" },
    { tag: "1.22-linux", log: "子代理轮次可配置（默认 12，1–48）；Android 14+ 广播补 RECEIVER_NOT_EXPORTED；机内自构建 TMPDIR 兜底与 aapt2 override；沙箱代理 netlog 轮转；电池迟滞、通知序号、同版本重传不再提示升级。" },
    { tag: "1.21-linux", log: "结构化子 Agent 任务书（Task / Expected result / Constraints / Workflow / Collaboration）并禁止嵌套 run_subagent；计划讨论 AUTO 跳过闲聊；外观可关浮动工具栏 / 完成工具卡 / 子代理芯片；修复 1.20 CI libunwind 链接。" },
    { tag: "1.20-linux", noApk: true, log: "跨会话检索（search_sessions / read_session）；子 Agent kind=worker|explore|plan 与 write_paths；系统默认助手入口；主屏新建对话小组件；browser_use 跟系统 WebView；crash_handler 链接 libunwind。注意：此版本未发布 APK 资产。" },
    { tag: "1.19-linux", log: "主机反向事件通道；动态通知按钮；任务级模型改道；沙箱长任务保活；http_proxy 流量日志 / 一键切断（无 VpnService）；新设备 WebDAV 恢复向导；机内自编译入口；aarch64 一键脚本。" },
    { tag: "1.17-linux", log: "早期稳定版。Agent + PRoot 沙箱与 Ubuntu 客户机的骨干部署。详见 GitHub Release 页面说明。" },
    { tag: "v1.14-linux", log: "早期版本。详见 GitHub Release 页面说明。" }
  ]
};