// Login form validation

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const formError = document.getElementById('form-error');
    
    // Check for server-side error elements
    const serverEmailError = document.getElementById('server-email-error');
    const serverPasswordError = document.getElementById('server-password-error');
    const serverFormError = document.getElementById('server-form-error');

    // Email validation regex pattern
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Minimum password length
    const minPasswordLength = 8;

    // Function to validate email
    function validateEmail() {
        // Skip client-side validation if there's a server-side error already
        if (serverEmailError && serverEmailError.textContent) {
            return false;
        }
        
        const email = emailInput.value.trim();
        
        if (!email) {
            emailError.textContent = 'Email is required';
            emailInput.classList.add('invalid');
            return false;
        } else if (!emailPattern.test(email)) {
            emailError.textContent = 'Please enter a valid email address';
            emailInput.classList.add('invalid');
            return false;
        } else {
            emailError.textContent = '';
            emailInput.classList.remove('invalid');
            return true;
        }
    }

    // Function to validate password
    function validatePassword() {
        // Skip client-side validation if there's a server-side error already
        if (serverPasswordError && serverPasswordError.textContent) {
            return false;
        }
        
        const password = passwordInput.value;
        
        if (!password) {
            passwordError.textContent = 'Password is required';
            passwordInput.classList.add('invalid');
            return false;
        } else if (password.length < minPasswordLength) {
            passwordError.textContent = `Password must be at least ${minPasswordLength} characters`;
            passwordInput.classList.add('invalid');
            return false;
        } else {
            passwordError.textContent = '';
            passwordInput.classList.remove('invalid');
            return true;
        }
    }

    // Clear server-side errors when user starts typing
    emailInput.addEventListener('input', function() {
        if (serverEmailError) serverEmailError.textContent = '';
        validateEmail();
    });
    
    passwordInput.addEventListener('input', function() {
        if (serverPasswordError) serverPasswordError.textContent = '';
        validatePassword();
    });

    // Form submission validation
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            // Clear any previous client-side form errors
            formError.textContent = '';
            
            // Validate all fields
            const isEmailValid = validateEmail();
            const isPasswordValid = validatePassword();
            
            // Check if there are any server-side errors still present
            const hasServerErrors = 
                (serverEmailError && serverEmailError.textContent) ||
                (serverPasswordError && serverPasswordError.textContent) ||
                (serverFormError && serverFormError.textContent);
            
            // If any validation fails, prevent form submission
            if (!isEmailValid || !isPasswordValid || hasServerErrors) {
                event.preventDefault();
                if (!hasServerErrors) {
                    formError.textContent = 'Please correct the errors above';
                }
            }
        });
    }
    
    // Initial validation to show any errors immediately
    if (emailInput.value) validateEmail();
    if (passwordInput.value) validatePassword();
});
