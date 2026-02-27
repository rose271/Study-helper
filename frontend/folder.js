// ─── Folder Info Helpers (localStorage — small data only) ─────────────────────

function getFolders() {
    return JSON.parse(localStorage.getItem('folders') || '[]');
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── Load Folder Info ──────────────────────────────────────────────────────────

const params = new URLSearchParams(window.location.search);
const folderId = params.get('id');

if (!folderId) window.location.href = 'mainpage.html';

const folders = getFolders();
const folder = folders.find(f => f.id === folderId);

if (!folder) {
    window.location.href = 'mainpage.html';
} else {
    document.getElementById('folderTitle').textContent = folder.name;
    document.getElementById('folderDesc').textContent = folder.description;
    document.title = folder.name;
}

// ─── IndexedDB Setup ───────────────────────────────────────────────────────────

const DB_NAME = 'FolderFilesDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';
let db;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const database = e.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                store.createIndex('folderId', 'folderId', { unique: false });
            }
        };

        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

function getFilesForFolder(folderId) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('folderId');
        const request = index.getAll(folderId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function saveFileToDB(fileRecord) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.add(fileRecord);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteFileFromDB(fileId) {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(fileId);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ─── Render Files ──────────────────────────────────────────────────────────────

async function renderFiles() {
    const grid = document.getElementById('filesGrid');
    const empty = document.getElementById('emptyState');
    const files = await getFilesForFolder(folderId);

    grid.innerHTML = '';

    if (files.length === 0) {
        empty.classList.add('visible');
        return;
    }

    empty.classList.remove('visible');

    files.forEach(file => {
        const isImage = file.type.startsWith('image/');
        const url = URL.createObjectURL(new Blob([file.data], { type: file.type }));

        const card = document.createElement('div');
        card.className = 'file-card';
        card.innerHTML = `
            ${isImage
                ? `<img class="file-thumbnail" src="${url}" alt="${file.name}">`
                : `<div class="file-pdf-thumb"><i class="fas fa-file-pdf"></i></div>`
            }
            <div class="file-info">
                <div class="file-name" title="${file.name}">${file.name}</div>
                <div class="file-size">${formatSize(file.size)}</div>
            </div>
            <button class="file-delete" title="Delete file"><i class="fas fa-trash"></i></button>
        `;

        card.addEventListener('click', (e) => {
            if (e.target.closest('.file-delete')) return;
            openPreview(file);
        });

        card.querySelector('.file-delete').addEventListener('click', async (e) => {
            e.stopPropagation();
            await deleteFileFromDB(file.id);
            renderFiles();
        });

        grid.appendChild(card);
    });
}

// ─── Preview ───────────────────────────────────────────────────────────────────

function openPreview(file) {
    const overlay = document.getElementById('previewOverlay');
    const body = document.getElementById('previewBody');
    const isImage = file.type.startsWith('image/');
    const url = URL.createObjectURL(new Blob([file.data], { type: file.type }));

    if (isImage) {
        body.innerHTML = `<img src="${url}" alt="${file.name}">`;
    } else {
        body.innerHTML = `<iframe src="${url}"></iframe>`;
    }

    overlay.classList.add('active');
}

document.getElementById('previewClose').addEventListener('click', () => {
    document.getElementById('previewOverlay').classList.remove('active');
    document.getElementById('previewBody').innerHTML = '';
});

document.getElementById('previewOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('previewOverlay')) {
        document.getElementById('previewClose').click();
    }
});

// ─── File Upload ───────────────────────────────────────────────────────────────

async function handleFiles(fileList) {
    showUploadProgress(true);

    for (const file of Array.from(fileList)) {
        const arrayBuffer = await file.arrayBuffer();
        await saveFileToDB({
            folderId,
            name: file.name,
            type: file.type,
            size: file.size,
            data: arrayBuffer
        });
    }

    showUploadProgress(false);
    renderFiles();
}

function showUploadProgress(loading) {
    const btn = document.querySelector('.upload-btn');
    const dz = document.getElementById('dropzone');
    if (loading) {
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        dz.style.opacity = '0.7';
        dz.style.pointerEvents = 'none';
    } else {
        btn.innerHTML = '<i class="fas fa-plus"></i> Choose Files';
        dz.style.opacity = '1';
        dz.style.pointerEvents = 'auto';
    }
}

document.getElementById('fileInput').addEventListener('change', function () {
    if (this.files.length) handleFiles(this.files);
    this.value = '';
});

// ─── Drag & Drop ───────────────────────────────────────────────────────────────

const dropzone = document.getElementById('dropzone');

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
});

dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
});

// ─── Sidebar ───────────────────────────────────────────────────────────────────

fetch('sidebar.html')
    .then(r => r.text())
    .then(data => {
        document.getElementById('sidebar-container').innerHTML = data;

        const toggleBtn = document.getElementById('toggleBtn');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.folder-content-wrapper');

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            mainContent.classList.toggle('expanded');
        });
    });

// ─── Init ──────────────────────────────────────────────────────────────────────

openDB().then(database => {
    db = database;
    renderFiles();
}).catch(err => {
    console.error('IndexedDB failed to open:', err);
});