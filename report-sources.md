# 小苹果影视盒子 TV 2.0.3 — 片源接口与资源解析逻辑

分析对象: `D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk` (SHA-256 `75abb007…9d8ebad`)
证据来源: REA jadx-headless-mcp 0.7.1 方法体反编译（各表标注）+ DEX/SO 字符串扫描（非 REA 证据，已标注）。
关联文档: `D:\REA\report.md`（权限 + 会员扣费链）。

---

## 0. 一图总览

```
la.haotv.store/api.php/fongmi 配置
        │  (G2.j HSQ/HSJ 通道)
        ▼
bean.H (Site) 列表  ── api/h()/c()/type…   ┌─ 第三方 jar (spider 字段指 URL) ──┐
        │                                  │  F2.b.P(): 下载+校验+DexClassLoader
        │  N2.p (内容仓库, ExecutorService) │  loadClass("com.github.catvod.spider.<n>")
        ▼                                  ▼
   ┌── h5.c = SpiderLoader (单例 f9798n) ──┐
   │  A(key, api, ext, jar): Spider 工厂   │
   │  ├─ "csp_*"  → F2.b jar 引擎 (R8保留) │
   │  ├─ "*.py"   → 反射 q.f5885l.spider() │  ← Python 引擎(混淆类 q)
   │  └─ "*.js"   → 永远 SpiderNull(死代码) │
   └───────────────────────────────────────┘
        │  com.github.catvod.crawler.Spider (18 个标准方法)
        ▼
原始 JSON ── bean.F.g(type, json) 解析 ──► bean.F (Result)
        │                                   ├─ List<bean.Q>  vod 列表
        │                                   └─ LinkedHashMap<flag, List<bean.u>>  vod_play_url
        ▼
HomeActivity / VodActivity(a3.d) / VideoActivity / CollectActivity / 搜索(a3.a, N2.c…)
        │ VideoActivity: spider.playerContent(flag,id,vipFlags) → playUrl
        ▼
播放器 (ExoPlayer/media3 + 国产播放内核) ― 播放 URL:
   ├─ 直链 http/https (macCMS-type 片源, 6677/7777 之外的)
   ├─ 直播 P2P: http://127.0.0.1:%s/stream/live?uuid=%s&server=%s&group=5850&mac=…&dir=%s
   └─ HSJ 原生流: http://127.0.0.1:6677/stream/open?uuid=…  (libjpa.so = com.p2p.P2PClass P2P SDK)
```

---

## 1. 片源（Site）数据结构与接口

**bean.H**（= Site, Parcelable 单例内列）— 18 个字段（REA 类摘要）:

| 混淆名 | 语义（依据 N2.p/播放调用推断） |
|---|---|
| `f7800i..f7805o`, `p` (6×String) | key / name / api(c()) / ext(h()) / jar / categories 等 |
| `f7806q..f7811v` (6×Integer) | type(w()) / timeout / playerType / flags 等 |
| `f7812w` List\<String\> | categories 分类表 |
| `f7813x` Gson JsonElement | headers/ CodecConfig? (k() = Request Headers) |
| `f7814y` bean.I | 扩展参数 (extend bean) |
| `f7815z` boolean | quick/searchable |

关键方法（REA 方法体）：
- `H.Q()` → `F2.a.f1580a.A(o(), c(), h(), n())` = **取 Spider 实例**（F2.a 是静态壳，真实加载器 = h5.c，R8 水平合并特征：h5.c 方法数 50）。
- `H.C()` → `F2.a.f1580a.H(o(), c(), n())` = 刷新/重载站点（换 jar/换 ext 时用）。

**爬虫标准接口** `com.github.catvod.crawler.Spider`（R8 keep，18 方法全列，evidence `out-spider-Spider.UTF-8 (1)`）:
`init(Context[,String extend]) / action(String) / homeContent(boolean filter) / homeVideoContent() / categoryContent(tid,pg,filter,extend) / detailContent(ids[]) / searchContent(key,quick[,pg]) / playerContent(flag,id,vipFlags[]) / liveContent(String) / proxy(Map) / proxyLocal(boolean) / localProxy(Map) / manualVideoCheck() / safeDns() / client() / destroy() / isVideoFormat(url) / isPlaylistFormat(url)` — 生态标准 + 少量扩展；`SpiderDebug.log(site, rawJson)` 会记录每个 spider 的原始返回（见提交链 §5）。

