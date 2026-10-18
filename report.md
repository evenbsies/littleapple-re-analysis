# 小苹果影视盒子 TV 2.0.3 — 权限清单 + 会员扣费调用链报告

> 配套文档: `D:\REA\report-sources.md` — 片源接口（Spider 三引擎）与资源解析逻辑。

分析对象: `D:\immodel\uncensored\DeepSeek-R1\LittleAppleTVBox-TV-2.0.3-universal.apk`
APK SHA-256: `75abb007a92b4217397744283c3313f572a8b381fc179de46419245889d8ebad`
证据来源: REA jadx-headless-mcp 0.7.1 (SHA `6e5eacf5…3ff75`, 与 REA 锁定值一致) — 详细见各 evidence_id
方法: 静态反编译 + DEX class_def 表解析 + DEX/SO 字符串表扫描（字符串扫描为普通非 REA 证据,已在文中标注）

---

## 1. 权限清单 (AndroidManifest.xml, 共 16 项 uses-permission)

| 权限 | 风险等级 | 用途推断 |
|---|---|---|
| android.permission.INTERNET | 普通 | 采源/播放/API (核心) |
| android.permission.RECORD_AUDIO | ⚠ 危险 | 麦克风 — 可能用于 DLNA/投屏检测或语音功能, manifest 声明使用 microphone feature |
| android.permission.ACCESS_FINE_LOCATION | ⚠ 危险+运行时 | 精确定位 |
| android.permission.ACCESS_COARSE_LOCATION | ⚠ 危险+运行时 | 粗定位 |
| android.permission.READ_EXTERNAL_STORAGE | ⚠ 危险+运行时 | 读外部存储 |
| android.permission.WRITE_EXTERNAL_STORAGE | ⚠ 危险+运行时 | 写外部存储 (targetSdk 28 + requestLegacyExternalStorage=true, 完全绕开 11+ 限制 → 真实读写权) |
| android.permission.REQUEST_INSTALL_PACKAGES | ⚠ 高危 (应用内静默装包能力) | 可引导安装 APK — 配合 queries 中 4 个 IDM 下载管理器包名 (下载后安装更新) |
| android.permission.USE_BIOMETRIC / USE_FINGERPRINT | 普通 | 生物识别 (可能用于"会员登录/解锁"入口) |
| android.permission.RECEIVE_BOOT_COMPLETED | ⚠ | 开机自启 (BootReceiver, priority=999) |
| android.permission.FOREGROUND_SERVICE | 普通 | 后台常驻 (DLNA 渲染服务 DLNARendererService) |
| android.permission.ACCESS_WIFI_STATE / ACCESS_NETWORK_STATE | 普通 | 网络状态 |
| android.permission.CHANGE_WIFI_MULTICAST_STATE | 普通 | 组播 — DLNA 发现 (cling) |
| android.permission.WAKE_LOCK | 普通 | 播放保持唤醒 |
| com.LittleAppleTVBox.tv.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION | 自签名 | AndroidX dynamic receiver 内部权限 |

敏感配置: `usesCleartextTraffic=true` (允许HTTP明文), `requestLegacyExternalStorage=true`, `largeHeap=true`。
未声明: SMS/日历/相机/联系人/通话类权限 — 无过度索取。

导出组件 (3 类, 均有明确入口): HomeActivity(LAUNCHER+LEANBACK_LAUNCHER, 支持 http/https/rtmp/rtsp/magnet/ed2k/thunder 等全部 scheme 的深链),
ActionReceiver(仅非导出...实际声明 exported=false), ProfileInstallReceiver(exported=true, 仅 androidx profile 操作)。

## 2. 会员扣费调用链

## 2. 会员扣费调用链

### 2.1 总体架构（三层）

