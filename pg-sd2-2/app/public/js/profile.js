// Profile page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Get modal elements
    const modal = document.getElementById('editProfileModal');
    const editBtn = document.getElementById('editProfileBtn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('editProfileForm');

    // Open modal when Edit Profile button is clicked
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            modal.style.display = 'block';
        });
    }

    // Close modal when X is clicked
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Form validation
    if (form) {
        form.addEventListener('submit', function(event) {
            // Get form fields
            const firstName = document.getElementById('firstName');
            const lastName = document.getElementById('lastName');
            const email = document.getElementById('email');
            
            // Simple validation
            let isValid = true;
            
            if (!firstName.value.trim()) {
                isValid = false;
                showError(firstName, 'First name is required');
            } else {
                clearError(firstName);
            }
            
            if (!lastName.value.trim()) {
                isValid = false;
                showError(lastName, 'Last name is required');
            } else {
                clearError(lastName);
            }
            
            if (!email.value.trim()) {
                isValid = false;
                showError(email, 'Email is required');
            } else if (!isValidEmail(email.value)) {
                isValid = false;
                showError(email, 'Please enter a valid email');
            } else {
                clearError(email);
            }
            
            // Prevent form submission if validation fails
            if (!isValid) {
                event.preventDefault();
            }
        });
    }

    // Helper functions
    function showError(input, message) {
        const formGroup = input.parentElement;
        let errorElement = formGroup.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        formGroup.classList.add('error');
    }
    
    function clearError(input) {
        const formGroup = input.parentElement;
        const errorElement = formGroup.querySelector('.error-message');
        
        if (errorElement) {
            errorElement.textContent = '';
        }
        
        formGroup.classList.remove('error');
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
