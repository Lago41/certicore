/**
 * CertiCore Global JavaScript
 *
 * This script handles all dynamic functionality for the CertiCore website,
 * including session management, all form submissions, and UI interactions.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Mobile Hamburger Menu Functionality ---
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
        mobileNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburgerMenu.classList.remove('active');
                mobileNav.classList.remove('active');
            });
        });
    }

    // --- 2. Sticky Header on Scroll ---
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // --- 3. Scroll Animation using Intersection Observer ---
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

    // --- 4. Certification Page Filtering ---
    const filterTabs = document.querySelectorAll('.filter-tabs a');
    const certCards = document.querySelectorAll('.cert-card');
    if (filterTabs.length > 0 && certCards.length > 0) {
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (event) => {
                event.preventDefault();
                const filter = tab.dataset.filter;
                filterTabs.forEach(t => t.parentElement.classList.remove('active'));
                tab.parentElement.classList.add('active');
                certCards.forEach(card => {
                    card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
                });
            });
        });
    }

    // --- 5. Help Center FAQ Filtering ---
    const faqSearchInput = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqSearchInput && faqItems.length > 0) {
        faqSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            faqItems.forEach(item => {
                const textContent = item.textContent.toLowerCase();
                item.style.display = textContent.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }

    // --- 6. Asynchronous Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formStatus = contactForm.querySelector('#form-status') || contactForm.nextElementSibling;
        if (formStatus) {
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
    }

    // --- 7. Asynchronous Login Form Submission ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const formStatus = loginForm.nextElementSibling;
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);

            const submitButton = loginForm.querySelector('button[type="submit"]');
            formStatus.textContent = "Signing In...";
            formStatus.className = 'form-status sending';
            submitButton.disabled = true;
            fetch(loginForm.action, { method: 'POST', body: formData, credentials: 'include' })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        formStatus.textContent = "Login successful! Redirecting...";
                        formStatus.className = 'form-status success';
                        setTimeout(() => {
                            window.location.href = 'https://portal.certicore.org/';
                        }, 1000);
                    } else {
                        formStatus.textContent = data.message;
                        formStatus.className = 'form-status error';
                        submitButton.disabled = false;
                    }
                })
                .catch(error => {
                    console.error('Login Error:', error);
                    formStatus.textContent = 'A network error occurred. Please try again.';
                    formStatus.className = 'form-status error';
                    submitButton.disabled = false;
                });
        });
    }
    
    // --- 8. Asynchronous Job Application Form Submission ---
    const jobApplicationForm = document.getElementById('job-application-form');
    if (jobApplicationForm) {
        const formStatus = document.getElementById('form-status');
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        
        function setupFileInput(inputId) {
            const input = document.getElementById(inputId);
            const fileNameEl = document.getElementById(`${inputId}-file-name`);
            if (input && fileNameEl) {
                input.addEventListener('change', () => {
                    if (input.files.length > 0) {
                        fileNameEl.textContent = input.files[0].name;
                        fileNameEl.style.color = 'var(--text-dark)';
                    } else {
                        fileNameEl.textContent = 'No file chosen';
                        fileNameEl.style.color = 'var(--text-muted)';
                    }
                });
            }
        }
        
        setupFileInput('resume');
        setupFileInput('video');

        jobApplicationForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const formData = new FormData(jobApplicationForm);
            const submitButton = this.querySelector('button[type="submit"]');
            formStatus.textContent = '';
            formStatus.className = 'form-status';
            progressContainer.style.display = 'block';
            progressBar.style.width = '0%';
            submitButton.disabled = true;

            const xhr = new XMLHttpRequest();
            xhr.open('POST', this.action, true);

            xhr.upload.addEventListener('progress', function(e) {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    progressBar.style.width = percentComplete.toFixed(2) + '%';
                }
            });

            xhr.onload = function() {
                progressContainer.style.display = 'none';
                submitButton.disabled = false;
                try {
                    const data = JSON.parse(xhr.responseText);
                    formStatus.textContent = data.message;
                    formStatus.className = `form-status ${data.status}`;
                    if (data.status === 'success') {
                        jobApplicationForm.reset();
                        document.getElementById('resume-file-name').textContent = 'No file chosen';
                        document.getElementById('video-file-name').textContent = 'No file chosen';
                    }
                } catch (e) {
                    formStatus.textContent = 'An unexpected error occurred. Please check the server response.';
                    formStatus.className = 'form-status error';
                }
            };

            xhr.onerror = function() {
                progressContainer.style.display = 'none';
                submitButton.disabled = false;
                formStatus.textContent = 'A network error occurred. Please check your connection and try again.';
                formStatus.className = 'form-status error';
            };

            xhr.send(formData);
        });
    }
});
