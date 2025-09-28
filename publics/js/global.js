/**
 * CertiCore Global JavaScript (Enhanced API Version)
 *
 * This script handles all dynamic functionality for the main CertiCore website.
 * Enhanced with robust API communication to https://api.certicore.org
 * and improved user experience with better error handling and feedback.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- API Configuration ---
    const API_BASE_URL = 'https://api.certicore.org';
    const API_TIMEOUT = 30000; // 30 seconds timeout
    
    // --- Utility Functions ---
    
    // Enhanced fetch with proper headers, timeout, and error handling
    async function apiRequest(url, options = {}) {
        const defaultHeaders = {
            'Accept': 'application/json'
        };
        
        // Don't set Content-Type for FormData (let browser set it with boundary)
        if (options.body instanceof FormData) {
            // FormData will set appropriate Content-Type with boundary
        } else if (options.body && typeof options.body === 'object') {
            defaultHeaders['Content-Type'] = 'application/json';
        }
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // Parse response body before checking if response is ok
            const contentType = response.headers.get('content-type');
            let responseData;
            
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                const text = await response.text();
                try {
                    responseData = JSON.parse(text);
                } catch {
                    responseData = { message: text, status: response.ok ? 'success' : 'error' };
                }
            }
            
            // Now check response status and include server error message if available
            if (!response.ok) {
                const errorMessage = responseData.message || responseData.error || `Server error (${response.status})`;
                throw new Error(errorMessage);
            }
            
            return responseData;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please try again.');
            }
            throw error;
        }
    }
    
    // Show loading state
    function showLoading(button, text = 'Processing...') {
        button.disabled = true;
        button.setAttribute('data-original-html', button.innerHTML);
        button.innerHTML = `<span class="loading-spinner"></span> ${text}`;
    }
    
    // Hide loading state
    function hideLoading(button) {
        button.disabled = false;
        const originalHTML = button.getAttribute('data-original-html');
        if (originalHTML) {
            button.innerHTML = originalHTML;
            button.removeAttribute('data-original-html');
        }
    }
    
    // Display form status messages with better UX
    function showFormStatus(statusElement, message, type = 'info', duration = 5000) {
        statusElement.textContent = message;
        statusElement.className = `form-status ${type}`;
        statusElement.style.display = 'block';
        
        if (type === 'success' && duration > 0) {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, duration);
        }
    }
    
    // Validate email format
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Validate password strength
    function validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        if (password.length < minLength) {
            return { valid: false, message: 'Password must be at least 8 characters long' };
        }
        if (!hasUpperCase || !hasLowerCase) {
            return { valid: false, message: 'Password must contain both uppercase and lowercase letters' };
        }
        if (!hasNumbers) {
            return { valid: false, message: 'Password must contain at least one number' };
        }
        return { valid: true, message: 'Password strength: Good' };
    }

    // --- 1. UI Enhancements ---

    // Enhanced Mobile Hamburger Menu Functionality
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    
    if (hamburgerMenu && mobileNav) {
        // Create overlay element dynamically
        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        document.body.appendChild(overlay);
        
        // Function to open mobile menu
        function openMobileMenu() {
            hamburgerMenu.classList.add('active');
            mobileNav.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
        
        // Function to close mobile menu
        function closeMobileMenu() {
            hamburgerMenu.classList.remove('active');
            mobileNav.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
        
        // Toggle menu when hamburger is clicked
        hamburgerMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mobileNav.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Close menu when overlay is clicked
        overlay.addEventListener('click', closeMobileMenu);
        
        // Close menu when a navigation link is clicked
        const mobileNavLinks = mobileNav.querySelectorAll('a');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Close menu on window resize to larger screen
        window.addEventListener('resize', () => {
            if (window.innerWidth > 1024) {
                closeMobileMenu();
            }
        });
        
        // Close menu on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    }

    // Sticky Header on Scroll
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // Scroll Animation using Intersection Observer
    const animatedElements = document.querySelectorAll('.info-card, .feature-card, .hero-content, .hero-media, .solution-item, .stat-item, .category-card');
    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animatedElements.forEach(element => observer.observe(element));
    }

    // --- 2. ENHANCED FORM SUBMISSIONS WITH API INTEGRATION ---

    // --- Enhanced Registration Form Submission ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const formStatus = document.getElementById('form-status');
        const submitButton = registerForm.querySelector('button[type="submit"]');
        
        // Real-time password validation
        const passwordInput = registerForm.querySelector('#password');
        const confirmPasswordInput = registerForm.querySelector('#confirmPassword');
        
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                const validation = validatePassword(e.target.value);
                const feedback = passwordInput.nextElementSibling;
                if (feedback && feedback.tagName === 'SMALL') {
                    feedback.textContent = validation.message;
                    feedback.className = validation.valid ? 'text-success' : 'text-error';
                }
            });
        }
        
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', (e) => {
                const password = passwordInput?.value || '';
                const confirmPassword = e.target.value;
                const feedback = e.target.nextElementSibling;
                
                if (feedback && feedback.tagName === 'SMALL') {
                    if (confirmPassword && password !== confirmPassword) {
                        feedback.textContent = 'Passwords do not match';
                        feedback.className = 'text-error';
                    } else if (confirmPassword && password === confirmPassword) {
                        feedback.textContent = 'Passwords match';
                        feedback.className = 'text-success';
                    } else {
                        feedback.textContent = '';
                    }
                }
            });
        }
        
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Client-side validation
            const email = registerForm.querySelector('#email')?.value;
            const password = passwordInput?.value;
            const confirmPassword = confirmPasswordInput?.value;
            
            if (email && !isValidEmail(email)) {
                showFormStatus(formStatus, 'Please enter a valid email address.', 'error');
                return;
            }
            
            if (password && confirmPassword && password !== confirmPassword) {
                showFormStatus(formStatus, 'Passwords do not match.', 'error');
                return;
            }
            
            if (password) {
                const passwordValidation = validatePassword(password);
                if (!passwordValidation.valid) {
                    showFormStatus(formStatus, passwordValidation.message, 'error');
                    return;
                }
            }
            
            const termsCheckbox = registerForm.querySelector('input[name="terms"]');
            if (termsCheckbox && !termsCheckbox.checked) {
                showFormStatus(formStatus, 'Please accept the Terms of Service and Privacy Policy.', 'error');
                return;
            }
            
            try {
                const formData = new FormData(registerForm);
                showLoading(submitButton, 'Creating Account...');
                showFormStatus(formStatus, 'Processing your registration...', 'sending');
                
                const data = await apiRequest(registerForm.action, {
                    method: 'POST',
                    body: formData
                });
                
                hideLoading(submitButton);
                
                if (data.status === 'success') {
                    showFormStatus(formStatus, data.message || 'Registration successful! Redirecting to login...', 'success');
                    
                    // Clear form
                    registerForm.reset();
                    
                    // Redirect to portal login page
                    setTimeout(() => {
                        window.location.href = 'https://portal.certicore.org/login.php';
                    }, 2000);
                } else {
                    showFormStatus(formStatus, data.message || 'Registration failed. Please try again.', 'error');
                }
            } catch (error) {
                hideLoading(submitButton);
                console.error('Registration Error:', error);
                
                let errorMessage = 'A network error occurred. Please check your connection and try again.';
                if (error.message.includes('timeout')) {
                    errorMessage = 'Request timeout. Please try again.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Server error. Please try again later.';
                } else if (error.message.includes('400')) {
                    errorMessage = 'Invalid registration data. Please check your information.';
                }
                
                showFormStatus(formStatus, errorMessage, 'error');
            }
        });
    }

    // --- Enhanced Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formStatus = document.getElementById('form-status');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            // Client-side validation
            const email = contactForm.querySelector('#email')?.value;
            const name = contactForm.querySelector('#name')?.value;
            const message = contactForm.querySelector('#message')?.value;
            
            if (!name || name.trim().length < 2) {
                showFormStatus(formStatus, 'Please enter your full name.', 'error');
                return;
            }
            
            if (email && !isValidEmail(email)) {
                showFormStatus(formStatus, 'Please enter a valid email address.', 'error');
                return;
            }
            
            if (!message || message.trim().length < 10) {
                showFormStatus(formStatus, 'Please enter a message with at least 10 characters.', 'error');
                return;
            }
            
            try {
                const formData = new FormData(contactForm);
                showLoading(submitButton, 'Sending Message...');
                showFormStatus(formStatus, 'Sending your message...', 'sending');
                
                const data = await apiRequest(contactForm.action, {
                    method: 'POST',
                    body: formData
                });
                
                hideLoading(submitButton);
                
                if (data.status === 'success') {
                    showFormStatus(formStatus, data.message || 'Message sent successfully! We\'ll get back to you soon.', 'success');
                    contactForm.reset();
                } else {
                    showFormStatus(formStatus, data.message || 'Failed to send message. Please try again.', 'error');
                }
            } catch (error) {
                hideLoading(submitButton);
                console.error('Contact Form Error:', error);
                
                let errorMessage = 'Failed to send message. Please check your connection and try again.';
                if (error.message.includes('timeout')) {
                    errorMessage = 'Request timeout. Please try again.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Server error. Please try again later or contact us directly.';
                }
                
                showFormStatus(formStatus, errorMessage, 'error');
            }
        });
    }

    // --- Enhanced Job Application Form Submission ---
    const jobApplicationForm = document.getElementById('job-application-form');
    if (jobApplicationForm) {
        const formStatus = document.getElementById('form-status');
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        const submitButton = jobApplicationForm.querySelector('button[type="submit"]');
        
        // File input handlers with validation
        ['resume', 'video'].forEach(id => {
            const input = document.getElementById(id);
            const fileNameEl = document.getElementById(`${id}-file-name`);
            if(input && fileNameEl) {
                input.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        // File size validation (10MB limit)
                        const maxSize = 10 * 1024 * 1024; // 10MB
                        if (file.size > maxSize) {
                            showFormStatus(formStatus, `File ${file.name} is too large. Maximum size is 10MB.`, 'error');
                            input.value = '';
                            fileNameEl.textContent = 'No file chosen';
                            return;
                        }
                        
                        // File type validation
                        const allowedTypes = {
                            'resume': ['pdf', 'doc', 'docx'],
                            'video': ['mp4', 'mov', 'avi', 'mkv']
                        };
                        
                        const fileExtension = file.name.split('.').pop().toLowerCase();
                        if (!allowedTypes[id].includes(fileExtension)) {
                            showFormStatus(formStatus, `Invalid file type for ${id}. Allowed: ${allowedTypes[id].join(', ')}`, 'error');
                            input.value = '';
                            fileNameEl.textContent = 'No file chosen';
                            return;
                        }
                        
                        fileNameEl.textContent = file.name;
                        formStatus.style.display = 'none'; // Clear any previous errors
                    } else {
                        fileNameEl.textContent = 'No file chosen';
                    }
                });
            }
        });

        jobApplicationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Client-side validation
            const email = this.querySelector('input[type="email"]')?.value;
            const name = this.querySelector('input[name*="name"]')?.value;
            const position = this.querySelector('select[name*="position"]')?.value;
            
            if (!name || name.trim().length < 2) {
                showFormStatus(formStatus, 'Please enter your full name.', 'error');
                return;
            }
            
            if (email && !isValidEmail(email)) {
                showFormStatus(formStatus, 'Please enter a valid email address.', 'error');
                return;
            }
            
            if (!position) {
                showFormStatus(formStatus, 'Please select a position you\'re applying for.', 'error');
                return;
            }
            
            const formData = new FormData(this);
            
            // Show progress container
            if (progressContainer) {
                progressContainer.style.display = 'block';
                progressBar.style.width = '0%';
            }
            
            showLoading(submitButton, 'Uploading Application...');
            showFormStatus(formStatus, 'Uploading your application...', 'sending');

            const xhr = new XMLHttpRequest();
            
            // Set timeout for large file uploads
            xhr.timeout = 120000; // 2 minutes for file uploads
            
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && progressBar) {
                    const percentComplete = ((e.loaded / e.total) * 100).toFixed(1);
                    progressBar.style.width = percentComplete + '%';
                    
                    // Update status with progress
                    if (percentComplete < 100) {
                        showFormStatus(formStatus, `Uploading... ${percentComplete}%`, 'sending');
                    }
                }
            });
            
            xhr.onload = function() {
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
                hideLoading(submitButton);
                
                try {
                    const data = JSON.parse(xhr.responseText);
                    
                    if (data.status === 'success') {
                        showFormStatus(formStatus, data.message || 'Application submitted successfully! We\'ll review it and get back to you.', 'success');
                        jobApplicationForm.reset();
                        
                        // Reset file name displays
                        ['resume', 'video'].forEach(id => {
                            const fileNameEl = document.getElementById(`${id}-file-name`);
                            if (fileNameEl) fileNameEl.textContent = 'No file chosen';
                        });
                    } else {
                        showFormStatus(formStatus, data.message || 'Failed to submit application. Please try again.', 'error');
                    }
                } catch (error) {
                    showFormStatus(formStatus, 'Server response error. Please try again.', 'error');
                }
            };
            
            xhr.onerror = function() {
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
                hideLoading(submitButton);
                showFormStatus(formStatus, 'Network error occurred. Please check your connection and try again.', 'error');
            };
            
            xhr.ontimeout = function() {
                if (progressContainer) {
                    progressContainer.style.display = 'none';
                }
                hideLoading(submitButton);
                showFormStatus(formStatus, 'Upload timeout. Please try again with smaller files or better connection.', 'error');
            };
            
            xhr.open('POST', this.action, true);
            xhr.send(formData);
        });
    }
});
