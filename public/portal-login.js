// In portal-login.js

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('portal-login-form');
    const accessCodeInput = document.getElementById('access-code');
    const errorMessage = document.getElementById('login-error-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = ''; // Clear previous errors
        const accessCode = accessCodeInput.value.trim();

        if (!accessCode) {
            errorMessage.textContent = 'Please enter an access code.';
            return;
        }

        try {
            // FIX: Use relative URL
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ accessCode }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle errors from the server (e.g., 401 Invalid Code)
                errorMessage.textContent = data.message || 'Login failed. Please check your code.';
            } else {
                // --- SUCCESS ---
                // Save the token and role to the browser's local storage
                localStorage.setItem('zenith-portal-token', data.token);
                localStorage.setItem('zenith-user-role', data.role);

                // Redirect to the appropriate portal page based on the role
                if (data.role === 'parent') {
                    window.location.href = 'portal.html';
                } else { // role === 'student'
                    window.location.href = 'student-portal.html';
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMessage.textContent = 'An error occurred. Please try again later.';
        }
    });
});