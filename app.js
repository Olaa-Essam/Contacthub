let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
let currentEditId = null; 
const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
let currentBase64Image = defaultAvatar;

const nameRegex = /^[a-zA-Z\u0600-\u06FF\s]{3,30}$/;
const phoneRegex = /^01[0125][0-9]{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

document.addEventListener("DOMContentLoaded", () => {
    refreshUI();
});

function openAddModal() {
    currentEditId = null;
    document.getElementById("contactModalLabel").innerText = "Add New Contact";
    document.getElementById("saveBtn").innerText = "Save Contact";
    document.getElementById("contactForm").reset();
    document.getElementById("modalPhotoPreview").src = defaultAvatar;
    document.getElementById("contactPhoto").value = ""; 
    currentBase64Image = defaultAvatar;
    
    hideErrors();
}

function saveContact() {
    const name = document.getElementById("contactName").value.trim();
    const phone = document.getElementById("contactPhone").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const address = document.getElementById("contactAddress").value.trim();
    const group = document.getElementById("contactGroup").value;
    const notes = document.getElementById("contactNotes").value.trim();
    const isFavorite = document.getElementById("isFavoriteCheck").checked;
    const isEmergency = document.getElementById("isEmergencyCheck").checked;

    if (!validateForm(name, phone, email)) return;

    if (currentEditId === null) {
        const newContact = {
            id: Date.now(),
            name,
            phone,
            email,
            address,
            group,
            notes,
            isFavorite,
            isEmergency,
            photo: currentBase64Image
        };
        contacts.push(newContact);
        Swal.fire({ 
            icon: 'success', 
            title: 'Added!', 
            text: 'Contact added successfully.', 
            timer: 1500, 
            showConfirmButton: false 
        });
    } else {
        const index = contacts.findIndex(c => c.id === currentEditId);
        if (index !== -1) {
            contacts[index] = {
                ...contacts[index],
                name,
                phone,
                email,
                address,
                group,
                notes,
                isFavorite,
                isEmergency,
                photo: currentBase64Image
            };
            Swal.fire({ 
                icon: 'success', 
                title: 'Updated!', 
                text: 'Contact updated successfully.', 
                timer: 1500, 
                showConfirmButton: false 
            });
        }
    }

    saveToLocalStorage();
    refreshUI();
    
    const modalElement = document.getElementById('contactModal');
    const modal = bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement);
    modal.hide();
}

function deleteContact(id) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this contact!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            contacts = contacts.filter(c => c.id !== id);
            saveToLocalStorage();
            refreshUI();
            Swal.fire({ 
                icon: 'success', 
                title: 'Deleted!', 
                text: 'Contact has been deleted.', 
                timer: 1500, 
                showConfirmButton: false 
            });
        }
    });
}

function editContact(id) {
    currentEditId = id;
    const contact = contacts.find(c => c.id === id);
    if (!contact) return;

    document.getElementById("contactModalLabel").innerText = "Edit Contact";
    document.getElementById("saveBtn").innerText = "Update Contact";

    document.getElementById("contactName").value = contact.name;
    document.getElementById("contactPhone").value = contact.phone;
    document.getElementById("contactEmail").value = contact.email || "";
    document.getElementById("contactAddress").value = contact.address || "";
    document.getElementById("contactGroup").value = contact.group || "";
    document.getElementById("contactNotes").value = contact.notes || "";
    document.getElementById("isFavoriteCheck").checked = contact.isFavorite;
    document.getElementById("isEmergencyCheck").checked = contact.isEmergency;
    
    document.getElementById("modalPhotoPreview").src = contact.photo || defaultAvatar;
    currentBase64Image = contact.photo || defaultAvatar;

    hideErrors();
    
    const modal = new bootstrap.Modal(document.getElementById('contactModal'));
    modal.show();
}

function toggleFavorite(id) {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
        contact.isFavorite = !contact.isFavorite;
        saveToLocalStorage();
        refreshUI();
    }
}

function toggleEmergency(id) {
    const contact = contacts.find(c => c.id === id);
    if (contact) {
        contact.isEmergency = !contact.isEmergency;
        saveToLocalStorage();
        refreshUI();
    }
}

