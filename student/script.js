/**
 * CertiCore Student Dashboard Script (v4)
 * Handles all logic for the new professional student portal.
 * This script securely validates the user's session before rendering any content.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. AUTHENTICATION GUARD & INITIALIZATION ---
    // This runs first. If the user is not logged in, they are immediately
    // booted to the login page, fulfilling the security requirement.
    fetch('https://api.certicore.org/check_session.php', { credentials: 'include' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!data.logged_in) {
                window.location.href = '../login.html';
            } else {
                // If logged in, proceed to build the dynamic page
                initializePortal(data);
            }
        })
        .catch(error => {
            console.error("Authentication check failed:", error);
            // For security, if the API fails, we redirect to login
            document.body.innerHTML = `<p style="padding: 20px;">Session validation failed. Redirecting to login...</p>`;
            window.location.href = '../login.html';
        });

    /**
     * Main function to build the entire portal after user data is fetched.
     * @param {object} userData - The complete user data object from the server.
     */
    function initializePortal(userData) {
        // --- 2. POPULATE DYNAMIC DATA ---
        // Fill in all the placeholders with the real student data.
        const userNameEl = document.getElementById('user-name-placeholder');
        const applicantIdEl = document.getElementById('applicant-id-placeholder');
        const mainContentArea = document.getElementById('main-content-area');
        const coursewareSection = document.getElementById('courseware-section');

        if (userNameEl) {
            userNameEl.textContent = userData.first_name;
        }
        
        if (applicantIdEl && userData.application) {
            applicantIdEl.textContent = userData.application.applicant_id;
        }

        // Populate the main content and right sidebar based on enrollment status
        if (userData.enrolled_courses && userData.enrolled_courses.length > 0) {
            // User IS enrolled in courses
            mainContentArea.innerHTML = `
                <h1>Welcome back, ${userData.first_name}!</h1>
                <p>You are currently enrolled in the following courses. Select a course from the sidebar to begin.</p>
                <div class="welcome-underline"></div>`;

            let courseHtml = `
                <details class="accordion" open>
                    <summary>Current<div class="arrow"></div></summary>`;
            userData.enrolled_courses.forEach(course => {
                // In a real application, this would be a link to the course page
                courseHtml += `<a href="#" class="quick-link">${course.course_code} - ${course.course_name}</a>`;
            });
            courseHtml += `</details>`;
            coursewareSection.innerHTML = courseHtml;

        } else {
            // User is NOT enrolled in any courses
            mainContentArea.innerHTML = `
                <h1>Welcome!</h1>
                <p>You are currently not enrolled in any courses.</p>
                <div class="welcome-underline"></div>`;

            coursewareSection.innerHTML = `
                <details class="accordion" open>
                    <summary>Current<div class="arrow"></div></summary>
                    <p class="no-data">No courses assigned</p>
                </details>
                <details class="accordion">
                    <summary>ACHIEVED<div class="arrow"></div></summary>
                    <p class="no-data">No achieved courses</p>
                </details>
                <details class="accordion">
                    <summary>COMPLETED<div class="arrow"></div></summary>
                    <p class="no-data">No completed courses</p>
                </details>`;
        }

        // --- 3. EVENT LISTENERS FOR INTERACTIVITY ---
        setupProfileDropdown();
        setupLogoutButton();
    }

    /**
     * Sets up the functionality for the profile dropdown menu.
     */
    function setupProfileDropdown() {
        const profileToggle = document.getElementById('profile-toggle');
        const profileDropdown = document.getElementById('profile-dropdown');
        
        if (profileToggle && profileDropdown) {
            profileToggle.addEventListener('click', (event) => {
                // Stop the click from immediately closing the dropdown
                event.stopPropagation();
                profileDropdown.classList.toggle('show');
            });
            // Hide dropdown if clicking anywhere else on the page
            document.addEventListener('click', () => {
                profileDropdown.classList.remove('show');
            });
        }
    }

    /**
     * Attaches the logout functionality to the sign out button.
     */
    function setupLogoutButton() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (event) => {
                event.preventDefault();
                // Note the path is now relative to the API root
                fetch('https://api.certicore.org/logout.php', { credentials: 'include' })
                    .then(() => window.location.href = '../index.html');
            });
        }
    }
});
