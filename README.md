# LittleAppleTVBox 2.0.3 安全评估与逆向工具归档

对制品 `LittleAppleTVBox-TV-2.0.3-universal.apk`（FongMi TVBox 深度定制分支 + 自研 native 授权层）的授权前安全研究归档。

**先读 [DISCLAIMER.md](DISCLAIMER.md)**（用途边界与法规提示）。

## 核心文档

| 文档 | 内容 |
|---|---|
| `小苹果-安全评估报告.md` | 9 项发现、严重度定级、修复路线图（面向开发者的成品评估） |
| `小苹果-分析报告.md` | 12 节取证细节：制品身份、授权协议、插件解密、签名破解、内容链路（含证据分级） |

## 关键结论

- 四层客户端防护（字符串混淆 / 请求体 AES-GCM / HMAC 请求签名 / native 化）数小时内逐层还原，无反分析阻力。
- **F1（高）**：响应签名校验因头名不匹配恒失败且静默放行，响应完整性保护实际不存在。
- **F2（高）**：HMAC 种子单字节 XOR 硬编码于 native 库，单字节爆破即还原，离线签名 6/6 复现。
- 真正的防线在服务端：播控决策（`can_play`）、内容分级（`needLogin` 逐档标注）、VSTC 能力令牌均不下放客户端——架构判断正确。
- 完整发现清单与修复建议见安全评估报告第 4、6 节。

## 工具清单（`device/`）

| 工具 | 用途 |
|---|---|
| `sign_request.js` | 离线构造完整授权请求（HMAC 签名 + AES-GCM 加密体），6/6 自检 |
| `content_client.js` | 内容源客户端（搜索/详情/播放地址，离线签名） |
| `decrypt_hsj.js`（根目录） | 插件字符串解密器（AES-256-GCM，XOR 密钥还原，959 条解密） |
| `dem244.py` | 密文→明文映射批量还原 jadx 输出源码 |
| `dump_refs.py` | ARM64 ADRP+ADD 常量引用提取（挖 native 种子串用） |
| `frida_attach.py` + `hook4.js` | attach 模式运行时抓包（规避 houdini + spawn 的 SIGSEGV） |
| `probe_auth.js` / `verify_*.js` | 授权接口探测与签名/响应校验验证 |
| `jadx_client.py`（根目录） | jadx-headless-mcp 批量调用客户端 |

## 方法学要点

1. **frida 在 x86_64 模拟器 + ARM 转译层的兼容性**：spawn 必崩（houdini 转译 ARM64 so 时段错误），需正常启动后按 PID attach。
2. **混淆字面量的正确还原路径**：先破解解密函数拿到密文→明文全表，再正则替换反编译输出中的解密调用，而不是逐条猜。
3. **native 常量提取**：对目标函数反汇编并解析 ADRP+ADD 对，精准列出被引用的字符串常量（含混淆态），优于全文件字符串扫描。

## 脱敏说明

- 报告与脚本中的研究者设备标识（UUID/令牌/指纹）已替换为占位符。
- `prefs.xml`、`play_auth_plain.json`、抓包日志等含个人凭据的文件不在版本历史中。
- 第三方接口地址与签名常量作为评估证据保留（见 DISCLAIMER 边界声明）。

*分析环境：MuMu 模拟器（Android 15 / x86_64 / KernelSU）· frida-server 16.7.4 · jadx-headless-mcp 0.7.1*
