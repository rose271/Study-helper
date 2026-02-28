const user_id = localStorage.getItem('user_id');
const API = 'http://127.0.0.1:8000';

// ─── Render All Folders ───────────────────────────────────────────────────────
function renderFolders(folderList) {
    const row = document.getElementById("folderCardsRow");
    row.innerHTML = '';

    folderList.forEach(folder => {
        const col = document.createElement("div");
        col.classList.add("col-md-4", "mt-4");
        col.innerHTML = `
            <div class="card course-card">
                <div class="card-body">
                    <h5 class="card-title">${folder.folder_name}</h5>
                    <p class="card-text">${folder.folder_des}</p>
                    <a href="folder.html?id=${folder.folder_id}" class="btn custom-btn">Course elements</a>
                    <button class="btn edit-btn"
                        data-bs-toggle="modal"
                        data-bs-target="#editFolderModal"
                        data-folder-id="${folder.folder_id}"
                        data-folder-name="${folder.folder_name}"
                        data-folder-des="${folder.folder_des}">Edit</button>
                </div>
            </div>
        `;

        col.querySelector(".edit-btn").addEventListener("click", function () {
            document.getElementById("editFolderName").value        = this.dataset.folderName;
            document.getElementById("editFolderDescription").value = this.dataset.folderDes;
            document.getElementById("editFolderModal").dataset.editingId = this.dataset.folderId;
        });

        row.appendChild(col);
    });
}

// ─── Fetch Folders from Database ──────────────────────────────────────────────
async function loadFolders() {
    const response = await fetch(`${API}/folders/${user_id}`);
    const folders  = await response.json();
    renderFolders(folders);
}

loadFolders();

// ─── Create Folder ────────────────────────────────────────────────────────────
document.getElementById("folderForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const folder_name = document.getElementById("folderName").value.trim();
    const folder_des  = document.getElementById("folderDescription").value.trim();

    const response = await fetch(`${API}/folders/${user_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_name, folder_des })
    });

    if (response.ok) {
        loadFolders();
        bootstrap.Modal.getInstance(document.getElementById('createFolderModal')).hide();
        this.reset();
    } else {
        alert('Failed to create folder.');
    }
});

// ─── Edit Folder ──────────────────────────────────────────────────────────────
document.getElementById("editFolderForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const folder_id   = document.getElementById("editFolderModal").dataset.editingId;
    const folder_name = document.getElementById("editFolderName").value.trim();
    const folder_des  = document.getElementById("editFolderDescription").value.trim();

    const response = await fetch(`${API}/folder/${folder_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_name, folder_des })
    });

    if (response.ok) {
        loadFolders();
        bootstrap.Modal.getInstance(document.getElementById('editFolderModal')).hide();
    } else {
        alert('Failed to update folder.');
    }
});

// ─── Search ───────────────────────────────────────────────────────────────────
document.getElementById("search_button").addEventListener("input", async function () {
    const query    = this.value.toLowerCase();
    const response = await fetch(`${API}/folders/${user_id}`);
    const folders  = await response.json();
    const filtered = folders.filter(f =>
        f.folder_name.toLowerCase().includes(query) ||
        f.folder_des.toLowerCase().includes(query)
    );
    renderFolders(filtered);
});

// ─── Activity Calendar ────────────────────────────────────────────────────────
const calendar     = document.getElementById('calendar');
const weeksInYear  = 52;
const daysInWeek   = 7;

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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

    fetch('sidebar.html')
    .then(r => r.text())
    .then(data => {
        document.getElementById('sidebar-container').innerHTML = data;

        const toggleBtn   = document.getElementById('toggleBtn');
        const sidebar     = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content-wrapper');

        // Toggle sidebar
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            mainContent.classList.toggle('expanded');
        });

        // Logout  ← add this here
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'authantication.html';
        });
    });
