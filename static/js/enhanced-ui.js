// Enhanced UI Interactions for WeTravel Mumbai
document.addEventListener('DOMContentLoaded', function() {
  
  // Load and display user data in profile
  function loadUserProfile() {
    // Check if user is logged in
    const userData = JSON.parse(sessionStorage.getItem('wetravel_auth') || '{}');
    
    if (userData.name) {
      // Update sidebar user info
      const sidebarUserName = document.getElementById('user-name');
      const sidebarUserEmail = document.getElementById('user-email');
      
      if (sidebarUserName) sidebarUserName.textContent = userData.name;
      if (sidebarUserEmail) sidebarUserEmail.textContent = userData.email;
      
      // Update profile page
      const profileName = document.getElementById('profile-name');
      const profileEmail = document.getElementById('profile-email');
      
      if (profileName) profileName.textContent = userData.name;
      if (profileEmail) profileEmail.textContent = userData.email;
      
      // Calculate and display member since date
      const profileMember = document.querySelector('.profile-member');
      if (profileMember) {
        const registerDate = userData.registerDate || new Date().toISOString();
        const date = new Date(registerDate);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        profileMember.textContent = `Member since: ${formattedDate}`;
      }
    }
  }
  
  // Initial load of user profile
  loadUserProfile();
  
  // Quick reply functionality in chat
  const quickReplies = document.querySelectorAll('.quick-reply-chip');
  const inputMessage = document.getElementById('input-message');
  const sendButton = document.getElementById('send-button');
  
  quickReplies.forEach(chip => {
    chip.addEventListener('click', function() {
      const message = this.getAttribute('data-message');
      if (inputMessage) {
        inputMessage.value = message;
        if (sendButton) {
          // Simulate button click
          sendButton.click();
        }
      }
    });
  });
  
  // Gallery category filtering
  const galleryCategories = document.querySelectorAll('.gallery-category');
  const galleryItems = document.querySelectorAll('.gallery-item');
  
  galleryCategories.forEach(category => {
    category.addEventListener('click', function() {
      // Remove active class from all categories
      galleryCategories.forEach(cat => cat.classList.remove('active'));
      
      // Add active class to clicked category
      this.classList.add('active');
      
      const selectedCategory = this.getAttribute('data-category');
      
      galleryItems.forEach(item => {
        if (selectedCategory === 'all' || item.getAttribute('data-category') === selectedCategory) {
          item.style.display = 'block';
          // Add fade-in animation
          item.style.animation = 'fadeIn 0.5s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
  
  // Gallery image lightbox
  galleryItems.forEach(item => {
    item.addEventListener('click', function() {
      const imgSrc = this.querySelector('img').getAttribute('src');
      const imgTitle = this.querySelector('h4').textContent;
      const imgDesc = this.querySelector('p').textContent;
      
      // Create lightbox
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <button class="lightbox-close">&times;</button>
          <img src="${imgSrc}" alt="${imgTitle}">
          <div class="lightbox-caption">
            <h3>${imgTitle}</h3>
            <p>${imgDesc}</p>
          </div>
        </div>
      `;
      
      document.body.appendChild(lightbox);
      
      // Animation
      setTimeout(() => lightbox.classList.add('active'), 10);
      
      // Close lightbox
      const closeBtn = lightbox.querySelector('.lightbox-close');
      closeBtn.addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
          closeLightbox();
        }
      });
      
      function closeLightbox() {
        lightbox.classList.remove('active');
        setTimeout(() => lightbox.remove(), 300);
      }
    });
  });
  
  // Modal handling
  const modalTriggers = document.querySelectorAll('.modal-trigger');
  
  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.preventDefault();
      
      const modalId = this.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      
      if (modal) {
        modal.classList.add('active');
        
        // Close modal
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
          });
        }
        
        // Close on outside click
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            modal.classList.remove('active');
          }
        });
      }
    });
  });
  
  // Itinerary Plan Generator animation
  const generatePlanBtn = document.querySelector('.generate-plan-btn');
  if (generatePlanBtn) {
    generatePlanBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
      this.disabled = true;
      
      // Simulate loading
      setTimeout(() => {
        this.innerHTML = '<i class="fas fa-magic"></i> Generate Plan';
        this.disabled = false;
        
        // Show success message
        const itineraryContainer = document.querySelector('.itinerary-container');
        if (itineraryContainer) {
          const successMsg = document.createElement('div');
          successMsg.className = 'success-message';
          successMsg.innerHTML = 'Your personalized plan has been generated!';
          
          itineraryContainer.prepend(successMsg);
          
          setTimeout(() => {
            successMsg.classList.add('show');
          }, 100);
          
          setTimeout(() => {
            successMsg.classList.remove('show');
            setTimeout(() => successMsg.remove(), 500);
          }, 3000);
        }
      }, 2000);
    });
  }
  
  // Plan duration and interest selectors
  const planDuration = document.getElementById('plan-duration');
  const planInterest = document.getElementById('plan-interest');
  
  if (planDuration && planInterest) {
    [planDuration, planInterest].forEach(select => {
      select.addEventListener('change', function() {
        // Simulate loading
        const generateBtn = document.querySelector('.generate-plan-btn');
        if (generateBtn) {
          generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
          generateBtn.disabled = true;
          
          setTimeout(() => {
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Plan';
            generateBtn.disabled = false;
          }, 1000);
        }
      });
    });
  }
  
  // Saved plans selection
  const savedPlans = document.querySelectorAll('.saved-plans li');
  savedPlans.forEach(plan => {
    plan.addEventListener('click', function() {
      savedPlans.forEach(p => p.classList.remove('active'));
      this.classList.add('active');
      
      // Update plan name in header
      const planName = this.textContent;
      const headerTitle = document.querySelector('.itinerary-header h3');
      if (headerTitle) {
        headerTitle.textContent = planName;
      }
    });
  });
  
  // Profile navigation tabs
  const profileNavButtons = document.querySelectorAll('.profile-navigation button');
  profileNavButtons.forEach(button => {
    button.addEventListener('click', function() {
      profileNavButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Check if this is the "Account Settings" button
      if (this.textContent.trim() === 'Account Settings') {
        // Show account settings section (could be expanded in the future)
        const accountSettings = document.createElement('div');
        accountSettings.className = 'account-settings-section';
        accountSettings.innerHTML = `
          <div class="setting-group">
            <h4>Password</h4>
            <button class="btn-outline">Change Password</button>
          </div>
          <div class="setting-group">
            <h4>Email Notifications</h4>
            <label class="toggle-switch">
              <input type="checkbox" checked>
              <span class="toggle-slider"></span>
              <span class="toggle-label">Receive travel updates</span>
            </label>
          </div>
          <div class="setting-group">
            <h4>Account Actions</h4>
            <button id="confirm-logout" class="btn-danger">Logout</button>
          </div>
        `;
        
        // Replace current profile section content
        const profileSection = document.querySelector('.profile-section');
        if (profileSection) {
          profileSection.innerHTML = '';
          profileSection.appendChild(accountSettings);
          
          // Add logout handler
          const confirmLogoutBtn = document.getElementById('confirm-logout');
          if (confirmLogoutBtn) {
            confirmLogoutBtn.addEventListener('click', function() {
              // Clear auth data
              sessionStorage.removeItem('wetravel_auth');
              // Redirect to login page
              window.location.href = '/';
            });
          }
        }
      }
    });
  });
  
  // Connect logout button in sidebar
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function() {
      // Clear auth data
      sessionStorage.removeItem('wetravel_auth');
      // Redirect to login page
      window.location.href = '/';
    });
  }
  
  // Footer subscribe form
  const subscribeForm = document.querySelector('.footer-subscribe');
  if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const input = this.querySelector('input');
      const button = this.querySelector('button');
      
      if (input.value.trim() !== '') {
        // Disable input and button
        input.disabled = true;
        button.disabled = true;
        button.innerHTML = 'Subscribing...';
        
        // Simulate API call
        setTimeout(() => {
          this.innerHTML = '<p class="success">Thanks for subscribing!</p>';
        }, 1500);
      }
    });
  }
  
  // Contact form
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.innerHTML = 'Sending...';
      submitBtn.disabled = true;
      
      // Simulate form submission
      setTimeout(() => {
        contactForm.innerHTML = `
          <div class="success-message show">
            <i class="fas fa-check-circle"></i>
            <h3>Message Sent!</h3>
            <p>We'll get back to you soon.</p>
          </div>
        `;
      }, 2000);
    });
  }
  
  // Add animations to cards and sections
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.resource-card, .gallery-item, .profile-section, .itinerary-day');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      
      if (elementTop < window.innerHeight && elementBottom > 0) {
        element.classList.add('animated');
      }
    });
  };
  
  // Initial check and add scroll listener
  animateOnScroll();
  window.addEventListener('scroll', animateOnScroll);
}); 