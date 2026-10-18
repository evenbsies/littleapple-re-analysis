"""在 .rodata 里找高熵常量（候选密钥），并用真实抓包验证 HMAC。"""
import re
import hmac
import hashlib
import itertools
from elftools.elf.elffile import ELFFile

SO = r"D:\REA\LittleApple-extract\lib\arm64-v8a\libhsjtv.so"
elf = ELFFile(open(SO, "rb"))

# 真实样本
S = {
    "method": "POST",
    "path": "/api.php/fongmi/play_auth",
    "ts": "1792256979",
    "nonce": "4d9f51c5c681f4434c456f7897a2de86",
    "body": "87c7ba8add9c4bdd1fd5d1676c4cad09466d4739f6b6e3f737b1a0908d039776",
    "sig": "21de1917ee5af5602f7596818356d0e58afa33e17678558791f56a242af09d68",
    "host": "la.9box.store",
    "url": "https://la.9box.store/api.php/fongmi/play_auth",
    "kv": "hsj-auth-v1",
}

# 1) 收集 .rodata 里熵较高的 16/24/32/48/64 字节块
cands = []
for sec in elf.iter_sections():
    if sec.name not in ('.rodata', '.data', '.data.rel.ro'):
        continue
    data = sec.data()
    for size in (16, 24, 32, 48, 64):
        for off in range(0, len(data) - size, 8):
            blob = data[off:off + size]
            # 至少 12 种不同字节才算"高熵"
            if len(set(blob)) < 12:
                continue
            # 排除明显是文本的
            if sum(1 for b in blob if 32 <= b < 127) > size * 0.85:
                continue
            cands.append((sec.name, off, blob))

print("候选密钥块数量:", len(cands))

# 2) 消息拼接方案（按反汇编提示，用 \n 分隔；也覆盖常见变体）
orders = [
    ("method", "path", "ts", "nonce", "body"),
    ("method", "path", "nonce", "ts", "body"),
    ("path", "ts", "nonce", "body"),
    ("method", "path", "ts", "nonce", "body", "kv"),
    ("method", "path", "body", "ts", "nonce"),
    ("ts", "nonce", "body"),
    ("method", "path", "ts", "nonce"),
]
seps = ["\n", "", ":", "&", "|", "\r\n", "\n\n"]

def build(order, sep, use_host=False, upper=False):
    vals = []
    for k in order:
        v = S[k]
        if upper:
            v = v.upper()
        vals.append(v)
    msg = sep.join(vals)
    if use_host:
        msg = S["host"] + sep + msg
    return msg

hit = None
tried = 0
for (sec, off, blob) in cands:
    keys = [blob, blob.hex().encode()]
    for key in keys:
        for order in orders:
            for sep in seps:
                for use_host in (False, True):
                    msg = build(order, sep, use_host)
                    tried += 1
                    d = hmac.new(key, msg.encode(), hashlib.sha256).hexdigest()
                    if d == S["sig"]:
                        hit = (sec, off, blob.hex(), order, repr(sep), use_host, msg)
                        break
                if hit:
                    break
            if hit:
                break
        if hit:
            break
    if hit:
        break

print("尝试次数:", tried)
if hit:
    print("\n*** 命中 ***")
    print("段/偏移: %s +0x%x" % (hit[0], hit[1]))
    print("密钥(hex):", hit[2])
    print("字段顺序:", hit[3], "分隔符:", hit[4], "含host:", hit[5])
    print("消息:", repr(hit[6]))
else:
    print("未命中：密钥可能是派生值而非静态常量")
