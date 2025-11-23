document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signup-form');
    const passwordInput = form.querySelector('input[type="password"]');
    const showPasswordIcon = form.querySelector('.password-input img');

    if (showPasswordIcon) {
        showPasswordIcon.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            showPasswordIcon.src = type === 'password' ? 'static/images/show.png' : 'static/images/hide.png';
        });
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const username = form.querySelector('input[placeholder="Full Name"]').value;
        const email = form.querySelector('input[placeholder="Email Address"]').value;
        const password = form.querySelector('input[placeholder="Password"]').value;

        try {
            const response = await fetch('http://127.0.0.1:5000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    username,
                    password
                })
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error('Failed to parse response:', e);
                data = null;
            }

            if (response.ok) {
                alert('Registration successful! Please login to continue.');
                window.location.href = 'Default Login.html';
            } else {
                const errorMessage = data?.message || `Signup failed. Server returned status: ${response.status}`;
                alert(errorMessage);
                console.error('Server response:', data);
            }
        } catch (error) {
            console.error('Connection error:', error);
            alert('Connection failed! Please check if the backend server is running and accessible.');
        }
    });
});


