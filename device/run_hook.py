#!/usr/bin/env python3
"""Spawn LittleApple TVBox under frida, load hook_la.js, collect messages.

usage: python run_hook.py <duration_seconds> [out.log]
"""
import sys
import time
import threading
import frida

PKG = "com.apple.placeholder"
PKG = "com.LittleAppleTVBox.tv"
REMOTE = "127.0.0.1:27042"
HERE = r"D:\REA\device"

duration = int(sys.argv[1]) if len(sys.argv) > 1 else 60
out_path = sys.argv[2] if len(sys.argv) > 2 else HERE + r"\capture.log"

log_fh = open(out_path, "w", encoding="utf-8", buffering=1)


def emit(line):
    print(line, flush=True)
    log_fh.write(line + "\n")


def on_message(message, data):
    if message.get("type") == "send":
        emit("[send] " + str(message.get("payload")))
    elif message.get("type") == "error":
        emit("[error] " + str(message.get("description")))
        st = message.get("stack")
        if st:
            emit(st)
    else:
        emit("[" + str(message.get("type")) + "] " + str(message)[:500])


def main():
    device = frida.get_device_manager().add_remote_device(REMOTE)
    emit("device: %s" % device)

    pid = device.spawn([PKG])
    emit("spawned pid=%s" % pid)

    session = device.attach(pid)
    with open(HERE + r"\hook_la.js", "r", encoding="utf-8") as f:
        source = f.read()
    script = session.create_script(source)
    script.on("message", on_message)
    script.load()
    emit("script loaded")

    device.resume(pid)
    emit("resumed, capturing %ss ..." % duration)

    try:
        time.sleep(duration)
    except KeyboardInterrupt:
        pass

    try:
        session.detach()
    except Exception as e:
        emit("detach error: %s" % e)
    emit("=== done ===")
    log_fh.close()


if __name__ == "__main__":
    main()
