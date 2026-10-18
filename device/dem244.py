"""把 jadx 输出里的 a2.m244("<密文>") 替换成明文，得到可读源码"""
import re
import sys

table = {}
with open(r"D:\REA\device\hsj9_strings.txt", encoding="utf-8", errors="replace") as f:
    for line in f:
        parts = line.rstrip("\n").split("\t")
        if len(parts) >= 2:
            table[parts[1]] = parts[0]

print("映射表条目:", len(table))

src = open(sys.argv[1], encoding="utf-8", errors="replace").read()

hit = 0
miss = 0


def repl(m):
    global hit, miss
    enc = m.group(1)
    if enc in table:
        hit += 1
        return '"' + table[enc].replace('\\', '\\\\').replace('"', '\\"') + '"'
    miss += 1
    return 'm244(?' + enc[:12] + ')'


out = re.sub(r'a2\.m244\("([^"]+)"\)', repl, src)
out = re.sub(r'\bm244\("([^"]+)"\)', repl, out)

open(sys.argv[2], "w", encoding="utf-8").write(out)
print("替换成功 %d 处，未命中 %d 处" % (hit, miss))
print("输出:", sys.argv[2])
