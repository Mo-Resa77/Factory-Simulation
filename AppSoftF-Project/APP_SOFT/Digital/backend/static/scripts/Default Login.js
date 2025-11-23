document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const passwordField = document.getElementById('password-field');
    const togglePassword = document.getElementById('toggle-password');

    togglePassword.addEventListener('click', function() {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);
        togglePassword.src = type === 'password' ? 'static/images/show.png' : 'static/images/hide.png';
    });

    const googleBtn = document.querySelector('.google-btn');
    if (googleBtn) {
        googleBtn.addEventListener('mouseover', () => {
            googleBtn.style.backgroundColor = '#f0f0f0';
            googleBtn.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        });

        googleBtn.addEventListener('mouseout', () => {
            googleBtn.style.backgroundColor = '#fff';
            googleBtn.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        });
    }

    loginBtn.addEventListener('click', async function(e) {
        e.preventDefault();

        const usernameOrEmail = form.querySelector('input[type="text"]').value;
        const password = passwordField.value;

        try {
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameOrEmail,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                // Save the username to local storage for fetching user-specific data
                localStorage.setItem('currentUsername', data.username);

                if (data.is_admin) {
                    window.location.href = 'admin_dashboard.html';
                } else {
                    window.location.href = 'operator_dashboard.html';
                }
            } else {
                alert(data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});