"""解析 signRequest 里的 ADRP+ADD 常量引用，dump 出它用到的字符串"""
from elftools.elf.elffile import ELFFile
from capstone import Cs, CS_ARCH_ARM64, CS_MODE_LITTLE_ENDIAN

SO = r"D:\REA\LittleApple-extract\lib\arm64-v8a\libhsjtv.so"
TARGET = "Java_com_fongmi_android_tv_auth_NativeAuth_signRequest"

f = open(SO, "rb")
elf = ELFFile(f)

# 建立 vaddr -> file offset 映射
segs = []
for seg in elf.iter_segments():
    if seg.header.p_type == "PT_LOAD":
        segs.append((seg.header.p_vaddr, seg.header.p_vaddr + seg.header.p_filesz,
                     seg.header.p_offset, seg.data()))

def read_at(vaddr, n=64):
    for va, vend, off, data in segs:
        if va <= vaddr < vend:
            o = vaddr - va
            return data[o:o + n]
    return None

sym = None
for sec in elf.iter_sections():
    if sec.header.sh_type == "SHT_DYNSYM":
        for s in sec.iter_symbols():
            if s.name == TARGET:
                sym = s
                break

addr = sym["st_value"]
size = sym["st_size"]
code = read_at(addr, size)

md = Cs(CS_ARCH_ARM64, CS_MODE_LITTLE_ENDIAN)
md.detail = True

insns = list(md.disasm(code, addr))
print("指令数:", len(insns))

# 两遍：先收集 adrp，再配对 add
adrp_map = {}
refs = []
for ins in insns:
    if ins.mnemonic == "adrp":
        try:
            reg = ins.operands[0].reg
            imm = ins.operands[1].imm
            adrp_map[reg] = imm
        except Exception:
            pass
    elif ins.mnemonic == "add" and len(ins.operands) == 3:
        try:
            if ins.operands[2].type == 2:  # immediate
                dst = ins.operands[0].reg
                src = ins.operands[1].reg
                imm = ins.operands[2].imm
                if src in adrp_map:
                    refs.append((ins.address, adrp_map[src] + imm))
        except Exception:
            pass

print("\n=== 常量引用 ===")
seen = set()
for ins_addr, target in refs:
    if target in seen:
        continue
    seen.add(target)
    raw = read_at(target, 80)
    if raw is None:
        continue
    # 可打印字符串
    txt = ""
    for b in raw:
        if b == 0:
            break
        if 32 <= b < 127 or b >= 0x80:
            txt += chr(b)
        else:
            txt = ""
            break
    if len(txt) >= 2:
        print("0x%x -> 0x%x  %r" % (ins_addr, target, txt))
    else:
        print("0x%x -> 0x%x  <binary> %s" % (ins_addr, target, raw[:16].hex()))