---

## 2. Spider 三引擎工厂 — h5.c（去混淆细节）

### 2.1 h5.c.A(key, api, ext, jar) — Spider 工厂（REA 方法体）

按片源 api 字段分派三引擎，全部返回值缓存进 ConcurrentHashMap：

```
api 含 ".py"  → Python 引擎:
    缓存: q.f5884k (CHA keyed by key)
    miss: 反射 q.f5885l.getClass().getMethod("spider", Context.class, String.class)
          .invoke(f5885l, App.f7733o, api)   ← 运行时单例对象,引擎本体在混淆类 q
          → spider.init(App.f7733o, ext)
api 含 ".js"  → JS 伪引擎:
    A3.c.f162k CHA; miss → 直接填"SpiderNull"(永不实例化真正的 js spider)
    ⇒ ★ 该构建中 JS 爬虫未实现:配置里有 .js 片源只会得到空壳
api startsWith "csp_" → 在线 jar 引擎:
    dir = com.github.catvod.utils.d.d(jar)   (jar URL 哈希)
    F2.b.f1583l: dir → DexClassLoader (未就绪则 F2.b.P(dir,jar) 先建)
    = DexClassLoader.loadClass("com.github.catvod.spider." + api.split("csp_")[1])
      .newInstance() → init(App, ext)
    理论上支持任意包名的 jar 片源；三级缓存: f1583l(每 jar 的 classloader) / f1585n(key→Spider)
都不是 → new SpiderNull()
```

观察:
- dex 中 **零 quickjs 相关字符串**、`.js` 分支只返回 SpiderNull ⇒ 之前假设的"QuickJS 生态"在 2.0.3 中不存在（更正前次上下文记录）；片源生态 = Java jar + Web 参数 HTTP + Python 三路。
- `com.bumptech.glide.c.I(jar)` 这类被借用/合并的类出现在 F2.b — R8 水平类合并典型痕迹（多类并一），h5.c/A3.c/F2.b 的"杂种构造器"同源。

### 2.2 在线 jar 引擎 — F2.b.P(dir, jarUrl)（REA 方法体）

```
synchronized void P(dir, jarUrl):
  CHA f1583l 命中即返回 (幂等)
  glide.c.I(jarUrl) 拆装 jar 描述对象 c   (c.c = 校验值字段)
  file = cacheDir / md5(jarUrl.trim()) + ".jar"   ← com.github.catvod.utils.b.n() 缓存目录
  K(file, c.c) 校验失败 → A(cVarI, file) 重下载
  K(file, c.c) 通过后 → H(file, dir)   (填充 DexClassLoader CHA f1583l)
```
jar 载体: **HTTP 明文/HTTPS 均可行**（usesCleartextTraffic=true）+ MD5 完整性校验（jar 描述自带的 `c` 字段做基准 — MD5 非防篡改），classloader 就地缓存。

---

## 3. Web 参数型片源（type ≤ 2, macCMS 风格 API）— N2.p 仓库

`N2.p` = 内容仓库 (4 个 LiveData: f3577d/f3578e/f3579f/g + ExecutorService + O2.s), 8 方法全还原:

### 3.1 N2.p.d(site, params, quick) — 通用请求
- site **ext** 字段以 http 开头 → GET ext 并 `site.K(body)` 缓存（分类/筛选器的 JSON extend 描述）
- quick 模式下 extend 超 1000 字节裁剪 (param `extend` 只带 1000 字节)
- 拼 GET (strH ≤1000) 或 **POST FormBody** (extend >1000) → `i3.b` OkHttp 封装; 返回原始 body 字符串

### 3.2 首页/分类请求参数（macCMS 协议）
- `ac=videolist` (type 0) / `ac=detail` (type 1) / `ac=list/videolist? t=<id>&pg=<pg>` 分类; `wd=<搜索词>&pg=`, `quick=true`
- 首页 homeContent: spider 三引擎可直接返回分类+列表

