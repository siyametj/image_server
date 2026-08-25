# ImageDrop

A lightweight local image upload server built with **FastAPI**.

ImageDrop lets devices on the same local network upload images directly to a Linux machine through a simple web UI.

## Features

- 📤 Upload multiple images
- 🖼️ JPG, JPEG, PNG, WEBP, and GIF support
- 🔍 Image validation with Pillow
- 📁 Saves images to `~/Pictures/server`
- 🌐 Local network access
- 🗑️ Delete uploaded images through the API
- ⚡ FastAPI backend with a web interface

## Project Structure

```text
image_server/
├── app/
│   ├── config.py
│   ├── main.py
│   ├── routers/
│   │   └── upload.py
│   ├── static/
│   │   ├── script.js
│   │   └── style.css
│   └── templates/
│       └── index.html
├── requirements.txt
└── README.md
```

## Setup

Create and activate the virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

## Run

Start the server:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Then open:

```text
http://localhost:8000
```

For another device on the same Wi-Fi/LAN, use the Linux machine's local IP:

```text
http://YOUR_LOCAL_IP:8000
```

Example:

```text
http://192.168.0.103:8000
```

## API

### Upload images

```http
POST /api/upload
```

Accepts multiple image files using the `files` field.

### List uploaded images

```http
GET /api/images
```

### Delete an image

```http
DELETE /api/delete/{filename}
```

## Storage

Uploaded images are stored in:

```text
~/Pictures/server
```

The directory is created automatically when the application starts.

## Tech Stack

- Python
- FastAPI
- Uvicorn
- Pillow
- Jinja2
- HTML / CSS / JavaScript

## Note

This project is intended for local network use. It is not designed as a public internet-facing file upload service.
