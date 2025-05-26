// Booking form functionality
document.addEventListener('DOMContentLoaded', function() {
  // Get all booking buttons
  const bookingButtons = document.querySelectorAll('.btn');
  
  bookingButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Open booking modal
      openBookingModal(this.closest('.service-card') ? 
                      this.closest('.service-card').querySelector('h3').textContent : 
                      'Strategy Call');
    });
  });
  
  // Create booking modal
  function openBookingModal(service) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'booking-modal-container';
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'booking-modal-content';
    
    // Add modal HTML
    modalContent.innerHTML = `
      <div class="booking-modal-header">
        <h3>Book Your ${service}</h3>
        <span class="close-modal">&times;</span>
      </div>
      <div class="booking-modal-body">
        <form id="bookingForm">
          <input type="hidden" name="service" value="${service}">
          
          <div class="form-group">
            <label for="name">Your Name</label>
            <input type="text" id="name" name="name" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email Address</label>
            <input type="email" id="email" name="email" required>
          </div>
          
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone">
          </div>
          
          <div class="form-group">
            <label for="message">Message (Optional)</label>
            <textarea id="message" name="message" rows="4"></textarea>
          </div>
          
          <div class="form-group">
            <button type="submit" class="btn">Submit Booking Request</button>
          </div>
        </form>
      </div>
    `;
    
    // Add modal to container
    modalContainer.appendChild(modalContent);
    
    // Add modal to body
    document.body.appendChild(modalContainer);
    
    // Add event listener for close button
    const closeButton = modalContainer.querySelector('.close-modal');
    closeButton.addEventListener('click', function() {
      document.body.removeChild(modalContainer);
    });
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', function(e) {
      if (e.target === modalContainer) {
        document.body.removeChild(modalContainer);
      }
    });
    
    // Handle form submission
    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const formData = new FormData(bookingForm);
      const bookingData = {};
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        bookingData[key] = value;
      }
      
      // Submit booking data to backend
      submitBooking(bookingData, modalContainer);
    });
  }
  
  // Submit booking data to backend
  function submitBooking(bookingData, modalContainer) {
    // Show loading state
    const submitButton = modalContainer.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Processing...';
    submitButton.disabled = true;
    
    // Send data to backend
    fetch('/api/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    })
    .then(response => response.json())
    .then(data => {
      // Replace form with success message
      const formContainer = modalContainer.querySelector('.booking-modal-body');
      
      if (data.success) {
        formContainer.innerHTML = `
          <div class="success-message">
            <h4>Thank You!</h4>
            <p>${data.message}</p>
          </div>
        `;
        
        // Close modal after 5 seconds
        setTimeout(() => {
          if (document.body.contains(modalContainer)) {
            document.body.removeChild(modalContainer);
          }
        }, 5000);
      } else {
        // Show error message
        formContainer.innerHTML = `
          <div class="error-message">
            <h4>Something Went Wrong</h4>
            <p>${data.message}</p>
            <button class="btn try-again">Try Again</button>
          </div>
        `;
        
        // Add event listener for try again button
        const tryAgainButton = formContainer.querySelector('.try-again');
        tryAgainButton.addEventListener('click', function() {
          // Reopen modal with same service
          document.body.removeChild(modalContainer);
          openBookingModal(bookingData.service);
        });
      }
    })
    .catch(error => {
      console.error('Booking error:', error);
      
      // Show error message
      const formContainer = modalContainer.querySelector('.booking-modal-body');
      formContainer.innerHTML = `
        <div class="error-message">
          <h4>Connection Error</h4>
          <p>There was a problem connecting to our booking system. Please try again later or contact us directly.</p>
          <button class="btn try-again">Try Again</button>
        </div>
      `;
      
      // Add event listener for try again button
      const tryAgainButton = formContainer.querySelector('.try-again');
      tryAgainButton.addEventListener('click', function() {
        // Reopen modal with same service
        document.body.removeChild(modalContainer);
        openBookingModal(bookingData.service);
      });
    });
  }
  
  // Function to load portfolio items from API
  function loadPortfolioItems() {
    // Check if portfolio section exists
    const portfolioSection = document.querySelector('.portfolio');
    if (!portfolioSection) return;
    
    // Get portfolio container
    const portfolioContainer = portfolioSection.querySelector('.portfolio-grid');
    if (!portfolioContainer) return;
    
    // Show loading state
    portfolioContainer.innerHTML = '<div class="loading">Loading our work...</div>';
    
    // Fetch portfolio items from API
    fetch('/api/portfolio')
      .then(response => response.json())
      .then(items => {
        // Clear loading state
        portfolioContainer.innerHTML = '';
        
        // Add portfolio items
        items.forEach(item => {
          const portfolioItem = document.createElement('div');
          portfolioItem.className = 'portfolio-item';
          portfolioItem.innerHTML = `
            <div class="portfolio-thumbnail">
              <img src="${item.thumbnailUrl}" alt="${item.title}">
              <div class="portfolio-overlay">
                <h3>${item.title}</h3>
                <p>${item.category}</p>
                <button class="btn watch-video" data-video="${item.videoUrl}">Watch Video</button>
              </div>
            </div>
            <div class="portfolio-info">
              <h4>${item.title}</h4>
              <p>${item.description}</p>
            </div>
          `;
          
          portfolioContainer.appendChild(portfolioItem);
        });
        
        // Add event listeners for video buttons
        const videoButtons = document.querySelectorAll('.watch-video');
        videoButtons.forEach(button => {
          button.addEventListener('click', function() {
            const videoUrl = this.getAttribute('data-video');
            openVideoModal(videoUrl);
          });
        });
      })
      .catch(error => {
        console.error('Portfolio loading error:', error);
        portfolioContainer.innerHTML = '<div class="error">Error loading portfolio items. Please refresh the page to try again.</div>';
      });
  }
  
  // Function to open video modal
  function openVideoModal(videoUrl) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'video-modal-container';
    
    // Create modal content
    modalContainer.innerHTML = `
      <div class="video-modal-content">
        <span class="close-modal">&times;</span>
        <div class="video-container">
          <video controls autoplay>
            <source src="${videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modalContainer);
    
    // Add event listener for close button
    const closeButton = modalContainer.querySelector('.close-modal');
    closeButton.addEventListener('click', function() {
      document.body.removeChild(modalContainer);
    });
    
    // Close modal when clicking outside
    modalContainer.addEventListener('click', function(e) {
      if (e.target === modalContainer) {
        document.body.removeChild(modalContainer);
      }
    });
  }
  
  // Load portfolio items if section exists
  loadPortfolioItems();
});