```
UI 层 (混淆, 含 renamed MembershipDialog)
   │  发起 /membership_order_create 等请求, 弹出 alipay 二维码 (qr.alipay.com / qr_payload)
   ▼
API 客户端层 G2.j  (OkHttp)
   │  Bearer token + X-Device-Token; 响应头 X-HSJ-Timestamp/Nonce/Signature 强制验签 (NativeAuth.verifyResponse)
   ▼
Broker 层 f3.h  (VSTC = Live Streaming Broker)
   │  POST {broker}/vstc-broker + X-VSTC-Key-Version/Timestamp/Nonce/Body-SHA256/Signature (NativeAuth.signBrokerRequest)
   │  端点: /v1/channel/start, /v1/channel/switch, /device_trial
   ▼
原生层 libhsjtv.so  (JNI: Java_com_fongmi_android_tv_auth_NativeAuth_*)
     cryptoKey() 密钥 + sign/verify 全部在原生实现, 签名算法不可从 Java 层获取
```

### 2.2 已经反编译出的关键方法证据

| 方法 | 作用 | 关键细节 |
|---|---|---|
| G2.j.a(String,String)→Headers | 构造常规鉴权头 | Authorization: Bearer <la_token>; X-Device-Token |
| G2.j.L(String,Headers)→boolean | 响应头验签 | X-HSJ-Timestamp + X-HSJ-Nonce + X-HSJ-Signature 三头强制齐全；NativeAuth.verifyResponse(body, ts, nonce, sig)；失败抛 IOException("响应签名校验失败") |
| G2.j.z(...)→Request 应答 | 同步执行+备份域校验 | 备用 BaseURL 必须也通过认证，否则 "备用认证响应未认证" |
| G2.j.I(JSONObject) | 响应码校验 | code ∈ {0,1,200} |
| G2.j.J(JSONObject) | **会员订单解析** | 校验 order_no 格式 [A-Za-z0-9]{12,32}、payment_state(A0.m.B 枚举)、fulfillment_state(A0.m.A 枚举)、poll_after_seconds∈[2,30]、plan_code/plan_name/duration_days>0/amount_minor>0/currency=="CNY"；异常消息与 MembershipOrder.PaymentState/.FulfillmentState 字符串吻合 |
| G2.j.e(boolean)→JSONObject | **设备免费试用** | POST /device_trial；trial_android_hash = SHA256(android_id)（拒绝全0/广为非人的 9774d56d682e549c）；claim=0/1；package_name=com.LittleAppleTVBox.tv；调用方 G2.T.run / G2.U.run（后台线程, G2.X 调度） |
| G2.j.K(Response, needQr, orderNo, planCode, planVersion, clientRequestId) | **订单创建/校验解析** | 解析 data.order → J() 校验；回显绑定校验（order_no / plan_code / plan_version / client_request_id 逐项与请求比对，防串单）；payment_state=="PENDING" 时要求非空 qr_payload（"支付二维码返回为空"） |
| A0.a.c(i=f45i switch) | **全部会员 API 回调统一分发** | 4=data.orders[] 逐单 J()（订单历史）; 5=data.redemption+data.entitlement（充值卡兑换）; 6=简单确认; 7=G2.j.r()（订单状态轮询）; 8=data.trial 且响应必须已验签（"试用响应未认证"）; 9=data.user（会员状态）; 10=data.device/device_status 必须已验签（设备验证）; 11=data.plans（套餐列表）; 12=试用播放响应必须已验签; default=data.user+token（登录） |
| f3.h.l(path,JSONObject,P,async)→f3.g | Broker 请求签名构造 | Base URL 仅接受 path=/api.php/fongmi 的公网 HTTPS 主机 → 换 path /vstc-broker；头 X-VSTC-Key-Version=NativeAuth.brokerKeyVersion()、X-VSTC-Timestamp、X-VSTC-Nonce(16B 随机)、X-VSTC-Body-SHA256、X-VSTC-Signature=NativeAuth.signBrokerRequest("POST", path, ts, nonce, sha)；白名单 path 数组另外带 X-VSTC-Capability (缓存键 auth_vstc_capability) |
| f3.h.q(f3.a,channelId,f3.m,stats,P)→String | **频道租约下发（会员兑现点）** | 校验频道快照 (f3.a.a()-有效性, 绑定 device_uuid)；拼 op_ 串（path\nuuid\nchannel\nsnapshot\nsnapsha\nprevNative\nprevLease）→ operation_id=op_+前32hex；POST /v1/channel/start（带 current_lease_id 时为 /v1/channel/switch，并上报 previous_statistics）；防回放校验 operation_id/switched_from/native_id/snapshot_id/catalog_binding 回显 |
| f3.h.r(JSONObject,nativeId,snapshotId)→String | **BRK 启动材料验签** | schema_version==2；expires_at 经 E5.m.a 校验 (≤86400s, 边界300s)；startup_b64 / brk_b64 ≤256KB 双 SHA256 校验（对 snapshot_sha256 兼容）；peer_blob_format 必须 "brk-zlib-des-v1"（zlib+DES Peer 包, application/vnd.brk）；startup JSON 必含 tvbus://（CatVod TVBus 协议）、device_uuid 绑定、identity{user_id/peer_id/session_key(16hex)/fingerprint(64hex)}、worker{api_version∈{1,2},required_abi==1}；native_lease 必须 "vstc-lease-v1" 且 ≤8192B |
| f3.h.f(maxSize,b64,label)→byte[] | 启动材料解码 | Base64.decode(11) + 大小上限 262144 |
| f3.h.j(String,byte[])→JSONObject | 响应 JSON 解析 | UTF-8；异常→A0.e |
| f3.h.t(JSONObject,k,v) | 字段等值检查工具 | |
| G2.m.a(byte[],byte[],int)→byte[] | 流式加解密工具 | SecureRandom + MediaType (application/octet-stream) — 实际对称运算在 native |

