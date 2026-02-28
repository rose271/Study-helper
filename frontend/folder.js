const params   = new URLSearchParams(window.location.search);
const folderId = params.get('id');
const user_id  = localStorage.getItem('user_id');
const API      = 'http://127.0.0.1:8000';

// ─── Guard ────────────────────────────────────────────────────────────────────
if (!folderId) window.location.href = 'mainpage.html';

if (!user_id) {
    alert('Please login first!');
    window.location.href = 'authantication.html';
}


// ─── Load Folder Info from Database ──────────────────────────────────────────
async function loadFolderInfo() {
    try {
        const response = await fetch(`${API}/folder/info/${folderId}`);
        const folder   = await response.json();
        document.getElementById('folderTitle').textContent = folder.folder_name;
        document.getElementById('folderDesc').textContent  = folder.folder_des;
        document.title = folder.folder_name;
    } catch (error) {
        console.error('Failed to load folder info:', error);
    }
}

loadFolderInfo();

// ─── Render Files from Database ───────────────────────────────────────────────
async function renderFiles() {
    const grid  = document.getElementById('filesGrid');
    const empty = document.getElementById('emptyState');

    try {
        const response = await fetch(`${API}/contents/${folderId}`);
        const files    = await response.json();

        grid.innerHTML = '';

        if (files.length === 0) {
            empty.classList.add('visible');
            return;
        }

        empty.classList.remove('visible');

        files.forEach(file => {
            const isImage = file.content_name.match(/\.(jpg|jpeg|png|gif)$/i);

            const card = document.createElement('div');
            card.className = 'file-card';
            card.innerHTML = `
                ${isImage
                    ? `<img class="file-thumbnail" src="${API}/${file.content_path}" alt="${file.content_name}">`
                    : `<div class="file-pdf-thumb"><i class="fas fa-file-pdf"></i></div>`
                }
                <div class="file-info">
                    <div class="file-name" title="${file.content_name}">${file.content_name}</div>
                </div>
                <button class="file-delete" data-id="${file.content_id}" title="Delete file">
                    <i class="fas fa-trash"></i>
                </button>
            `;

            // Preview on click
            card.addEventListener('click', (e) => {
                if (e.target.closest('.file-delete')) return;
                openPreview(file);
            });

            // Delete file
            card.querySelector('.file-delete').addEventListener('click', async (e) => {
                e.stopPropagation();
                const content_id = e.currentTarget.dataset.id;
                await fetch(`${API}/contents/${content_id}`, { method: 'DELETE' });
                renderFiles();
            });

            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to load files:', error);
    }
}

renderFiles();

// ─── Preview ──────────────────────────────────────────────────────────────────
function openPreview(file) {
    const overlay  = document.getElementById('previewOverlay');
    const body     = document.getElementById('previewBody');
    const isImage  = file.content_name.match(/\.(jpg|jpeg|png|gif)$/i);
    const fileUrl  = `${API}/${file.content_path}`;

    if (isImage) {
        body.innerHTML = `<img src="${fileUrl}" alt="${file.content_name}">`;
    } else {
        body.innerHTML = `<iframe src="${fileUrl}"></iframe>`;
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

// ─── File Upload to Database ──────────────────────────────────────────────────
async function handleFiles(fileList) {
    showUploadProgress(true);

    for (const file of Array.from(fileList)) {
        const formData = new FormData();
        formData.append('file', file);  // content_name taken from file.filename automatically

        try {
            const response = await fetch(`${API}/contents/${user_id}/${folderId}`, {
                method: 'POST',
                body:   formData
            });

            if (!response.ok) {
                alert(`Failed to upload ${file.name}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Could not connect to server. Make sure FastAPI is running.');
        }
    }

    showUploadProgress(false);
    renderFiles();
}

function showUploadProgress(loading) {
    const btn = document.querySelector('.upload-btn');
    const dz  = document.getElementById('dropzone');
    if (loading) {
        btn.innerHTML       = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        dz.style.opacity    = '0.7';
        dz.style.pointerEvents = 'none';
    } else {
        btn.innerHTML       = '<i class="fas fa-plus"></i> Choose Files';
        dz.style.opacity    = '1';
        dz.style.pointerEvents = 'auto';
    }
}

document.getElementById('fileInput').addEventListener('change', function () {
    if (this.files.length) handleFiles(this.files);
    this.value = '';
});

// ─── Drag & Drop ──────────────────────────────────────────────────────────────
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

// ─── Sidebar ──────────────────────────────────────────────────────────────────
fetch('sidebar.html')
    .then(r => r.text())
    .then(data => {
        document.getElementById('sidebar-container').innerHTML = data;

        const toggleBtn   = document.getElementById('toggleBtn');
        const sidebar     = document.getElementById('sidebar');
        const mainContent = document.querySelector('.folder-content-wrapper');

        // Toggle sidebar
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            mainContent.classList.toggle('expanded');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'authantication.html';
        });
    });