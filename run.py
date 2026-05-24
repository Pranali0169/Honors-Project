# import subprocess
# import webbrowser
# import time

# # Start FastAPI server
# backend = subprocess.Popen(["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"],cwd="backend")

# # Wait for the server to start
# time.sleep(2)

# # Open the default web browser
# webbrowser.open("http://127.0.0.1:8000")

# # Keep app running until closed manually
# backend.wait()

import subprocess
import time
import threading
import os
import sys
import webbrowser

def resource_path(relative_path):
    """ Get absolute path to resource (for PyInstaller) """
    try:
        base_path = sys._MEIPASS  # for PyInstaller one-file
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# Path to backend directory
backend_dir = resource_path("backend")

# Command to run Uvicorn from backend folder
command = ["uvicorn", "main:app", "--host", "127.0.0.1", "--port", "8000"]

# Set the PYTHONPATH so FastAPI can resolve imports correctly
env = os.environ.copy()
env["PYTHONPATH"] = backend_dir

# Start the server
backend = subprocess.Popen(command, cwd=backend_dir, env=env)

# Wait and open browser
time.sleep(2)
webbrowser.open("http://127.0.0.1:8000")

# Wait for FastAPI to exit
backend.wait()

