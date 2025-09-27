/**
 * CertiCore Global JavaScript (vFinal)
 *
 * This script handles all dynamic functionality for the main CertiCore website.
 * It is configured to communicate with the secure API at https://api.certicore.org
 * and redirect to the student portal at https://portal.certicore.org.
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


    // --- 2. FORM HANDLERS ---

    // --- Asynchronous Login Form Submission ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const formStatus = document.getElementById('form-status');
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const submitButton = loginForm.querySelector('button[type="submit"]');

            formStatus.textContent = "Signing In...";
            formStatus.className = 'form-status sending';
            submitButton.disabled = true;

            fetch('https://api.certicore.org/login.php', {
                method: 'POST',
                body: formData,
                credentials: 'include' // Sends session cookies
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    formStatus.textContent = "Login successful! Redirecting...";
                    formStatus.className = 'form-status success';
                    // CORRECT REDIRECT: Points to the professional student portal.
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
    
    // --- Asynchronous Registration Form Submission ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const formStatus = document.getElementById('form-status');
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // ... (The rest of the registration form logic)
        });
    }

    // --- Asynchronous Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        const formStatus = document.getElementById('form-status');
        // ... (The rest of the contact form logic)
    }

    // --- Asynchronous Job Application Form Submission ---
    const jobApplicationForm = document.getElementById('job-application-form');
    if (jobApplicationForm) {
        // ... (The rest of the job application logic with progress bar)
    }


    // --- 3. PAGE-SPECIFIC WIDGETS ---

    // --- Certification Page Filtering ---
    const filterTabs = document.querySelectorAll('.filter-tabs a');
    const certCards = document.querySelectorAll('.cert-card');
    if (filterTabs.length > 0 && certCards.length > 0) {
        // ... (The rest of the cert filtering logic)
    }

    // --- Help Center FAQ Filtering ---
    const faqSearchInput = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqSearchInput && faqItems.length > 0) {
        // ... (The rest of the FAQ filtering logic)
    }
});
