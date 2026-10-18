#!/usr/bin/env python3
"""Generic frida runner: spawn pkg, load <script>, capture messages for N seconds."""
import sys
import time
import frida

PKG = "com.LittleAppleTVBox.tv"
REMOTE = "127.0.0.1:27042"
HERE = r"D:\REA\device"

duration = int(sys.argv[1]) if len(sys.argv) > 1 else 30
script_path = sys.argv[2] if len(sys.argv) > 2 else HERE + r"\hook_la.js"
out_path = sys.argv[3] if len(sys.argv) > 3 else HERE + r"\capture.log"

log_fh = open(out_path, "w", encoding="utf-8", buffering=1)


def emit(line):
    print(line, flush=True)
    log_fh.write(str(line) + "\n")


def on_message(message, data):
    try:
        if message.get("type") == "send":
            emit(message.get("payload"))
        elif message.get("type") == "log":
            emit("[log] " + str(message.get("payload")))
        elif message.get("type") == "error":
            emit("[error] " + str(message.get("description")))
            if message.get("stack"):
                emit(message["stack"])
        else:
            emit(str(message)[:800])
    except Exception as e:
        emit("[emit-error] %s" % e)


def main():
    device = frida.get_device_manager().add_remote_device(REMOTE)
    emit("device: %s" % device)
    pid = device.spawn([PKG])
    emit("spawned pid=%s" % pid)
    session = device.attach(pid)
    emit("attached")
    session.on("detached", lambda *a: emit("[detached] %s" % (a,)))
    with open(script_path, "r", encoding="utf-8") as f:
        source = f.read()
    script = session.create_script(source)
    script.on("message", on_message)
    script.load()
    emit("script loaded (%s)" % script_path)
    device.resume(pid)
    emit("resumed, capturing %ss" % duration)
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
