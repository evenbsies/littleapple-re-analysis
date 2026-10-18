#!/usr/bin/env python3
"""Attach-mode frida runner: app must already be running.

usage: python frida_attach.py <script> <duration> [out.log] [pkg]
"""
import sys
import time
import frida

REMOTE = "127.0.0.1:27042"
PKG = sys.argv[4] if len(sys.argv) > 4 else "com.LittleAppleTVBox.tv"
script_path = sys.argv[1]
duration = int(sys.argv[2])
out_path = sys.argv[3]

log_fh = open(out_path, "w", encoding="utf-8", buffering=1)


def emit(o):
    import json
    line = json.dumps(o, ensure_ascii=False) if not isinstance(o, str) else o
    print(line, flush=True)
    log_fh.write(line + "\n")


def on_message(message, data):
    if message.get("type") == "send":
        emit(message.get("payload"))
    elif message.get("type") == "log":
        emit("[log] " + str(message.get("payload")))
    elif message.get("type") == "error":
        emit({"t": "script-error", "desc": message.get("description"), "stack": message.get("stack")})
    else:
        emit(str(message)[:500])


def main():
    device = frida.get_device_manager().add_remote_device(REMOTE)
    target = PKG
    try:
        target = int(PKG)
    except ValueError:
        pass
    try:
        session = device.attach(target)
    except Exception as e:
        emit({"t": "attach-failed", "e": str(e)})
        return 1
    emit({"t": "attached", "pkg": PKG})
    session.on("detached", lambda *a: emit({"t": "detached", "reason": str(a[0]) if a else ""}))
    with open(script_path, "r", encoding="utf-8") as f:
        source = f.read()
    script = session.create_script(source)
    script.on("message", on_message)
    script.load()
    emit({"t": "loaded"})
    try:
        time.sleep(duration)
    except KeyboardInterrupt:
        pass
    try:
        session.detach()
    except Exception as e:
        emit({"t": "detach-err", "e": str(e)})
    emit({"t": "done"})
    log_fh.close()


if __name__ == "__main__":
    sys.exit(main())
