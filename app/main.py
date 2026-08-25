# app/main.py

from app.config import UPLOAD_DIR
from app.routers import upload
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

app = FastAPI(title="Image server", docs_url=None, redoc_url=None, version="0.0.2")
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/server_files", StaticFiles(directory=UPLOAD_DIR), name="server_files")
app.include_router(upload.router)

templetes = Jinja2Templates(directory="app/templates")

@app.get("/")
async def client_page(request: Request):
    return templetes.TemplateResponse(
        request=request,
        name="index.html"
    )
