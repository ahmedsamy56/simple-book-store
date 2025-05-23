// API Configuration
const API_BASE_URL = 'http://localhost:4000';

// DOM Elements
const authButtons = document.getElementById('authButtons');
const showLoginBtn = document.getElementById('showLoginBtn');
const showRegisterBtn = document.getElementById('showRegisterBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userMenu = document.getElementById('userMenu');
const userName = document.getElementById('userName');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const booksList = document.getElementById('booksList');
const bookForm = document.getElementById('bookForm');
const ordersList = document.getElementById('ordersList');
const purchaseForm = document.getElementById('purchaseForm');


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize UI
    initializeUI();

    // Login/Register buttons
    document.getElementById('showLoginBtn').addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        booksList.style.display = 'none';
        bookForm.style.display = 'none';
    });

    document.getElementById('showRegisterBtn').addEventListener('click', () => {
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
        booksList.style.display = 'none';
        bookForm.style.display = 'none';
    });

    // Form submissions
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('registerFormElement').addEventListener('submit', handleRegister);

    // Cancel buttons
    document.getElementById('cancelLoginBtn').addEventListener('click', () => {
        loginForm.style.display = 'none';
    });

    document.getElementById('cancelRegisterBtn').addEventListener('click', () => {
        registerForm.style.display = 'none';
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Add book button
    document.getElementById('addBookBtn').addEventListener('click', () => {
        bookForm.style.display = 'block';
        document.getElementById('bookFormTitle').textContent = 'Add New Book';
        document.getElementById('bookId').value = '';
        document.getElementById('bookFormElement').reset();
    });

    // Cancel book form
    document.getElementById('cancelBookBtn').addEventListener('click', () => {
        bookForm.style.display = 'none';
    });

    // Book form submission
    document.getElementById('bookFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        const bookId = document.getElementById('bookId').value;
        const bookData = {
            title: document.getElementById('bookTitle').value,
            author: document.getElementById('bookAuthor').value,
            publishedDate: document.getElementById('bookPublishedDate').value,
            description: document.getElementById('bookDescription').value,
            price: parseFloat(document.getElementById('bookPrice').value)
        };

        try {
            const accessToken = localStorage.getItem('accessToken');
            const url = bookId ? `${API_BASE_URL}/books/${bookId}` : `${API_BASE_URL}/books`;
            const method = bookId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(bookData)
            });

            if (response.ok) {
                bookForm.style.display = 'none';
                loadBooks();
                showSuccess(bookId ? 'Book updated successfully!' : 'Book added successfully!');
            } else {
                const error = await response.json();
                handleUnauthorized({ status: response.status, message: error.error });
            }
        } catch (error) {
            handleUnauthorized(error);
        }
    });

    // Edit and Delete buttons
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-book')) {
            const bookId = e.target.dataset.id;
            try {
                const accessToken = localStorage.getItem('accessToken');
                const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                if (response.ok) {
                    const book = await response.json();
                    document.getElementById('bookId').value = book._id;
                    document.getElementById('bookTitle').value = book.title;
                    document.getElementById('bookAuthor').value = book.author;
                    document.getElementById('bookPublishedDate').value = book.publishedDate.split('T')[0];
                    document.getElementById('bookDescription').value = book.description;
                    document.getElementById('bookPrice').value = book.price;
                    document.getElementById('bookFormTitle').textContent = 'Edit Book';
                    bookForm.style.display = 'block';
                } else {
                    const error = await response.json();
                    handleUnauthorized({ status: response.status, message: error.error });
                }
            } catch (error) {
                console.error('Error loading book:', error);
                showError('Error loading book. Please try again.');
            }
        } else if (e.target.classList.contains('delete-book')) {
            const bookId = e.target.dataset.id;
            if (confirm('Are you sure you want to delete this book?')) {
                try {
                    const accessToken = localStorage.getItem('accessToken');
                    const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (response.ok) {
                        loadBooks();
                        showSuccess('Book deleted successfully!');
                    } else {
                        const error = await response.json();
                        handleUnauthorized({ status: response.status, message: error.error });
                    }
                } catch (error) {
                    console.error('Error deleting book:', error);
                    showError('Error deleting book. Please try again.');
                }
            }
        }
    });

    // View Orders button (admin)
    document.getElementById('viewOrdersBtn')?.addEventListener('click', () => {
        booksList.style.display = 'none';
        ordersList.style.display = 'block';
        loadOrders();
    });

    // Back to Books button
    document.getElementById('backToBooksBtn')?.addEventListener('click', () => {
        ordersList.style.display = 'none';
        booksList.style.display = 'block';
    });

    // Cancel Purchase button
    document.getElementById('cancelPurchaseBtn')?.addEventListener('click', () => {
        purchaseForm.style.display = 'none';
        booksList.style.display = 'block';
    });

    // Purchase form submission
    document.getElementById('purchaseFormElement')?.addEventListener('submit', handlePurchase);

    // Buy Now button click
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('buy-book')) {
            const bookId = e.target.dataset.id;
            document.getElementById('purchaseBookId').value = bookId;
            booksList.style.display = 'none';
            purchaseForm.style.display = 'block';
        }
    });

    // View My Orders button (user)
    document.getElementById('viewMyOrdersBtn')?.addEventListener('click', () => {
        booksList.style.display = 'none';
        ordersList.style.display = 'block';
        loadOrders();
    });

    // View Analysis button (admin)
    document.getElementById('viewAnalysisBtn')?.addEventListener('click', async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/books/analysis/stats`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                displayAnalysis(data);
                const analysisModal = new bootstrap.Modal(document.getElementById('analysisModal'));
                analysisModal.show();
            } else {
                const error = await response.json();
                handleUnauthorized({ status: response.status, message: error.error });
            }
        } catch (error) {
            console.error('Error loading analysis:', error);
            showError('Error loading analysis data. Please try again.');
        }
    });

    // Create Admin button
    document.getElementById('createAdminBtn')?.addEventListener('click', () => {
        booksList.style.display = 'none';
        document.getElementById('createAdminForm').style.display = 'block';
    });

    // Cancel Create Admin button
    document.getElementById('cancelCreateAdminBtn')?.addEventListener('click', () => {
        document.getElementById('createAdminForm').style.display = 'none';
        booksList.style.display = 'block';
    });

    // Create Admin form submission
    document.getElementById('createAdminFormElement')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('adminPassword').value;
        const confirmPassword = document.getElementById('adminConfirmPassword').value;
        
        if (password !== confirmPassword) {
            showError('Passwords do not match!');
            return;
        }

        const adminData = {
            firstName: document.getElementById('adminFirstName').value,
            lastName: document.getElementById('adminLastName').value,
            email: document.getElementById('adminEmail').value,
            mobileNumber: document.getElementById('adminMobileNumber').value,
            gender: document.querySelector('input[name="adminGender"]:checked').value,
            password: password,
            confirmPassword: confirmPassword,
            role: 'admin'
        };

        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(adminData)
            });

            if (response.ok) {
                document.getElementById('createAdminForm').style.display = 'none';
                booksList.style.display = 'block';
                showSuccess('Admin user created successfully!');
                document.getElementById('createAdminFormElement').reset();
            } else {
                const error = await response.json();
                handleUnauthorized({ status: response.status, message: error.error });
            }
        } catch (error) {
            console.error('Error creating admin:', error);
            showError('Error creating admin user. Please try again.');
        }
    });
});

// Initialize UI based on authentication state
function initializeUI() {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    if (accessToken && refreshToken) {
        // User is logged in
        showLoginBtn.style.display = 'none';
        showRegisterBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        
        // Display user name and role
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) {
            userNameElement.textContent = `Welcome, ${userName || 'User'}`;
        }
        
        if (userRoleElement) {
            userRoleElement.textContent = userRole === 'admin' ? 'Administrator' : 'User';
            userRoleElement.className = `badge ${userRole === 'admin' ? 'bg-danger' : 'bg-info'} me-2`;
        }
        
        booksList.style.display = 'block';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        bookForm.style.display = 'none';
        
        // Show/hide admin controls
        const adminControls = document.getElementById('adminControls');
        const userControls = document.getElementById('userControls');
        if (adminControls) {
            adminControls.style.display = userRole === 'admin' ? 'block' : 'none';
        }
        if (userControls) {
            userControls.style.display = userRole === 'user' ? 'block' : 'none';
        }
        
        loadBooks();
    } else {
        // User is not logged in
        authButtons.style.display = 'flex';
        logoutBtn.style.display = 'none';
        userMenu.style.display = 'none';
        booksList.style.display = 'none';
        bookForm.style.display = 'none';
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            // Store tokens and user information
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userId', data.userId);
            
            // Refresh the page after successful login
            window.location.reload();
        } else {
            showError(data.error || 'Login failed');
        }
    } catch (error) {
        showError('Login failed: ' + error.message);
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    const firstName = document.getElementById('registerFirstName').value;
    const lastName = document.getElementById('registerLastName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const mobileNumber = document.getElementById('registerMobileNumber').value;
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const role = document.getElementById('registerRole').value;

    // Client-side password validation
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                firstName, 
                lastName, 
                email, 
                password,
                confirmPassword,
                mobileNumber,
                gender,
                role
            })
        });

        const data = await response.json();
        if (response.ok) {
            showSuccess('Registration successful! Please login.');
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
        } else {
            showError(data.error || 'Registration failed');
        }
    } catch (error) {
        showError('Registration failed: ' + error.message);
    }
}

// Handle logout
async function handleLogout() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshToken}`
                }
            });
        }
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        // Refresh the page after logout
        window.location.reload();
    }
}