### 3.3 N2.p.e(site, result) — 二次补齐（防止 macCMS 首页"只有列表无详情"）
```
site.type ≤ 2 且列表第一个 vod 无详情 (vod.A().length() ≤ 0):
  ids = 逗号连 id; 再发一包 ac=videolist(type0)/ac=detail(type1)
  F.g(type, resp).w() → vodId→Q map; 按顺序合入原 result
```
⇒ ** degradation 顺序**: 单请求偷懒、不够 → 双请求补齐（fongmi fork 的适配策略）。

### 3.4 搜索 — N2.p.g(site, wd, quick)
```
spider: searchContent(encode(wd), quick)  (含日志 SpiderDebug.log)
web:    params wd / quick → d() → F.g(type, resp)
```
后者分页走 `N2.p.h(site, wd, pg)`（偶合 `searchContent(.., false, pg)`）。
`a3.a / N2.c / CollectActivity` 同为 N2.p 的消费者（收藏页/搜索页）。

---

## 4. 播放链（解析完成的资源）

1. VodActivity(a3.d, 内部 N2.l Callable [+HashMap headers, 情景: video headers]) — 详情内容 `spider.detailContent(ids)`；VideoActivity (N2.m/N2.n Callables + h5.c 回调对象) 拉 detail/play
2. 详情 JSON → `bean.F`（=Result）: 21 字段（evidence 类摘要）:
   - `List<bean.Q>` vod 列表; `LinkedHashMap<String, List<bean.u>>` **flag → 集数列表 (vod_play_url)**
   - `List<bean.f>` 分类筛选器; `bean.q/bean.O` 附助手; 多个 String/Integer (header/jump url/parse 标志)
3. 选集 → a3.d `d0(String,String,bean.I,HashMap,boolean)` builder → VideoActivity → `spider.playerContent(flag, id, vipFlags[])` → F.playUrl(+headers+parse 标志)（引 N2.m/N2.n 与 a3.d 类摘要推导；单方法体返回 native/abstract，因此此处为类级证据）
4. 解析标志: spider 返回体/`parse` 字段决定直接播放 vs 交 WebParser/嗅探器，**dex 内无 parse=1/嗅探（sniffer）字符串** — 本构建依赖 spider 自己吐直链；外部解析仅 parse.html 输入框流程（手机投屏用）。
5. **直播/特殊流**:
   - 直播 P2P 地址模板 (DEX 字符串, 非 REA): `http://127.0.0.1:%s/stream/live?uuid=%s&server=%s&group=5850&mac=00:00:00:00:00:00&dir=%s` — tvbus:// P2P 出流转 HLS
   - HSJ 原生流出口 (绑定 VIP 通道链, 上一篇报告 §3.5): `http://127.0.0.1:6677/stream/open?uuid=…`
   - 宋口 nanohttpd: `http://127.0.0.1:7777`（proxy/push/localweb）
   - **libjpa.so** = P2P 解码栈（SO 字符串扫描, 非 REA）: `Java_com_p2p_P2PClass_*` 29 符号 — `doxstart/doxadd/dolgetpercent/XGFilmOpenFile/ReadFile/…`（XGFilm 商用 P2P SDK）；Java 侧包装类保留原名 `com.p2p.P2PClass` + `com.p2p.R*`
   - 视频解码/渲染栈: libavcodec / libavutil / libswscale / libswresample / librtmp-jni (rtmp 直链), media3 ext

---

## 5. 安全性/隐私观察