function displayContacts(contactsArray) {
    const container = document.getElementById("contactsContainer");
    const emptyState = document.getElementById("emptyState");

    const cards = container.querySelectorAll(".contact-card-wrapper");
    cards.forEach(card => card.remove());

    if (contactsArray.length === 0) {
        emptyState.classList.remove("d-none");
    } else {
        emptyState.classList.add("d-none");
    }

    contactsArray.forEach(contact => {
        const firstLetter = contact.name ? contact.name.charAt(0).toUpperCase() : 'C';
        
        const cardHtml = `
            <div class="col-md-6 contact-card-wrapper mb-3">
                <div class="contact-card h-100">
                    <div>
                        <!-- Header: Avatar Box & Name/Phone -->
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="avatar-box">
                                ${contact.photo && contact.photo !== defaultAvatar 
                                    ? `<img src="${contact.photo}" alt="Avatar" style="width:100%; height:100%; border-radius:16px; object-fit:cover;">`
                                    : firstLetter}
                                ${contact.isEmergency ? `<div class="avatar-badge"><i class="fa-solid fa-heart"></i></div>` : ''}
                            </div>
                            <div>
                                <h5 class="fw-bold mb-1 text-dark" style="font-size: 1.05rem;">${contact.name}</h5>
                                <div class="text-muted small"><i class="fa-solid fa-phone me-1 small text-secondary"></i> ${contact.phone}</div>
                            </div>
                        </div>

                        <!-- Details List -->
                        <div class="ps-1">
                            ${contact.email ? `
                                <div class="info-item">
                                    <div class="info-icon" style="background: #e0e7ff; color: #4f46e5;"><i class="fa-solid fa-envelope"></i></div>
                                    <span class="text-truncate">${contact.email}</span>
                                </div>
                            ` : ''}

                            ${contact.address ? `
                                <div class="info-item">
                                    <div class="info-icon" style="background: #dcfce7; color: #16a34a;"><i class="fa-solid fa-location-dot"></i></div>
                                    <span class="text-truncate">${contact.address}</span>
                                </div>
                            ` : ''}

                            ${contact.isEmergency ? `
                                <div class="mt-2">
                                    <span class="badge-emergency"><i class="fa-solid fa-heart"></i> Emergency</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <!-- Bottom Action Bar -->
                    <div class="card-actions-bar">
                        <a href="tel:${contact.phone}" class="btn-action-icon call-btn" title="Call"><i class="fa-solid fa-phone"></i></a>
                        ${contact.email ? `<a href="mailto:${contact.email}" class="btn-action-icon mail-btn" title="Email"><i class="fa-solid fa-envelope"></i></a>` : ''}
                        
                        <div class="ms-auto d-flex align-items-center gap-1">
                            <button class="btn-action-icon ${contact.isFavorite ? 'active-star' : ''}" onclick="toggleFavorite(${contact.id})" title="Favorite">
                                <i class="${contact.isFavorite ? 'fa-solid' : 'fa-regular'} fa-star"></i>
                            </button>

                            <button class="btn-action-icon ${contact.isEmergency ? 'active-heart' : ''}" onclick="toggleEmergency(${contact.id})" title="Emergency">
                                <i class="${contact.isEmergency ? 'fa-solid' : 'fa-pulse'} fa-heartbeat"></i>
                            </button>

                            <button class="btn-action-icon" onclick="editContact(${contact.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-action-icon" onclick="deleteContact(${contact.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML("beforeend", cardHtml);
    });

    renderSidebars();
}

function renderSidebars() {
    const favList = document.getElementById("favSidebarList");
    const emergList = document.getElementById("emergencySidebarList");

    const favs = contacts.filter(c => c.isFavorite);
    const emergencies = contacts.filter(c => c.isEmergency);

    if (favs.length === 0) {
        favList.innerHTML = `<p class="text-muted small text-center my-3">No favorites yet</p>`;
    } else {
        favList.innerHTML = favs.map(c => `
            <div class="sidebar-item">
                <div class="d-flex align-items-center gap-2 min-w-0">
                    <div class="sidebar-avatar" style="background:#f59e0b;">${c.name ? c.name.charAt(0).toUpperCase() : 'C'}</div>
                    <div class="min-w-0">
                        <div class="fw-bold small text-dark text-truncate" style="max-width: 120px;">${c.name}</div>
                        <div class="text-muted extra-small" style="font-size:0.75rem;">${c.phone}</div>
                    </div>
                </div>
                <a href="tel:${c.phone}" class="btn-call-mini" style="background:#fffbeb; color:#d97706;"><i class="fa-solid fa-phone"></i></a>
            </div>
        `).join('');
    }

    if (emergencies.length === 0) {
        emergList.innerHTML = `<p class="text-muted small text-center my-3">No emergency contacts</p>`;
    } else {
        emergList.innerHTML = emergencies.map(c => `
            <div class="sidebar-item">
                <div class="d-flex align-items-center gap-2 min-w-0">
                    <div class="sidebar-avatar">${c.name ? c.name.charAt(0).toUpperCase() : 'C'}</div>
                    <div class="min-w-0">
                        <div class="fw-bold small text-dark text-truncate" style="max-width: 120px;">${c.name}</div>
                        <div class="text-muted extra-small" style="font-size:0.75rem;">${c.phone}</div>
                    </div>
                </div>
                <a href="tel:${c.phone}" class="btn-call-mini"><i class="fa-solid fa-phone"></i></a>
            </div>
        `).join('');
    }
}

function searchContact(value) {
    const term = value.toLowerCase().trim();
    const filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(term) || 
        c.phone.includes(term) || 
        (c.email && c.email.toLowerCase().includes(term))
    );
    displayContacts(filtered);
}

function validateForm(name, phone, email) {
    hideErrors();
    let isValid = true;

    if (!nameRegex.test(name)) {
        Swal.fire({ icon: 'error', title: 'Invalid Name', text: 'Name must be at least 3 letters long.' });
        isValid = false;
    }

    if (!phoneRegex.test(phone)) {
        document.getElementById("phoneError").classList.remove("d-none");
        isValid = false;
    }

    if (email !== "" && !emailRegex.test(email)) {
        Swal.fire({ icon: 'error', title: 'Invalid Email', text: 'Please enter a valid email address.' });
        isValid = false;
    }

    return isValid;
}

function hideErrors() {
    document.getElementById("phoneError").classList.add("d-none");
}

function saveToLocalStorage() {
    localStorage.setItem("contacts", JSON.stringify(contacts));
}

function updateCounters() {
    document.getElementById("totalCounter").innerText = contacts.length;
    document.getElementById("favCounter").innerText = contacts.filter(c => c.isFavorite).length;
    document.getElementById("emergencyCounter").innerText = contacts.filter(c => c.isEmergency).length;
}

function refreshUI() {
    const searchVal = document.getElementById("searchInput") ? document.getElementById("searchInput").value : "";
    searchContact(searchVal);
    updateCounters();
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("modalPhotoPreview").src = e.target.result;
            currentBase64Image = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}