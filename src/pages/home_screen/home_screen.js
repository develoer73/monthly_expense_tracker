document.addEventListener('DOMContentLoaded', function() {
    // Enhanced authentication check
    if (!sessionStorage.getItem('isLoggedIn') || !sessionStorage.getItem('userId')) {
        window.location.href = '../login/login.html';
        return;
    }

    // Display user info
    const userEmail = sessionStorage.getItem('userEmail');
    const displayName = sessionStorage.getItem('displayName');
    document.getElementById('userEmail').textContent = displayName || userEmail;

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.clear();
        window.location.href = '../login/login.html';
    });

    // Handle navigation
    document.getElementById('addExpenseBtn').addEventListener('click', function() {
        // Add navigation to expense form page
        alert('Navigate to Add Expense page');
    });

    document.getElementById('viewHistoryBtn').addEventListener('click', function() {
        // Add navigation to history page
        alert('Navigate to History page');
    });

    // Mock data - Replace with actual data later
    updateDashboardValues({
        totalExpenses: 1250.00,
        monthlyBudget: 2000.00,
        remaining: 750.00
    });
});

function updateDashboardValues(data) {
    document.getElementById('totalExpenses').textContent = `$${data.totalExpenses.toFixed(2)}`;
    document.getElementById('monthlyBudget').textContent = `$${data.monthlyBudget.toFixed(2)}`;
    document.getElementById('remaining').textContent = `$${data.remaining.toFixed(2)}`;
}