### 2.3 订单状态机（依据 G2.j.J + 字符串表）

- 支付状态枚举 (原名 MembershipOrder.PaymentState, 现 `A0.m.B`) + 履约状态 (MembershipOrder.FulfillmentState, 现 `A0.m.A`)：服务端字符串驱动, App 不感知具体名称（防篡改）。
- 成功订单含: order_no, plan_code, plan_name, duration_days, amount_minor (分), currency=CNY, qr.alipay.com 二维码字段 qr_payload。
- 表明套餐以 CNY 计费、支持支付宝扫码, 服务端轮询支付状态 (poll_after_seconds 2–30s)。

### 2.4 与会员权限相关的存储键 (字符串表证据, 非 REA)

auth_private / auth_pending_membership_order / auth_pending_membership_redemption / auth_token / device_token / entry_token / media_entry_token / auth_vstc_capability / vstc_capability_expires_at / is_vip / pay_enabled / payment_enabled / device_trial_enabled / trial_allowed / catalog_snapshot_expired / SUBSCRIPTION_REQUIRED / SUBSCRIPTION_EXPIRED / VIP_REQUIRED
配置后端: https://la.haotv.store/api.php/fongmi (broker 唯一合法 BaseURL path); /vlp 备用; s1.xpgtv.net*.store 域名。

### 2.5 UI 层（扣费入口）

