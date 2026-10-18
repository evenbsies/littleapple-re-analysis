"""反汇编 libhsjtv.so 的 signRequest，并列出外部依赖。"""
import sys
from elftools.elf.elffile import ELFFile
from capstone import Cs, CS_ARCH_ARM64, CS_MODE_LITTLE_ENDIAN

SO = r"D:\REA\LittleApple-extract\lib\arm64-v8a\libhsjtv.so"
TARGET = "Java_com_fongmi_android_tv_auth_NativeAuth_signRequest"

f = open(SO, "rb")
elf = ELFFile(f)

# 依赖库
needed = []
for sec in elf.iter_sections():
    if sec.header.sh_type == 'SHT_DYNAMIC':
        for tag in sec.iter_tags():
            if tag.entry.d_tag == 'DT_NEEDED':
                needed.append(tag.needed)
print("DT_NEEDED:", needed)

# 未定义符号（导入）
imports = []
for sec in elf.iter_sections():
    if sec.header.sh_type == 'SHT_DYNSYM':
        for s in sec.iter_symbols():
            if s.name and s['st_shndx'] == 'SHN_UNDEF':
                imports.append(s.name)
crypto_like = [n for n in imports if any(k in n.lower() for k in
               ('hmac', 'sha', 'evp', 'cipher', 'digest', 'aes', 'gcm', 'mbedtls', 'ssl'))]
print("导入符号里与加密相关的:", crypto_like[:20])
print("导入总数:", len(imports))

# 定位目标符号
sym = None
for sec in elf.iter_sections():
    if sec.header.sh_type == 'SHT_DYNSYM':
        for s in sec.iter_symbols():
            if s.name == TARGET:
                sym = s
                break
if sym is None:
    print("符号未找到")
    sys.exit(1)

addr = sym['st_value']
size = sym['st_size']
print("\n目标符号: %s  addr=0x%x  size=%d" % (TARGET, addr, size))

# 找到所在段并取出字节
code = None
base = 0
for seg in elf.iter_segments():
    if seg.header.p_type == 'PT_LOAD':
        if seg.header.p_vaddr <= addr < seg.header.p_vaddr + seg.header.p_filesz:
            off = addr - seg.header.p_vaddr
            code = seg.data()[off:off + (size or 512)]
            base = addr
            break

if code is None:
    print("未能在 PT_LOAD 中定位")
    sys.exit(1)

md = Cs(CS_ARCH_ARM64, CS_MODE_LITTLE_ENDIAN)
md.detail = True

print("\n=== 反汇编前 160 条 ===")
n = 0
for ins in md.disasm(code, base):
    extra = ""
    if ins.mnemonic in ('bl', 'b', 'blr', 'br'):
        extra = "   <-- 分支"
    print("0x%x:  %-8s %s%s" % (ins.address, ins.mnemonic, ins.op_str, extra))
    n += 1
    if n >= 160:
        break
