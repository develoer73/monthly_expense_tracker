// Check if user is logged in
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'src/pages/login/login.html';
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'src/pages/login/login.html';
}

// Run auth check when page loads
window.onload = checkAuth;
