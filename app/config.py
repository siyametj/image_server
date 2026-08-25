# app/config.py

from pathlib import Path

UPLOAD_DIR = Path.home() / "Pictures" / "server"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
}


