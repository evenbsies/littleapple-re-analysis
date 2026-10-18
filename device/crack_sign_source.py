"""反推内容源签名 sign（40 hex = SHA1）"""
import hashlib
import itertools

DEV = "<your-device-uuid>"
T = "1792256979334"
SIGN = "92438a11e241ea61770f2243276bfd30433b1fac"
PATH = "/api/mw-movie/anonymous/video/searchByWord"
QUERY = "keyword=%E5%AB%81%E9%87%91%E9%92%97&pageNum=1&pageSize=20"
URL = "https://www.hkybqufgh.com" + PATH + "?" + QUERY

secrets = [
    "", "mw-movie", "mwmovie", "anonymous", "huasj", "fongmi", "hsj", "hsj-auth-v1",
    "huasj:fongmi:auth:v1:20260707:ndk", "123456", "sign", "key", "secret",
    "a1b2c3", "mw", "movie", "apple", "littleapple", "xpgtv",
]

def sha1(s):
    if isinstance(s, str):
        s = s.encode()
    return hashlib.sha1(s).hexdigest()

def md5(s):
    if isinstance(s, str):
        s = s.encode()
    return hashlib.md5(s).hexdigest()

parts = {
    "dev": DEV, "t": T, "path": PATH, "query": QUERY, "url": URL,
    "pathq": PATH + "?" + QUERY,
}

found = []
seps = ["", "&", "|", ":", "\n", "-", "_"]

# 1) 无盐：两/三/四元组合
keys = list(parts.keys())
for r in (2, 3, 4):
    for combo in itertools.permutations(keys, r):
        for sep in seps:
            msg = sep.join(parts[k] for k in combo)
            if sha1(msg) == SIGN:
                found.append(("sha1", combo, repr(sep), msg))
            if sha1(msg.upper()) == SIGN:
                found.append(("sha1-upper", combo, repr(sep), msg))

# 2) 带盐
if not found:
    for salt in secrets:
        for r in (2, 3):
            for combo in itertools.permutations(keys, r):
                for sep in seps:
                    base = sep.join(parts[k] for k in combo)
                    for cand in (base + salt, salt + base, base + sep + salt, salt + sep + base):
                        if sha1(cand) == SIGN:
                            found.append(("sha1+salt(%r)" % salt, combo, repr(sep), cand))

# 3) md5 再 sha1 / 大写
if not found:
    for combo in itertools.permutations(keys, 3):
        base = "&".join(parts[k] for k in combo)
        if sha1(md5(base)) == SIGN:
            found.append(("sha1(md5)", combo, "&", base))

print("尝试完毕")
if found:
    for f in found[:5]:
        print("\n*** 命中:", f[0])
        print("  字段顺序:", f[1], " 分隔符:", f[2])
        print("  消息:", f[3])
else:
    print("未命中：可能含服务端下发的密钥，或签名覆盖了更多内容")
