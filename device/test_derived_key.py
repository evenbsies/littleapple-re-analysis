"""测试 cryptoKey 的派生方式 + 非 HMAC 的构造（SHA256(key||msg) 等）"""
import hmac
import hashlib
import base64

CK = bytes.fromhex("245a46d69c39d4d0815c5cf02e8dc714af493891f1c50e15f9b4a9abd675335e")
CK_HEX = "245a46d69c39d4d0815c5cf02e8dc714af493891f1c50e15f9b4a9abd675335e"

S = {
    "method": "POST",
    "path": "/api.php/fongmi/play_auth",
    "ts": "1792256979",
    "nonce": "4d9f51c5c681f4434c456f7897a2de86",
    "body": "87c7ba8add9c4bdd1fd5d1676c4cad09466d4739f6b6e3f737b1a0908d039776",
    "sig": "21de1917ee5af5602f7596818356d0e58afa33e17678558791f56a242af09d68",
    "kv": "hsj-auth-v1",
    "host": "la.9box.store",
    "bkv": "hsj-auth-v1.vstc-broker-v1",
    "url": "https://la.9box.store/api.php/fongmi/play_auth",
}

def sha(b):
    return hashlib.sha256(b).digest()

# 1) 密钥候选
salts = [b"", b"hsj-auth-v1", b"sign", b"signRequest", b"hsj", b"auth", b"v1",
         b"hsj-auth-v1.sign", b"hsj-sign", b"HMAC", b"hsign", b"apple"]
kcands = {}
kcands["raw"] = CK
kcands["hex"] = CK_HEX.encode()
kcands["b64"] = base64.b64encode(CK)
kcands["sha256(raw)"] = sha(CK)
for s in salts:
    kcands["hmac(cK,%s)" % s.decode(errors="replace")] = hmac.new(CK, s, hashlib.sha256).digest()
    kcands["sha256(cK||%s)" % s.decode(errors="replace")] = sha(CK + s)
    kcands["sha256(%s||cK)" % s.decode(errors="replace")] = sha(s + CK)
    kcands["hmac(%s,cK)" % s.decode(errors="replace")] = hmac.new(s, CK, hashlib.sha256).digest()

# 2) 消息候选
fields_all = ["method", "path", "ts", "nonce", "body"]
msgs = {}
for sep_name, sep in [("NL", "\n"), ("EMPTY", ""), ("COLON", ":"), ("AMP", "&"), ("PIPE", "|")]:
    msgs["5args%s" % sep_name] = sep.join(S[f] for f in fields_all)
    msgs["4args%s(no-method)" % sep_name] = sep.join(S[f] for f in ["path", "ts", "nonce", "body"])
    msgs["host+5%s" % sep_name] = S["host"] + sep + sep.join(S[f] for f in fields_all)
    msgs["kv+5%s" % sep_name] = S["kv"] + sep + sep.join(S[f] for f in fields_all)
    msgs["url+5%s" % sep_name] = S["url"] + sep + sep.join(S[f] for f in ["ts", "nonce", "body"])
msgs["kvNL"] = "\n".join([S["kv"], S["method"], S["path"], S["ts"], S["nonce"], S["body"]])

hit = None
for kn, k in kcands.items():
    for mn, m in msgs.items():
        mb = m.encode()
        if hmac.new(k, mb, hashlib.sha256).hexdigest() == S["sig"]:
            hit = ("HMAC-SHA256", kn, mn, m)
        elif sha(k + mb).hex() == S["sig"]:
            hit = ("SHA256(key||msg)", kn, mn, m)
        elif sha(mb + k).hex() == S["sig"]:
            hit = ("SHA256(msg||key)", kn, mn, m)
        if hit:
            break
    if hit:
        break

print("密钥候选:", len(kcands), " 消息候选:", len(msgs))
if hit:
    print("\n*** 命中 ***")
    print("算法:", hit[0])
    print("密钥:", hit[1])
    print("消息构造:", hit[2])
    print("消息:", repr(hit[3]))
else:
    print("未命中")
