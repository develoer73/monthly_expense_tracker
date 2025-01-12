document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Basic validation
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Check admin credentials
    if (email === 'admin@gmail.com' && password === 'admin') {
        // Set session storage
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);
        
        // Redirect to dashboard
        window.location.href = '../../index.html';
    } else {
        alert('Invalid credentials! Please use admin@gmail.com and password: admin');
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
