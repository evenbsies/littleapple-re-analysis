"""用真实（入参, 签名）对照重新爆破：静态常量 + 派生密钥"""
import hmac, hashlib, base64, json
from elftools.elf.elffile import ELFFile

CASES = [
    {"a1": "POST", "a2": "/play_auth", "a3": "1792257889",
     "a4": "35e1d15ee1709fe20fd16faa632c6f6f",
     "a5": "eb8a43861bb7addddd252ca7c024b7b67d1268ef793ac31acd0bd231554a1566",
     "sig": "e8844522de385c3e5db1b4dca45690c2ae04871a8c0a1e25cb40cb29eb99e31d"},
    {"a1": "POST", "a2": "/device_trial", "a3": "1792257891",
     "a4": "82471525393e0530caf7a8c9f8acdb86",
     "a5": "400007304119194a672a49a1889ed70f5f2c714ba2a2493cf928788f47e52352",
     "sig": "95687a5926a95bfc6dd827861f72f1b76328ff819e975a9b0ec73ad4fef5639f"},
]

CK = bytes.fromhex("245a46d69c39d4d0815c5cf02e8dc714af493891f1c50e15f9b4a9abd675335e")
KV = b"hsj-auth-v1"

# 消息构造方案
def messages(c):
    f = ["a1", "a2", "a3", "a4", "a5"]
    out = {}
    for name, sep in [("NL", "\n"), ("E", ""), ("C", ":"), ("A", "&"), ("P", "|"), ("CRLF", "\r\n")]:
        out["5" + name] = sep.join(c[k] for k in f)
        out["4" + name] = sep.join(c[k] for k in f[1:])
        out["5kv" + name] = sep.join([KV.decode()] + [c[k] for k in f])
        out["kv4" + name] = sep.join([KV.decode()] + [c[k] for k in f[1:]])
    return out

# 密钥源
kcands = {"cryptoKey": CK, "cryptoKey_hex": CK.hex().encode(), "sha256(cK)": hashlib.sha256(CK).digest()}
for salt in (b"hsj-auth-v1", b"sign", b"hsj", b"v1", b"auth", b"hsj-auth-v1.sign"):
    kcands["hmac(cK,%s)" % salt.decode()] = hmac.new(CK, salt, hashlib.sha256).digest()
    kcands["sha256(cK|%s)" % salt.decode()] = hashlib.sha256(CK + salt).digest()

elf = ELFFile(open(r"D:\REA\LittleApple-extract\lib\arm64-v8a\libhsjtv.so", "rb"))
blobs = []
for sec in elf.iter_sections():
    if sec.name not in (".rodata", ".data", ".data.rel.ro"):
        continue
    data = sec.data()
    for size in (16, 24, 32, 48, 64):
        for off in range(0, len(data) - size, 4):
            b = data[off:off + size]
            if len(set(b)) < 12:
                continue
            if sum(1 for x in b if 32 <= x < 127) > size * 0.85:
                continue
            blobs.append(b)

print("静态块:", len(blobs), " 命名密钥:", len(kcands))

found = []

def test(key, keyname, msg, msgs_name, case_idx):
    if hmac.new(key, msg.encode(), hashlib.sha256).hexdigest() == CASES[case_idx]["sig"]:
        found.append((keyname, msgs_name, msg, case_idx))
        return True
    return False

# 1) 命名密钥
for ci in range(len(CASES)):
    for mn, m in messages(CASES[ci]).items():
        for kn, k in kcands.items():
            test(k, kn, m, mn, ci)

# 2) 静态块（用第一个样本）
if not found:
    msgs0 = messages(CASES[0])
    for b in blobs:
        for kn, k in (("blob", b), ("blobhex", b.hex().encode())):
            for mn, m in msgs0.items():
                if test(k, kn + ":" + b[:4].hex(), m, mn, 0):
                    break
            if found:
                break
        if found:
            break

print("\n=== 结果 ===")
if found:
    for f in found[:5]:
        print("*** 命中 ***")
        print("  key来源:", f[0])
        print("  消息构造:", f[1])
        print("  消息明文:", repr(f[2]))
else:
    print("仍未命中")
