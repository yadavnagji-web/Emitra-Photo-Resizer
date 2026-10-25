"""
Main Entry Point for Photo & Signature Resizer
Starts local server and opens user's browser automatically.
"""

import sys
import os
import time
import threading
import webbrowser
import multiprocessing
import uvicorn

# Prevent NoneType stdout/stderr crashes in windowed mode
if sys.stdout is None:
    sys.stdout = open(os.devnull, "w")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w")

multiprocessing.freeze_support()

# Ensure the project directory is on sys.path
if getattr(sys, "frozen", False):
    PROJECT_DIR = getattr(sys, "_MEIPASS", os.path.dirname(sys.executable))
else:
    PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))

if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from server import app

HOST = "127.0.0.1"
PORT = 8000
APP_URL = f"http://{HOST}:{PORT}"


def free_port(port: int):
    """Kills any previous instance occupying the port to avoid [WinError 10048]."""
    try:
        import subprocess
        res = subprocess.run(
            ["netstat", "-ano"],
            capture_output=True,
            text=True
        )
        my_pid = str(os.getpid())
        pids_to_kill = set()
        for line in res.stdout.splitlines():
            if f":{port}" in line and "LISTENING" in line:
                parts = line.strip().split()
                if len(parts) >= 5:
                    pid = parts[-1]
                    if pid != my_pid and pid != "0":
                        pids_to_kill.add(pid)
        for pid in pids_to_kill:
            subprocess.run(["taskkill", "/F", "/PID", pid], capture_output=True)
            time.sleep(0.2)
    except Exception:
        pass


def open_browser():
    """Wait for server to bind and open browser."""
    time.sleep(1.2)
    print(f"\n[Tool] Browser khol rahe hain: {APP_URL}")
    webbrowser.open(APP_URL)


def main():
    print("=" * 60)
    print("   PHOTO & SIGNATURE RESIZER")
    print("   (Pure Algorithmic • 100% Offline • Zero AI)")
    print("=" * 60)
    
    # Free port 8000 from any old stuck instances
    free_port(PORT)

    print(f"[OK] Server URL: {APP_URL}")
    print("[TIP] Is window ko band na karein jab tak aap kaam kar rahe hain.")
    print("=" * 60)

    # Launch browser in a background thread
    threading.Thread(target=open_browser, daemon=True).start()

    # Start FastAPI server
    config = uvicorn.Config(app, host=HOST, port=PORT, log_level="warning")
    server = uvicorn.Server(config)
    server.run()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        import traceback
        log_path = os.path.join(PROJECT_DIR, "error_log.txt")
        with open(log_path, "a", encoding="utf-8") as f:
            traceback.print_exc(file=f)
