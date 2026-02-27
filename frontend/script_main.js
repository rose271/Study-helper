// ─── Folder Storage Helpers ───────────────────────────────────────────────────

function getFolders() {
    return JSON.parse(localStorage.getItem('folders') || '[]');
}

function saveFolders(folders) {
    localStorage.setItem('folders', JSON.stringify(folders));
}

function generateId() {
    return 'folder_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ─── Render All Folders ────────────────────────────────────────────────────────

function renderFolders(folderList) {
    const row = document.getElementById("folderCardsRow");
    row.innerHTML = '';

    folderList.forEach(folder => {
        const col = document.createElement("div");
        col.classList.add("col-md-4", "mt-4");
        col.dataset.folderId = folder.id;
        col.innerHTML = `
            <div class="card course-card">
                <div class="card-body">
                    <h5 class="card-title">${folder.name}</h5>
                    <p class="card-text">${folder.description}</p>
                    <a href="folder.html?id=${folder.id}" class="btn custom-btn">Course elements</a>
                    <button class="btn edit-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#editFolderModal"
                        data-folder-id="${folder.id}">Edit</button>
                </div>
            </div>
        `;

        col.querySelector(".edit-btn").addEventListener("click", function () {
            const folderId = this.dataset.folderId;
            const folders = getFolders();
            const folder = folders.find(f => f.id === folderId);
            if (!folder) return;
            document.getElementById("editFolderName").value = folder.name;
            document.getElementById("editFolderDescription").value = folder.description;
            document.getElementById("editFolderModal").dataset.editingId = folderId;
        });

        row.appendChild(col);
    });
}

// ─── Initial Render ────────────────────────────────────────────────────────────

renderFolders(getFolders());

// ─── Create Folder ─────────────────────────────────────────────────────────────

document.getElementById("folderForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("folderName").value.trim();
    const description = document.getElementById("folderDescription").value.trim();

    const newFolder = { id: generateId(), name, description };
    const folders = getFolders();
    folders.push(newFolder);
    saveFolders(folders);
    renderFolders(folders);

    bootstrap.Modal.getInstance(document.getElementById('createFolderModal')).hide();
    this.reset();
});

// ─── Edit Folder ───────────────────────────────────────────────────────────────

document.getElementById("editFolderForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const folderId = document.getElementById("editFolderModal").dataset.editingId;
    if (!folderId) return;

    const folders = getFolders();
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    folder.name = document.getElementById("editFolderName").value.trim();
    folder.description = document.getElementById("editFolderDescription").value.trim();
    saveFolders(folders);
    renderFolders(folders);

    bootstrap.Modal.getInstance(document.getElementById('editFolderModal')).hide();
});

// ─── Search ────────────────────────────────────────────────────────────────────

document.getElementById("search_button").addEventListener("input", function () {
    const query = this.value.toLowerCase();
    const folders = getFolders().filter(f =>
        f.name.toLowerCase().includes(query) || f.description.toLowerCase().includes(query)
    );
    renderFolders(folders);
});

// ─── Activity Calendar ─────────────────────────────────────────────────────────

const calendar = document.getElementById('calendar');
const weeksInYear = 52;
const daysInWeek = 7;

for (let w = 0; w < weeksInYear; w++) {
    const weekDiv = document.createElement('div');
    weekDiv.className = 'week';

    for (let d = 0; d < daysInWeek; d++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.addEventListener('click', () => dayDiv.classList.toggle('active'));
        weekDiv.appendChild(dayDiv);
    }

    calendar.appendChild(weekDiv);
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('sidebar-container').innerHTML = data;

        const toggleBtn = document.getElementById('toggleBtn');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content-wrapper');

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            mainContent.classList.toggle('expanded');
        });
    });