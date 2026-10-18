"""把插件里解出的所有明文当作候选盐，测试内容源 sign 的拼装"""
import hashlib
import itertools

DEV = "<your-device-uuid>"
T = "1792256979334"
SIGN = "92438a11e241ea61770f2243276bfd30433b1fac"
PATH = "/api/mw-movie/anonymous/video/searchByWord"
QUERY = "keyword=%E5%AB%81%E9%87%91%E9%92%97&pageNum=1&pageSize=20"
URL = "https://www.hkybqufgh.com" + PATH + "?" + QUERY

def sha1(s):
    return hashlib.sha1(s.encode() if isinstance(s, str) else s).hexdigest()

# 载入插件解密明文（第一列）
salts = []
with open("hsj9_strings.txt", encoding="utf-8", errors="replace") as f:
    for line in f:
        p = line.split("\t")[0].strip()
        if 1 <= len(p) <= 64:
            salts.append(p)
print("候选盐:", len(salts))

bases = {
    "dev+t": DEV + T,
    "t+dev": T + DEV,
    "dev+t+path": DEV + T + PATH,
    "path+dev+t": PATH + DEV + T,
    "url": URL,
}
seps = ["", "&", "|", ":", "\n"]

found = []
# 无盐先试
for bn, b in bases.items():
    if sha1(b) == SIGN:
        found.append(("sha1", bn, b, None))

# 有盐
if not found:
    for salt in salts:
        for bn, b in bases.items():
            for cand in (b + salt, salt + b, b + "&" + salt, salt + "&" + b,
                         b + "|" + salt, b + ":" + salt):
                if sha1(cand) == SIGN:
                    found.append(("sha1+salt", bn, cand, salt))
                    break
            if found:
                break
        if found:
            break

print("\n=== 结果 ===")
if found:
    for f in found:
        print("*** 命中:", f[0])
        print("  基础:", f[1])
        print("  盐  :", repr(f[3]))
        print("  消息:", f[2])
else:
    print("未命中")
