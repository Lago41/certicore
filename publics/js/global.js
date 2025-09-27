/**
 * CertiCore Global JavaScript (vFinal)
 *
 * This script handles all dynamic functionality for the main CertiCore website.
 * It is configured to communicate with the secure API at https://api.certicore.org
 * and links to the student portal at https://portal.certicore.org.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. UI Enhancements ---

    // Mobile Hamburger Menu Functionality
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            mobileNav.classList.toggle('active');
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

    // --- 2. ASYNCHRONOUS FORM SUBMISSIONS ---

    // --- Asynchronous Registration Form Submission ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const formStatus = document.getElementById('form-status');
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(registerForm);
            const submitButton = registerForm.querySelector('button[type="submit"]');
            formStatus.textContent = "Processing...";
            formStatus.className = 'form-status sending';
            submitButton.disabled = true;

            fetch(registerForm.action, { method: 'POST', body: formData })
                .then(response => response.json())
                .then(data => {
                    formStatus.textContent = data.message;
                    formStatus.className = `form-status ${data.status}`;
                    if (data.status === 'success') {
                        // On success, redirect to the NEW portal login page
                        setTimeout(() => {
                            window.location.href = 'https://portal.certicore.org/login.php';
                        }, 2000);
                    } else {
                        submitButton.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Registration Error:', error);
                    formStatus.textContent = 'A network error occurred.';
                    formStatus.className = 'form-status error';
                    submitButton.disabled = false;
                });
        });
    }

    // --- Asynchronous Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formStatus = document.getElementById('form-status');
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            formStatus.textContent = "Sending...";
            formStatus.className = 'form-status sending';
            submitButton.disabled = true;
            fetch(contactForm.action, { method: 'POST', body: formData })
                .then(response => response.json())
                .then(data => {
                    formStatus.textContent = data.message;
                    formStatus.className = `form-status ${data.status}`;
                    if (data.status === 'success') {
                        contactForm.reset();
                    }
                })
                .catch(error => {
                    console.error('Submission Error:', error);
                    formStatus.textContent = 'A network error occurred. Please try again.';
                    formStatus.className = 'form-status error';
                })
                .finally(() => {
                    submitButton.disabled = false;
                });
        });
    }

    // --- Asynchronous Job Application Form Submission ---
    const jobApplicationForm = document.getElementById('job-application-form');
    if (jobApplicationForm) {
        // ... (This function remains the same as before)
        const formStatus = document.getElementById('form-status');
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        
        ['resume', 'video'].forEach(id => {
            const input = document.getElementById(id);
            const fileNameEl = document.getElementById(`${id}-file-name`);
            if(input && fileNameEl) {
                input.addEventListener('change', () => { fileNameEl.textContent = input.files.length > 0 ? input.files[0].name : 'No file chosen'; });
            }
        });

        jobApplicationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(jobApplicationForm);
            const submitButton = this.querySelector('button[type="submit"]');
            formStatus.className = 'form-status';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            submitButton.disabled = true;

            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.action, true);
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    progressBar.style.width = ((e.loaded / e.total) * 100).toFixed(2) + '%';
                }
            });
            xhr.onload = function() {
                progressContainer.style.display = 'none';
                submitButton.disabled = false;
                const data = JSON.parse(xhr.responseText);
                formStatus.textContent = data.message;
                formStatus.className = `form-status ${data.status}`;
                if (data.status === 'success') jobApplicationForm.reset();
            };
            xhr.onerror = function() {
                progressContainer.style.display = 'none';
                submitButton.disabled = false;
                formStatus.textContent = 'A network error occurred. Please try again.';
                formStatus.className = 'form-status error';
            };
            xhr.send(formData);
        });
    }
});