// Load books
async function loadBooks() {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/books`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const books = await response.json();
            displayBooks(books);
        } else if (response.status === 401) {
            await refreshAccessToken();
            loadBooks();
        } else {
            showError('Failed to load books');
        }
    } catch (error) {
        showError('Failed to load books: ' + error.message);
    }
}

// Refresh access token
async function refreshAccessToken() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await fetch(`${API_BASE_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
        } else {
            throw new Error('Failed to refresh token');
        }
    } catch (error) {
        handleLogout();
        throw error;
    }
}

// Display books
function displayBooks(books) {
    const booksContainer = document.getElementById('booksContainer');
    const userRole = localStorage.getItem('userRole');
    booksContainer.innerHTML = '';
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'col-md-4 mb-4';
        bookCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${book.author}</h6>
                    <p class="card-text">${book.description}</p>
                    <p class="card-text"><small class="text-muted">Published: ${new Date(book.publishedDate).toLocaleDateString()}</small></p>
                    <p class="card-text"><strong class="text-primary">Price: $${book.price.toFixed(2)}</strong></p>
                    ${userRole === 'admin' ? `
                    <div class="btn-group">
                        <button class="btn btn-sm btn-primary edit-book" data-id="${book._id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger delete-book" data-id="${book._id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                    ` : `
                    <button class="btn btn-primary buy-book" data-id="${book._id}">
                        <i class="fas fa-shopping-cart"></i> Buy Now
                    </button>
                    `}
                </div>
            </div>
        `;
        booksContainer.appendChild(bookCard);
    });
}

// Show error message
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').prepend(alert);
    setTimeout(() => alert.remove(), 5000);
}

// Show success message
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').prepend(alert);
    setTimeout(() => alert.remove(), 5000);
}

// Handle unauthorized access
function handleUnauthorized(error) {
    if (error.status === 403) {
        showError('You do not have permission to perform this action. Admin access required.');
    } else {
        showError(error.message || 'An error occurred');
    }
}

// Handle purchase
async function handlePurchase(e) {
    e.preventDefault();
    const bookId = document.getElementById('purchaseBookId').value;
    const quantity = parseInt(document.getElementById('purchaseQuantity').value);
    const userId = localStorage.getItem('userId');
    const deliveryInfo = {
        address: document.getElementById('deliveryAddress').value,
        city: document.getElementById('deliveryCity').value,
        state: document.getElementById('deliveryState').value,
        zipCode: document.getElementById('deliveryZipCode').value,
        phone: document.getElementById('deliveryPhone').value
    };

    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                bookId,
                userId,
                quantity,
                deliveryInfo
            })
        });

        if (response.ok) {
            purchaseForm.style.display = 'none';
            booksList.style.display = 'block';
            showSuccess('Order placed successfully!');
            document.getElementById('purchaseFormElement').reset();
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to place order');
        }
    } catch (error) {
        showError('Error placing order: ' + error.message);
    }
}

// Load orders
async function loadOrders() {
    try {
        const accessToken = localStorage.getItem('accessToken');
        const userRole = localStorage.getItem('userRole');
        const url = userRole === 'admin' ? `${API_BASE_URL}/orders` : `${API_BASE_URL}/orders/my-orders`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (response.ok) {
            const orders = await response.json();
            displayOrders(orders);
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to load orders');
        }
    } catch (error) {
        showError('Error loading orders: ' + error.message);
    }
}

// Display orders
function displayOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    const actionsColumn = document.getElementById('actionsColumn');
    const userRole = localStorage.getItem('userRole');
    
    // Show/hide Actions column based on user role
    if (actionsColumn) {
        actionsColumn.style.display = userRole === 'admin' ? 'table-cell' : 'none';
    }
    
    ordersContainer.innerHTML = '';

    if (orders.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="${userRole === 'admin' ? '8' : '7'}" class="text-center py-4">
                <div class="text-muted">
                    <i class="fas fa-box-open fa-2x mb-3"></i>
                    <p class="mb-0">No orders found</p>
                </div>
            </td>
        `;
        ordersContainer.appendChild(row);
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="fw-bold">${new Date(order.orderDate).toLocaleDateString()}</div>
                <small class="text-muted">${new Date(order.orderDate).toLocaleTimeString()}</small>
            </td>
            <td>
                <div class="fw-bold">${userRole === 'admin' ? `${order.user.firstName} ${order.user.lastName}` : 'You'}</div>
                <small class="text-muted">${order.user.email}</small>
            </td>
            <td>
                <div class="fw-bold">${order.book.title}</div>
                <small class="text-muted">by ${order.book.author}</small>
            </td>
            <td class="text-center">
                <span class="badge bg-secondary">${order.quantity}</span>
            </td>
            <td>
                <div class="fw-bold text-primary">$${order.totalPrice.toFixed(2)}</div>
            </td>
            <td>
                <span class="badge bg-${getStatusBadgeColor(order.status)} px-3 py-2">${order.status}</span>
            </td>
            <td>
                <div class="small">
                    <div class="mb-1">
                        <i class="fas fa-map-marker-alt text-danger me-1"></i>
                        ${order.deliveryInfo.address}
                    </div>
                    <div class="mb-1">
                        <i class="fas fa-city text-info me-1"></i>
                        ${order.deliveryInfo.city}, ${order.deliveryInfo.state} ${order.deliveryInfo.zipCode}
                    </div>
                    <div>
                        <i class="fas fa-phone text-success me-1"></i>
                        ${order.deliveryInfo.phone}
                    </div>
                </div>
            </td>
            ${userRole === 'admin' ? `
            <td>
                <select class="form-select form-select-sm status-select" data-order-id="${order._id}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            ` : ''}
        `;
        ordersContainer.appendChild(row);
    });

    // Add event listeners for status changes (admin only)
    if (userRole === 'admin') {
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', handleStatusChange);
        });
    }
}

// Get status badge color
function getStatusBadgeColor(status) {
    const colors = {
        'pending': 'warning',
        'processing': 'info',
        'shipped': 'primary',
        'delivered': 'success',
        'cancelled': 'danger'
    };
    return colors[status.toLowerCase()] || 'secondary';
}

// Handle status change
async function handleStatusChange(e) {
    const orderId = e.target.dataset.orderId;
    const newStatus = e.target.value;

    try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            showSuccess('Order status updated successfully!');
            loadOrders();
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to update order status');
        }
    } catch (error) {
        showError('Error updating order status: ' + error.message);
    }
}

// Display analysis data in the modal
function displayAnalysis(data) {
    document.getElementById('totalBooks').textContent = data.totalBooks;
    document.getElementById('totalProfit').textContent = `$${data.totalProfit.toFixed(2)}`;
    document.getElementById('totalBooksSold').textContent = data.totalBooksSold;
    document.getElementById('totalUsers').textContent = data.totalUsers;
    document.getElementById('totalAdmins').textContent = data.totalAdmins;
} 