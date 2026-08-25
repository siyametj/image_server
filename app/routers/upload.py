
import io
import os
import shutil
import zipfile
from PIL import Image
from app.config import UPLOAD_DIR, ALLOWED_EXTENSIONS
from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(prefix="/api", tags=["Upload"])

@router.post("/upload")
async def upload_images(files: list[UploadFile] = File(...)):
    saved_files = []
    for file in files:
        if file.content_type not in ALLOWED_EXTENSIONS:
            continue
        try:
            img = Image.open(file.file)
            img.verify()
        except Exception:
            continue

        await file.seek(0)
        target_path = UPLOAD_DIR / file.filename
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_files.append(file.filename)

    return {"status": "success", "count": len(saved_files), "message": f"{len(saved_files)} Photos Saved Successfully! 🚀"}

@router.get("/images")
async def get_images():
    valid_exts = ('.jpg', '.jpeg', '.png', '.webp')
    files = [f for f in os.listdir(UPLOAD_DIR) if os.path.isfile(UPLOAD_DIR / f) and f.lower().endswith(valid_exts)]
    return {"images": files}

@router.delete("/delete/{filename}")
async def delete_image(filename: str):
    file_path = UPLOAD_DIR / filename
    if os.path.exists(file_path):
        os.remove(file_path)
        return {"status": "success", "message": "File deleted"}
    raise HTTPException(status_code=404, detail="File not found")
