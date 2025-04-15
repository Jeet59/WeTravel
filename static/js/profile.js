/**
 * WeTravel Mumbai - Profile Management
 * Handles user profile functionality and integration with authentication
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize profile functionality
    initProfile();
    setupProfileListeners();
});

/**
 * Initialize profile with data from authentication
 */
function initProfile() {
    // Get authenticated user data from session storage
    const authData = JSON.parse(sessionStorage.getItem('wetravel_auth') || '{}');
    
    if (!authData.user) return;
    
    const { name, email, joinDate } = authData.user;
    
    // Update profile section with user data
    const profileNameEl = document.querySelector('#profile .profile-info h3');
    const profileEmailEl = document.querySelector('#profile .profile-info p:nth-child(2)');
    const profileJoinDateEl = document.querySelector('#profile .profile-info p:nth-child(3)');
    
    if (profileNameEl) profileNameEl.textContent = name || 'User';
    if (profileEmailEl) profileEmailEl.textContent = email || '';
    if (profileJoinDateEl && joinDate) {
        profileJoinDateEl.textContent = `Member since: ${joinDate}`;
    }
    
    // Also update sidebar user info
    const sidebarNameEl = document.querySelector('#sidebar .user-info h4');
    const sidebarEmailEl = document.querySelector('#sidebar .user-info p');
    
    if (sidebarNameEl) sidebarNameEl.textContent = name || 'User';
    if (sidebarEmailEl) sidebarEmailEl.textContent = email || '';
    
    // Load profile image if exists in localStorage
    const savedProfileImage = localStorage.getItem('wetravel_profile_image');
    if (savedProfileImage) {
        const profileImageEl = document.querySelector('#profile .profile-photo img');
        const sidebarImageEl = document.querySelector('#sidebar .avatar img');
        
        if (profileImageEl) profileImageEl.src = savedProfileImage;
        if (sidebarImageEl) sidebarImageEl.src = savedProfileImage;
    }
}

/**
 * Set up listeners for profile actions
 */
function setupProfileListeners() {
    // Photo upload listener
    const photoInput = document.querySelector('#profile-photo-input');
    const uploadButton = document.querySelector('#profile .upload-btn');
    
    if (uploadButton && photoInput) {
        uploadButton.addEventListener('click', () => {
            photoInput.click();
        });
        
        photoInput.addEventListener('change', handlePhotoUpload);
    }
    
    // Save profile changes
    const saveButton = document.querySelector('#profile .save-btn');
    if (saveButton) {
        saveButton.addEventListener('click', saveProfileChanges);
    }
}

/**
 * Handle profile photo uploads
 */
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const profileImageEl = document.querySelector('#profile .profile-photo img');
        const sidebarImageEl = document.querySelector('#sidebar .avatar img');
        
        if (profileImageEl) profileImageEl.src = e.target.result;
        if (sidebarImageEl) sidebarImageEl.src = e.target.result;
        
        // Save profile image to localStorage
        localStorage.setItem('wetravel_profile_image', e.target.result);
        
        showMessage('Profile photo updated successfully!');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Save profile changes
 */
function saveProfileChanges() {
    const nameInput = document.querySelector('#profile-name');
    const emailInput = document.querySelector('#profile-email');
    
    if (!nameInput || !emailInput) return;
    
    const newName = nameInput.value.trim();
    const newEmail = emailInput.value.trim();
    
    if (!newName || !newEmail) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // Update authentication data in session storage
    const authData = JSON.parse(sessionStorage.getItem('wetravel_auth') || '{}');
    
    if (authData.user) {
        authData.user.name = newName;
        authData.user.email = newEmail;
        
        sessionStorage.setItem('wetravel_auth', JSON.stringify(authData));
        
        // Update UI
        const profileNameEl = document.querySelector('#profile .profile-info h3');
        const profileEmailEl = document.querySelector('#profile .profile-info p:nth-child(2)');
        const sidebarNameEl = document.querySelector('#sidebar .user-info h4');
        const sidebarEmailEl = document.querySelector('#sidebar .user-info p');
        
        if (profileNameEl) profileNameEl.textContent = newName;
        if (profileEmailEl) profileEmailEl.textContent = newEmail;
        if (sidebarNameEl) sidebarNameEl.textContent = newName;
        if (sidebarEmailEl) sidebarEmailEl.textContent = newEmail;
        
        showMessage('Profile updated successfully!');
    }
}

/**
 * Show success or error message
 */
function showMessage(text, type = 'success') {
    const messageElement = document.createElement('div');
    messageElement.className = `profile-message ${type}`;
    messageElement.textContent = text;
    
    const profileSection = document.querySelector('#profile');
    if (profileSection) {
        profileSection.appendChild(messageElement);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 3000);
    }
} 