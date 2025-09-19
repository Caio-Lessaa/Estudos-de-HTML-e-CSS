// Authentication functions

// Parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Erro ao decodificar token:", e);
        return null;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;
    
    try {
        const decoded = parseJwt(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp > currentTime;
    } catch (e) {
        return false;
    }
}

// Get current user info
function getCurrentUser() {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    const decoded = parseJwt(token);
    if (!decoded) return null;
    
    return {
        id: decoded.sub,
        username: decoded.sub,
        role: decoded.authorities ? decoded.authorities[0] : null,
        exp: decoded.exp
    };
}

// Redirect based on role
function redirectToDashboard(role) {
    const dashboards = {
        'ADMIN': 'pages/admin-dashboard.html',
        'DISTRIBUIDOR': 'pages/distribuidor-dashboard.html',
        'VENDEDOR': 'pages/vendedor-dashboard.html',
        'CLIENTE': 'pages/cliente-dashboard.html'
    };
    
    const dashboard = dashboards[role];
    if (dashboard) {
        window.location.href = dashboard;
    } else {
        showToast('Role não reconhecida', 'error');
    }
}

// Login function
async function login(username, password) {
    try {
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save token
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('expiresIn', data.expiresIn);
            
            // Get user role and redirect
            const user = getCurrentUser();
            if (user && user.role) {
                redirectToDashboard(user.role);
            } else {
                throw new Error('Não foi possível determinar a role do usuário');
            }
        } else {
            // Handle login errors
            if (data.errors) {
                showFieldErrors(data.errors);
            } else {
                showToast(data.error || 'Erro ao fazer login', 'error');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Erro de conexão. Tente novamente.', 'error');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('expiresIn');
    window.location.href = '../index.html';
}

// Check authentication on page load
function checkAuth() {
    if (!isAuthenticated()) {
        window.location.href = '../index.html';
        return false;
    }
    return true;
}

// Setup login form
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginForm) {
        // Check if already logged in
        if (isAuthenticated()) {
            const user = getCurrentUser();
            if (user && user.role) {
                redirectToDashboard(user.role);
                return;
            }
        }
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Clear previous errors
            clearFieldErrors();
            
            // Basic validation
            if (!username.trim()) {
                showFieldErrors([{ field: 'username', message: 'Usuário é obrigatório' }]);
                return;
            }
            
            if (!password.trim()) {
                showFieldErrors([{ field: 'password', message: 'Senha é obrigatória' }]);
                return;
            }
            
            // Show loading state
            setLoadingState(loginBtn, true);
            
            try {
                await login(username, password);
            } finally {
                setLoadingState(loginBtn, false);
            }
        });
    }
});

// Auto-logout on token expiration
setInterval(() => {
    if (localStorage.getItem('accessToken') && !isAuthenticated()) {
        logout();
    }
}, 60000); // Check every minute