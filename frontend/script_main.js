// Reference to the folder being edited
let currentCard;

// Create folder dynamically
document.getElementById("folderForm").addEventListener("submit", function(e){
    e.preventDefault();

    let name = document.getElementById("folderName").value;
    let description = document.getElementById("folderDescription").value;

    // Create new card HTML with Edit button
    let newCard = document.createElement("div");
    newCard.classList.add("col-md-4", "mt-4");
    newCard.innerHTML = `
        <div class="card course-card">
            <div class="card-body">
                <h5 class="card-title">${name}</h5>
                <p class="card-text">${description}</p>
                <a href="#" class="btn custom-btn">Course elements</a>
                <button class="btn edit-btn" data-bs-toggle="modal" data-bs-target="#editFolderModal">Edit</button>
            </div>
        </div>
    `;

    // Append card to folder row
    document.getElementById("folderCardsRow").appendChild(newCard);

    // Add click listener to the edit button
    newCard.querySelector(".edit-btn").addEventListener("click", function(){
        currentCard = this.closest(".card"); // store card being edited
        document.getElementById("editFolderName").value = currentCard.querySelector(".card-title").innerText;
        document.getElementById("editFolderDescription").value = currentCard.querySelector(".card-text").innerText;
    });

    // Close modal
    var modal = bootstrap.Modal.getInstance(document.getElementById('createFolderModal'));
    modal.hide();

    // Reset form
    document.getElementById("folderForm").reset();
});

// Edit Folder Modal submit
document.getElementById("editFolderForm").addEventListener("submit", function(e){
    e.preventDefault();
    if (!currentCard) return;

    currentCard.querySelector(".card-title").innerText = document.getElementById("editFolderName").value;
    currentCard.querySelector(".card-text").innerText = document.getElementById("editFolderDescription").value;

    // Close modal
    var modal = bootstrap.Modal.getInstance(document.getElementById('editFolderModal'));
    modal.hide();
});


// Generate 7x52 = 364 days (approx 1 year)
const calendar = document.getElementById('calendar');
const weeksInYear = 52;
const daysInWeek = 7;

// Create the grid
for (let w = 0; w < weeksInYear; w++) {
  const weekDiv = document.createElement('div');
  weekDiv.className = 'week';
  
  for (let d = 0; d < daysInWeek; d++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'day';

    // Toggle active class on click
    dayDiv.addEventListener('click', () => {
      dayDiv.classList.toggle('active');
    });

    weekDiv.appendChild(dayDiv);
  }

  calendar.appendChild(weekDiv);
}

    // Load sidebar HTML into the page
   fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('sidebar-container').innerHTML = data;

        const toggleBtn = document.getElementById('toggleBtn');
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content-wrapper'); // select wrapper

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            mainContent.classList.toggle('expanded'); // now shifts main content
        });
    });