- 混淆原类名: MembershipDialog（仅 `Lcom/fongmi/android/tv/ui/dialog/MembershipDialog$1;` 残留在 DEX class_def 表中, 顶层类被改名）— 会员购买/充值卡/套餐展示对话框。
- 弹出支付二维码: 响应 payment_state=PENDING 时取 order.qr_payload（内容为 qr.alipay.com 支付链接）渲染。
- 无植入扣费通道: 客户端不走任何支付 SDK, 金额/订单均在服务端生成, 客户端仅展示二维码+轮询。
- e3.k = 直播频道租约消费端: e3.k.i(channelId, f3.m 旧租约, stats) → f3.h.q → BRK 材料字符串, 交由原生 worker (libhsjtv/libjpa, tvbus:// P2P) 启动播放。

### 2.6 会话/设备绑定 (E5.m / f3.a)

- E5.m.q() = 账号 token (Bearer), E5.m.w() = 设备 token (X-Device-Token), E5.m.I() = 待确认解绑状态 (非空则拒绝任何 Broker 请求 "设备解绑正在等待确认")。
- 设备会话对象 G2.P.f1715l (布尔) — "Broker 设备会话未认证" 门槛。
- 频道快照对象 f3.a: f9415b=snapshot_id, c=catalog_binding, f9416d=catalog_snapshot_sha256, f9418f=设备 uuid 绑定, a()=有效性 (过期抛 "频道快照已失效")。
- 时限校验 E5.m.a(expires_at, now, 86400, 300): 授权最长 86400s(24h), 提前 300s 视为临界。

### 2.7 API 端点总表

| 端点 | 鉴权 | 用途 |
|---|---|---|
| POST {broker}/vstc-broker/v1/channel/start | Authorization Bearer + X-Device-Token + X-VSTC-* 签名 | 直播频道租约（会员权限兑现点） |
| POST {broker}/vstc-broker/v1/channel/switch | 同上+current_lease_id | 换台（防回放: operation_id/switched_from） |
| POST /device_trial | 公开(无 token 有 X-Device-Token) | android_id SHA256 免费试用领取/查询 |
| POST /login /logout | - | 账号登录/登出 (返回 data.user+token) |
| POST /membership_plans | Bearer | 会员套餐列表 (data.plans) |
| POST /membership_order_create | Bearer | 创建订单 (data.order: order_no/payment_state=PENDING+qr_payload/plan_code/plan_version/amount_minor/currency=CNY/duration_days/poll_after_seconds) |
| POST /membership_order_status | Bearer | 轮询订单支付状态 |
| POST /membership_order_history | Bearer | 订单历史 (data.orders[]) |
| POST /membership_card_redeem | Bearer | 充值卡兑换 (data.redemption+data.entitlement) |
| /user (推断, data.user) | Bearer | 会员状态 (is_vip/订阅到期) |
| media / media_entry_token / m3u8 / m3u8key / obj (字符串表) | entry_token | 点播媒体入口 |

### 2.8 关键安全观察

1. 所有响应强制 HSJ 三头验签(X-HSJ-Timestamp/Nonce/Signature), 缺一或校验失败即拒绝 → 不可中间人放量。
2. 会员/试用/设备敏感响应 (case 8/10/12) 额外要求 verified 标志 → 明文/未签名响应即使 code 合法也拒绝。
3. 支付不落客户端: 订单创建仅 PENDING+二维码, 金额由服务端 (amount_minor, currency=CNY) 定死, 客户端无入口篡改; 回显绑定校验 (order_no/plan_code/plan_version/client_request_id) 防串单。
4. 频道启动材料 (BRK) 链式校验: SHA256×3 摘要、设备 uuid、频道 id、lease 回放；内容加密 "brk-zlib-des-v1" (zlib + DES) + 24h lease, 对称/签名运算在 libhsjtv.so。
5. 防回放: operation_id = "op_" + 请求串 SHA256 前 32 hex, 响应必须回显一致。
6. 单点风险: libhsjtv.so (JNI NativeAuth 密钥与全部协议密码学) — 突破点在原生层而非 Java。





## 附录 · 证据索引
- ev_f1c99…: inspect_android_package (manifest 完整解码, 16 权限, 6417 jadx 类 / 7742 DEX class_def / 1493 资源)
- ev_f933…: search auth (14 matches, 唯一保留原名: NativeAuth)
- ev_89a4…: NativeAuth 类摘要 (9 方法全 `static native`, libhsjtv.so JNI 实现)
- out-trace-NativeAuth: NativeAuth 调用方 3 个: G2.j, G2.m, f3.h
- ev_0fc9…: G2.j 摘要 (39 方法, OkHttp 客户端层)
- trace G2.j.J ← A0.a.c + G2.j.K; trace G2.j.e ← G2.T.run/G2.U.run; trace f3.h.q ← e3.k.i
- 方法体全部在 ev_* 附件 out-m-*.utf8.txt (body_status=available, mode=java)
- 字符串表/类定义表扫描 (普通证据, 非 REA): dex-scan-vip.out.txt, dex-classdefs.txt, dex-regions-decoded.txt, so-scan-vip.out.txt (libhsjtv.so JNI 符号)
