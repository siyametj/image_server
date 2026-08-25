let selectedFilesArray = [];

const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const browseBtn = document.getElementById("browseBtn");

const previewContainer = document.getElementById("previewContainer");
const previewGrid = document.getElementById("previewGrid");

const selectedCount = document.getElementById("selectedCount");
const fileCount = document.getElementById("fileCount");
const totalSize = document.getElementById("totalSize");

const clearAllBtn = document.getElementById("clearAllBtn");

const uploadBtn = document.getElementById("uploadBtn");

const status = document.getElementById("status");

const progressArea = document.getElementById("progressArea");
const progressBar = document.getElementById("progressBar");
const progressPercent = document.getElementById("progressPercent");


/* =========================
   FILE SIZE
========================= */

function formatFileSize(bytes) {

    if (bytes === 0) {
        return "0 MB";
    }

    const mb = bytes / (1024 * 1024);

    if (mb < 1) {
        return `${(bytes / 1024).toFixed(0)} KB`;
    }

    return `${mb.toFixed(2)} MB`;
}


/* =========================
   FILE VALIDATION
========================= */

function isImage(file) {
    return file.type.startsWith("image/");
}


/* =========================
   ADD FILES
========================= */

function addFiles(files) {

    const incomingFiles = Array.from(files);

    let added = 0;

    incomingFiles.forEach(file => {

        if (!isImage(file)) {
            return;
        }

        const alreadyExists = selectedFilesArray.some(existingFile =>
            existingFile.name === file.name &&
            existingFile.size === file.size &&
            existingFile.lastModified === file.lastModified
        );

        if (alreadyExists) {
            return;
        }

        selectedFilesArray.push(file);

        added++;
    });

    renderPreviews();

    if (incomingFiles.length && added === 0) {
        showStatus(
            "These images are already selected or unsupported.",
            "error"
        );
    }
}


/* =========================
   FILE PICKER
========================= */

browseBtn.addEventListener("click", event => {

    event.stopPropagation();

    fileInput.click();
});


dropZone.addEventListener("click", event => {

    if (event.target === browseBtn) {
        return;
    }

    fileInput.click();
});


fileInput.addEventListener("change", event => {

    addFiles(event.target.files);

    fileInput.value = "";
});


/* =========================
   DRAG & DROP
========================= */

["dragenter", "dragover"].forEach(eventName => {

    dropZone.addEventListener(eventName, event => {

        event.preventDefault();

        dropZone.classList.add("dragging");
    });
});


["dragleave", "drop"].forEach(eventName => {

    dropZone.addEventListener(eventName, event => {

        event.preventDefault();

        dropZone.classList.remove("dragging");
    });
});


dropZone.addEventListener("drop", event => {

    const files = event.dataTransfer.files;

    addFiles(files);
});


/* =========================
   RENDER PREVIEWS
========================= */

function renderPreviews() {

    previewGrid.innerHTML = "";

    const count = selectedFilesArray.length;

    fileCount.textContent = count;
    selectedCount.textContent =
        `${count} ${count === 1 ? "image" : "images"}`;

    const size = selectedFilesArray.reduce(
        (total, file) => total + file.size,
        0
    );

    totalSize.textContent = formatFileSize(size);

    uploadBtn.disabled = count === 0;

    previewContainer.hidden = count === 0;

    selectedFilesArray.forEach((file, index) => {

        const reader = new FileReader();

        reader.onload = event => {

            const item = document.createElement("div");

            item.className = "preview-item";

            item.innerHTML = `
                <img
                    src="${event.target.result}"
                    alt="${escapeHtml(file.name)}"
                    loading="lazy"
                >

                <div class="preview-overlay">
                    <span class="file-number">
                        #${index + 1}
                    </span>
                </div>

                <button
                    type="button"
                    class="remove-btn"
                    data-index="${index}"
                    aria-label="Remove ${escapeHtml(file.name)}"
                    title="Remove image"
                >
                    ×
                </button>
            `;

            previewGrid.appendChild(item);
        };

        reader.readAsDataURL(file);
    });
}


/* =========================
   REMOVE ONE FILE
========================= */

previewGrid.addEventListener("click", event => {

    const button = event.target.closest(".remove-btn");

    if (!button) {
        return;
    }

    const index = Number(button.dataset.index);

    selectedFilesArray.splice(index, 1);

    renderPreviews();
});


/* =========================
   CLEAR ALL
========================= */

clearAllBtn.addEventListener("click", () => {

    selectedFilesArray = [];

    fileInput.value = "";

    resetProgress();

    clearStatus();

    renderPreviews();
});


/* =========================
   UPLOAD
========================= */

uploadForm.addEventListener("submit", event => {

    event.preventDefault();

    if (!selectedFilesArray.length) {

        showStatus(
            "Please select at least one image.",
            "error"
        );

        return;
    }

    uploadFiles();
});


function uploadFiles() {

    const formData = new FormData();

    selectedFilesArray.forEach(file => {

        formData.append("files", file);
    });


    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/upload");

    uploadBtn.disabled = true;

    progressArea.hidden = false;

    progressBar.style.width = "0%";

    progressPercent.textContent = "0%";

    clearStatus();


    /* =========================
       UPLOAD PROGRESS
    ========================= */

    xhr.upload.addEventListener("progress", event => {

        if (!event.lengthComputable) {
            return;
        }

        const percent = Math.round(
            (event.loaded / event.total) * 100
        );

        progressBar.style.width = `${percent}%`;

        progressPercent.textContent = `${percent}%`;
    });


    /* =========================
       SUCCESS
    ========================= */

    xhr.addEventListener("load", () => {

        let result = {};

        try {
            result = JSON.parse(xhr.responseText);
        } catch {
            result = {};
        }


        if (xhr.status >= 200 && xhr.status < 300) {

            progressBar.style.width = "100%";
            progressPercent.textContent = "100%";

            showStatus(
                result.message || "Images uploaded successfully.",
                "success"
            );

            setTimeout(() => {
                window.location.reload();
            }, 1400);

            return;
        }


        /* =========================
           SERVER ERROR
        ========================= */

        const message =
            result.detail ||
            "Upload failed. Please try again.";

        showStatus(message, "error");

        uploadBtn.disabled = false;
    });


    /* =========================
       NETWORK ERROR
    ========================= */

    xhr.addEventListener("error", () => {

        showStatus(
            "Connection error. Please check the server.",
            "error"
        );

        uploadBtn.disabled = false;
    });


    /* =========================
       REQUEST COMPLETE
    ========================= */

    xhr.addEventListener("loadend", () => {

        if (xhr.status < 200 || xhr.status >= 300) {
            progressArea.hidden = true;
        }
    });


    xhr.send(formData);
}


/* =========================
   STATUS
========================= */

function showStatus(message, type) {

    status.textContent = message;

    status.className =
        `status-message ${type}`;
}


function clearStatus() {

    status.textContent = "";

    status.className =
        "status-message";
}


/* =========================
   PROGRESS RESET
========================= */

function resetProgress() {

    progressArea.hidden = true;

    progressBar.style.width = "0%";

    progressPercent.textContent = "0%";
}


/* =========================
   HTML ESCAPE
========================= */

function escapeHtml(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================
   KEYBOARD SUPPORT
========================= */

dropZone.addEventListener("keydown", event => {

    if (
        event.key === "Enter" ||
        event.key === " "
    ) {

        event.preventDefault();

        fileInput.click();
    }
});


/* =========================
   INITIAL STATE
========================= */

renderPreviews();
