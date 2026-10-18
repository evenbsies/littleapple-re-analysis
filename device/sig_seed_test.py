"""用解出的种子串派生密钥，验证真实签名"""
import hmac, hashlib, base64, itertools

SEED = b"huasj:fongmi:auth:v1:20260707:ndk"
CK = bytes.fromhex("245a46d69c39d4d0815c5cf02e8dc714af493891f1c50e15f9b4a9abd675335e")
KV = b"hsj-auth-v1"

CASES = [
    ("POST", "/play_auth", "1792257889", "35e1d15ee1709fe20fd16faa632c6f6f",
     "eb8a43861bb7addddd252ca7c024b7b67d1268ef793ac31acd0bd231554a1566",
     "e8844522de385c3e5db1b4dca45690c2ae04871a8c0a1e25cb40cb29eb99e31d"),
    ("POST", "/device_trial", "1792257891", "82471525393e0530caf7a8c9f8acdb86",
     "400007304119194a672a49a1889ed70f5f2c714ba2a2493cf928788f47e52352",
     "95687a5926a95bfc6dd827861f72f1b76328ff819e975a9b0ec73ad4fef5639f"),
]

def sha(b): return hashlib.sha256(b).digest()

# 密钥候选
keys = {
    "seed_raw": SEED,
    "sha256(seed)": sha(SEED),
    "hmac(cK,seed)": hmac.new(CK, SEED, hashlib.sha256).digest(),
    "hmac(seed,cK)": hmac.new(SEED, CK, hashlib.sha256).digest(),
    "sha256(cK|seed)": sha(CK + SEED),
    "sha256(seed|cK)": sha(SEED + CK),
    "seed_kv": SEED + b":" + KV,
    "sha256(seed|kv)": sha(SEED + KV),
}
# PBKDF2 / HKDF 变体
for it in (1, 1000, 10000):
    keys["pbkdf2(seed,cK,%d)" % it] = hashlib.pbkdf2_hmac("sha256", SEED, CK, it)
    keys["pbkdf2(cK,seed,%d)" % it] = hashlib.pbkdf2_hmac("sha256", CK, SEED, it)

def hkdf(ikm, salt, info, n=32):
    prk = hmac.new(salt, ikm, hashlib.sha256).digest()
    t = b""
    okm = b""
    i = 1
    while len(okm) < n:
        t = hmac.new(prk, t + info + bytes([i]), hashlib.sha256).digest()
        okm += t
        i += 1
    return okm[:n]

keys["hkdf(cK,seed,seed)"] = hkdf(CK, SEED, SEED)
keys["hkdf(seed,cK,seed)"] = hkdf(SEED, CK, SEED)
keys["hkdf(seed,seed,'')"] = hkdf(SEED, SEED, b"")

def msgs(c):
    m, p, t, n, b = c[0], c[1], c[2], c[3], c[4]
    out = {}
    for nm, sep in [("NL", "\n"), ("E", ""), ("C", ":"), ("A", "&"), ("P", "|")]:
        out["5" + nm] = sep.join([m, p, t, n, b])
        out["4" + nm] = sep.join([p, t, n, b])
        out["kv5" + nm] = sep.join([KV.decode(), m, p, t, n, b])
        out["5upper" + nm] = sep.join([m.upper(), p.upper(), t, n, b])
    out["req"] = "%s %s\n%s\n%s\n%s" % (m, p, t, n, b)
    return out

found = []
for kn, k in keys.items():
    for ci, c in enumerate(CASES):
        for mn, msg in msgs(c).items():
            if hmac.new(k, msg.encode(), hashlib.sha256).hexdigest() == c[5]:
                found.append((kn, mn, msg, ci))
            elif sha(k + msg.encode()).hex() == c[5]:
                found.append(("SHA256(k|m)" + kn, mn, msg, ci))

print("密钥候选:", len(keys))
if found:
    for f in found:
        print("\n*** 命中 ***")
        print("  key:", f[0])
        print("  msg:", f[1], repr(f[2]))
        print("  case:", f[3])
else:
    print("未命中；密钥可能还混入了设备令牌/派生自其它常量")
