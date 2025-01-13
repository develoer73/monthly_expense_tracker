import { auth, db } from '../../firebase/firebase.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, addDoc, query, orderBy, onSnapshot, where, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Define categories constant
const CATEGORIES = {
    income: [
        { value: 'salary', label: 'Salary', icon: 'fa-money-bill-wave' },
        { value: 'freelance', label: 'Freelance', icon: 'fa-laptop-code' },
        { value: 'investments', label: 'Investments', icon: 'fa-chart-line' },
        { value: 'business', label: 'Business', icon: 'fa-store' },
        { value: 'other-income', label: 'Other Income', icon: 'fa-plus-circle' }
    ],
    expense: [
        { value: 'food', label: 'Food & Dining', icon: 'fa-utensils' },
        { value: 'transport', label: 'Transportation', icon: 'fa-car' },
        { value: 'utilities', label: 'Utilities', icon: 'fa-plug' },
        { value: 'rent', label: 'Rent/Housing', icon: 'fa-home' },
        { value: 'entertainment', label: 'Entertainment', icon: 'fa-film' },
        { value: 'shopping', label: 'Shopping', icon: 'fa-shopping-cart' },
        { value: 'health', label: 'Healthcare', icon: 'fa-medkit' },
        { value: 'education', label: 'Education', icon: 'fa-graduation-cap' },
        { value: 'others', label: 'Others', icon: 'fa-ellipsis-h' }
    ]
};

// Check authentication and initialize
document.addEventListener('DOMContentLoaded', () => {
    // Verify auth state
    if (!auth.currentUser) {
        const userEmail = sessionStorage.getItem('userEmail');
        if (!userEmail) {
            window.location.href = '../login/login.html';
            return;
        }
    }

    // Initialize form
    setupForm();
    listenToTransactions();
});

// Setup form initialization
function setupForm() {
    document.getElementById('transactionDate').valueAsDate = new Date();
    setupTransactionTypeToggle();
}

// Setup transaction type toggle
function setupTransactionTypeToggle() {
    const typeRadios = document.querySelectorAll('input[name="transactionType"]');
    typeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const type = e.target.value;
            const form = document.getElementById('transactionForm');
            form.classList.remove('income-form', 'expense-form');
            form.classList.add(`${type}-form`);
        });
    });
}

// Handle logout
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await signOut(auth);
        sessionStorage.clear();
        window.location.href = '../login/login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Enhanced error handling in form submission
document.getElementById('transactionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

        // Check authentication
        if (!auth.currentUser) {
            throw new Error('Please login to add transactions');
        }

        // Validate form data
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Please enter a valid amount');
        }

        // Get form data
        const transactionDate = new Date(document.getElementById('transactionDate').value);
        const transaction = {
            type: document.querySelector('input[name="transactionType"]:checked').value,
            title: document.getElementById('transactionTitle').value.trim(),
            amount: amount,
            category: document.getElementById('transactionCategory').value,
            date: transactionDate.toISOString(),
            notes: document.getElementById('transactionNotes').value.trim(),
            userId: auth.currentUser.uid,
            createdAt: new Date().toISOString(),
            month: transactionDate.getMonth() + 1,
            year: transactionDate.getFullYear()
        };

        // Save to Firebase
        const docRef = await addDoc(collection(db, 'transactions'), transaction);

        if (!docRef.id) {
            throw new Error('Failed to save transaction');
        }

        // Show success message
        showAlert('Transaction added successfully!', 'success');

        // Reset form
        e.target.reset();
        setupForm();

    } catch (error) {
        console.error('Transaction error:', error);
        showAlert(error.message || 'Failed to add transaction', 'danger');

        if (error.code === 'permission-denied') {
            setTimeout(() => window.location.href = '../login/login.html', 2000);
        }
    } finally {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Add Transaction';
    }
});

// Helper function to show alerts
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const form = document.getElementById('transactionForm');
    form.parentNode.insertBefore(alertDiv, form);

    // Auto dismiss after 3 seconds
    setTimeout(() => alertDiv.remove(), 3000);
}

// Listen for transactions updates
function listenToTransactions() {
    try {
        // Check auth state
        if (!auth.currentUser) {
            console.log('Waiting for authentication...');
            setTimeout(listenToTransactions, 1000);
            return;
        }

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();

        console.log('Setting up transaction listener:', {
            userId: auth.currentUser.uid,
            year: currentYear,
            month: currentMonth
        });

        // Using the indexed query
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', auth.currentUser.uid),
            where('year', '==', currentYear),
            where('month', '==', currentMonth),
            orderBy('date', 'desc')
        );

        // Set up listener with better error handling
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const transactions = [];
                let totalIncome = 0;
                let totalExpenses = 0;

                snapshot.forEach((doc) => {
                    const data = { id: doc.id, ...doc.data() };
                    transactions.push(data);
                    
                    if (data.type === 'income') {
                        totalIncome += data.amount;
                    } else {
                        totalExpenses += data.amount;
                    }
                });

                console.log(`Successfully loaded ${transactions.length} transactions`);
                renderTransactionsList(transactions);
                updateDashboardTotals(totalIncome, totalExpenses);
            },
            (error) => {
                console.error('Transaction query error:', error);
                showAlert('Error loading transactions. Please try again.', 'danger');
            }
        );

        // Cleanup listener
        window.addEventListener('unload', () => unsubscribe());

    } catch (error) {
        console.error('Setup error:', error);
        showAlert('Error setting up transaction listener', 'danger');
    }
}

// Add delete transaction handler
window.deleteTransaction = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
        return;
    }

    try {
        await deleteDoc(doc(db, 'transactions', transactionId));
        showAlert('Transaction deleted successfully', 'success');
    } catch (error) {
        console.error('Error deleting transaction:', error);
        showAlert('Error deleting transaction', 'danger');
    }
};

// Update dashboard totals
function updateDashboardTotals(income, expenses) {
    document.getElementById('totalIncome').textContent = formatCurrency(income);
    document.getElementById('totalExpenses').textContent = formatCurrency(expenses);

    const remaining = income - expenses;
    const remainingElement = document.getElementById('remaining');
    remainingElement.textContent = formatCurrency(remaining);
    remainingElement.className = remaining >= 0 ? 'text-success' : 'text-danger';
}

// Render transactions list
function renderTransactionsList(transactions) {
    const tbody = document.getElementById('transactionsList');
    
    if (!transactions || transactions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No transactions found</td></tr>';
        return;
    }

    tbody.innerHTML = transactions.map(t => {
        const categoryList = CATEGORIES[t.type] || [];
        const category = categoryList.find(cat => cat.value === t.category) || {
            label: t.category,
            icon: 'fa-tag'
        };

        return `
            <tr>
                <td>${new Date(t.date).toLocaleDateString()}</td>
                <td>
                    <span class="badge bg-${t.type === 'income' ? 'success' : 'danger'}">
                        ${t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                    </span>
                </td>
                <td>${t.title}</td>
                <td>
                    <i class="fas ${category.icon} me-2"></i>
                    ${category.label}
                </td>
                <td class="text-${t.type === 'income' ? 'success' : 'danger'} fw-bold text-end">
                    ${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTransaction('${t.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Helper functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Initialize
listenToTransactions();
