#!/usr/bin/env python3
"""Minimal stdio MCP client for jadx-headless-mcp.

Usage:
  python jadx_client.py <apk> <tool> [json-args]
  python jadx_client.py <apk> --batch <spec.json>

spec.json: [{"tool": "...", "args": {...}}, ...]
Output: one JSON object per tool call, written to stdout as `### <tool>\n<result-json>`.
"""
import json
import os
import subprocess
import sys
import threading

JAR = os.environ.get("REA_JADX_MCP_JAR", r"D:\REA\android\jadx-headless-mcp-0.7.1-all.jar")
JAVA = os.environ.get("JAVA_BIN", r"C:\Program Files\Java\jdk-17\bin\java.exe")


class Mcp:
    def __init__(self, jar=JAR):
        self.proc = subprocess.Popen(
            [JAVA, "-jar", jar],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1,
        )
        self.next_id = 0
        self.lock = threading.Lock()

    def _send(self, obj):
        self.proc.stdin.write(json.dumps(obj) + "\n")
        self.proc.stdin.flush()

    def _read_until(self, want_id, timeout=600):
        while True:
            line = self.proc.stdout.readline()
            if not line:
                raise RuntimeError("MCP server closed stdout (id=%s)" % want_id)
            line = line.strip()
            if not line.startswith("{"):
                continue
            try:
                msg = json.loads(line)
            except Exception:
                continue
            if msg.get("id") == want_id:
                return msg

    def initialize(self):
        self.next_id += 1
        self._send({
            "jsonrpc": "2.0", "id": self.next_id, "method": "initialize",
            "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                       "clientInfo": {"name": "local-client", "version": "1"}},
        })
        self._read_until(self.next_id)
        self._send({"jsonrpc": "2.0", "method": "notifications/initialized", "params": {}})

    def call(self, tool, args, timeout=900):
        with self.lock:
            self.next_id += 1
            mid = self.next_id
            self._send({"jsonrpc": "2.0", "id": mid, "method": "tools/call",
                        "params": {"name": tool, "arguments": args}})
            return self._read_until(mid, timeout)

    def close(self):
        try:
            self.proc.stdin.close()
        except Exception:
            pass
        try:
            self.proc.terminate()
        except Exception:
            pass


def text_of(msg):
    """Flatten MCP tool result content into plain text."""
    if "error" in msg:
        return "ERROR: " + json.dumps(msg["error"], ensure_ascii=False)
    res = msg.get("result", {})
    parts = []
    for c in res.get("content", []) or []:
        if c.get("type") == "text":
            parts.append(c.get("text", ""))
        else:
            parts.append(json.dumps(c, ensure_ascii=False))
    if not parts:
        parts.append(json.dumps(res, ensure_ascii=False))
    return "\n".join(parts)


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    apk = sys.argv[1]

    if sys.argv[2] == "--batch":
        with open(sys.argv[3], "r", encoding="utf-8") as f:
            steps = json.load(f)
    else:
        tool = sys.argv[2]
        args = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
        steps = [{"tool": tool, "args": args}]

    m = Mcp()
    try:
        m.initialize()
        print("### load_apk")
        print(text_of(m.call("load_apk", {"path": apk}, timeout=1800)))
        for step in steps:
            t = step["tool"]
            a = step.get("args", {})
            if "path" not in a and t != "status":
                a = dict(a)
            print("### " + t)
            print(text_of(m.call(t, a)))
    finally:
        m.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
