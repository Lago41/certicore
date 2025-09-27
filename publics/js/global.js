/**
 * CertiCore Global JavaScript (vFinal)
 *
 * This script handles all dynamic functionality for the CertiCore website.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Hamburger Menu Functionality ---
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    if (hamburgerMenu && mobileNav) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }

    // --- Sticky Header on Scroll ---
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    // --- Scroll Animation using Intersection Observer ---
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

    // --- Certification Page Filtering ---
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

    // --- Help Center FAQ Filtering ---
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

    // --- Asynchronous Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', (event) => {
            // 1. STOP the browser from navigating to the PHP page
            event.preventDefault(); 

            const formData = new FormData(contactForm);
            const submitButton = contactForm.querySelector('button[type="submit"]');
            
            // 2. Show a "Sending..." message
            formStatus.textContent = "Sending...";
            formStatus.className = 'form-status sending';
            submitButton.disabled = true;

            // 3. Send the data in the background
            fetch(contactForm.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // 4. Receive the response and display the styled message
                formStatus.textContent = data.message;
                formStatus.className = `form-status ${data.status}`; // Applies '.success' or '.error'
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
                // 5. Re-enable the submit button
                submitButton.disabled = false;
            });
        });
    }
});


    // --- 7. Asynchronous Login Form Submission ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const formStatus = loginForm.nextElementSibling; // Get the status div right after the form

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);

            const submitButton = loginForm.querySelector('button[type="submit"]');

            // Show "Signing In..." message
            formStatus.textContent = "Signing In...";
            formStatus.className = 'form-status sending';
            submitButton.disabled = true;

            // Send data to the login.php script
            fetch(loginForm.action, {
                method: 'POST',
                body: formData,
                credentials: 'include' // IMPORTANT: This sends the session cookie
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    // On success, show message and redirect to dashboard
                    formStatus.textContent = "Login successful! Redirecting...";
                    formStatus.className = 'form-status success';
                    
                    // Wait a moment for the user to see the message, then redirect
                    setTimeout(() => {
                        window.location.href = 'student/index.html';
                    }, 1000); // 1-second delay

                } else {
                    // On error, show the message from the server
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