| # | 项目 | 结论 |
|---|---|---|
| S1 | **在线 jar = 远程代码执行面** | csp_* 片源由 `la.haotv.store` 下发的 jar 通过 DexClassLoader 加载并 `newInstance()` — 服务器或下发通道被劫持 → 应用进程级 RCE；仅用 **MD5**（描述自带）校验，无签名，明文 HTTP 亦可能。 |
| S2 | **JS 片源不可用** | .js 分支静态填 SpiderNull — 生态上比 fongmi 上游少一路。 |
| S3 | **spider 原始输出全量日志** | `SpiderDebug.log(site, rawJson)` 打印每张返回（可能含标题/敏感内容）→ adb/logcat 泄露。 |
| S4 | **extend 请求只保留 1000 字节** | 大体量筛选描述被截断，寫 POST；只影响可用性。 |
| S5 | **P2P 数据面未加密** | 6677 本地流直转 + XGFilm P2P 上行流量（node `group=5850`）有上行带宽占用，无隐私加密。 |
| S6 | **jar 缓存常态化（cache 键 md5(url)）** | 下载后落地 cacheDir，每次启动命中；首次加载失败捕获异常填缓存 — 会**缓存 Null 状态**（适用长时间不重试），可能出现"片源彻底失效"心智。 |
| S7 | **R8 水平合并审计困难** | h5.c(50 方法)/F2.b/A3.c/G2.I 多异种构造器同类 — 静态审计折叠（不是防护，但拆成"假巨型类"）。 |

## 6. 混淆类名对照（本轮新增）

| 混淆名 | 真实角色 |
|---|---|
| h5.c | **SpiderLoader**（Spider 工厂/缓存/h5 全链；R8 水平合并类） |
| F2.a | SpiderLoader 静态壳 `<clinit>` |
| F2.b | 在线 jar 引擎（下载+校验+DexClassLoader） |
| q（顶层包 q.e 为 Map 类型） | Python spider 引擎单例/类型宿主（反射 .spider() 入口） |
| A3.c | js 伪引擎壳（只缓存 SpiderNull） |
| N2.p | **内容仓库** (Repository, LiveData×4 + ExecutorService) |
| N2.l/m/n | **Callables**：detail(带 headers)/列表/搜索（VideoActivity 内部类载体） |
| N2.o | G2.b0 内部 Runnable（live 场景 一步化 post 任务） |
| h5.c (bean 层) | (bean.F trace 中出现的其他 h5.c 引用= 同名合并类) |
| bean.H | Site/片源 bean (18 字段+1 内部类) |
| bean.F | **Result bean** (21 字段, vod 兰play_url map) |
| bean.Q | Vod 条目 |
| bean.u | 集 (episode) |
| a3.d | VodActivity 内容部分 + Product builder |
| G2.b0 | 直播相关 Runnable（bean.D + latch） |
| i3.b | OkHttp 统一封装 |
| com.p2p.P2PClass | XGFilm P2P SDK JNI 入口 (保留原名) |
| com.github.catvod.utils.d / b | 取哈希 / 缓存目录的工具 |

## 7. 证据索引（本轮）

REA jadx 输出（UTF-8 解码后）:
- `D:\REA\os-class-Spider.utf8.txt` / `os-class-SpiderNull/SpiderDebug` — Spider 18 接口与两个实现
- `D:\REA\os-class-h5c*.txt` + `os-m-h5c-A/H/I` — 加载器 h5.c 摘要与 A/H 方法体
- `D:\REA\os-class-F2a`, `os-m-F2a-A` — F2.a 壳（真实目标是 h5.c）
- `D:\REA\os-class-F2b`, `os-m-F2b-P` — jar 引擎 P() 方法体
- `D:\REA\os-class-N2p*` + `os-m-N2p-h/d/e/g` — 仓库 N2.p 全方法体
- `D:\REA\os-trace-N2p`, `os-trace-beanF`, `os-trace-F2a` — 入口/调用方追踪(VideoActivity/a3.d/CollectActivity/HomeActivity)
- `D:\REA\os-class-beanH(2)/beanF-类摘要` — site/Result 字段
- `D:\REA\os-class-q.txt`(未命中 q 顶层)/`os-class-A3c/G2I` — 合并类特征
非 REA 证据（自查字符串）:
- `D:\REA\dex-scan2-play.out2.txt`(6677/7777/P2P模板/DexClassLoader)
- `D:\REA\libjpa-scan.out.txt`(libjpa.so = com.p2p.P2PClass 29 JNI 符号)
- `D:\REA\dex-scan-spider.out.txt`(catvod/spider/quickjs=0)
