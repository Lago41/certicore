/**
 * CertiCore Student Dashboard Script
 *
 * Handles session checking and dynamic content population for the new student portal.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    const userNameEl = document.getElementById('user-name');
    const mainContentEl = document.getElementById('main-content-area');
    const logoutBtn = document.getElementById('logout-btn');

    // --- 1. CHECK USER SESSION ---
    function checkUserSession() {
        // Note the ../ path to go up one directory to the API endpoint
        fetch('https://api.certicore.org/check_session.php', { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.logged_in) {
                    // --- USER IS LOGGED IN ---
                    populateDashboard(data);
                } else {
                    // --- USER IS NOT LOGGED IN ---
                    // Redirect back to the main login page
                    window.location.href = '../login.html';
                }
            })
            .catch(error => {
                console.error('Session check failed:', error);
                mainContentEl.innerHTML = '<h1>Error</h1><p>Could not load your information. Please try again later.</p>';
            });
    }

    // --- 2. POPULATE DASHBOARD WITH DATA ---
    function populateDashboard(userData) {
        // Update user name in the header
        if (userNameEl) {
            userNameEl.textContent = userData.first_name;
        }

        // Update the main content area
        if (mainContentEl) {
            mainContentEl.innerHTML = `
                <h1>Welcome!</h1>
                <p class="welcome-message">You are currently not enrolled.</p>
            `;
            // In the future, you can check userData for course info and display it here
        }
    }

    // --- 3. LOGOUT FUNCTIONALITY ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (event) => {
            event.preventDefault();
            fetch('../logout.php', { credentials: 'include' })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'success') {
                        window.location.href = '../index.html'; // Redirect to homepage
                    }
                })
                .catch(error => console.error('Logout failed:', error));
        });
    }

    // --- INITIALIZE THE DASHBOARD ---
    checkUserSession();
});