// API functions

const API_BASE_URL = 'http://localhost:8080';

// Get authorization header
function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// // Generic API call function
 async function apiCall(endpoint, options = {}) {
     try {
         const url = `${API_BASE_URL}${endpoint}`;
         const config = {
             headers: getAuthHeaders(),
             ...options
         };
        
         const response = await fetch(url, config);
         const data = await response.json();
        
         if (!response.ok) {
             if (response.status === 401) {
                 // Token expired or invalid
                 logout();
                 return;
             }
            
             // Handle different error formats
             if (data.errors) {
                 // Validation errors
                 showFieldErrors(data.errors);
             } else {
                 // Generic errors
                 showToast(data.error || 'Erro na operação', 'error');
             }
            
             throw new Error(data.error || 'API Error');
         }
        
         return data;
     } catch (error) {
         if (error.message !== 'API Error') {
             showToast('Erro de conexão. Tente novamente.', 'error');
         }
        throw error;     }
}

// Cliente API
const ClienteAPI = {
    async list(page = 1, limit = 10, filters = {}) {
        const params = new URLSearchParams({ page, limit, ...filters });
        return apiCall(`/clientes?${params}`);
    },
    
    async create(data) {
        return apiCall('/clientes', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async update(data) {
        return apiCall('/clientes', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },
    
    async delete(id) {
        return apiCall(`/clientes/${id}`, {
            method: 'DELETE'
        });
    }
};

// Distribuidor API
const DistribuidorAPI = {
    async list(page = 1, limit = 10) {
        const params = new URLSearchParams({ page, limit });
        return apiCall(`/distribuidores?${params}`);
    },
    
    async create(data) {
        return apiCall('/distribuidores', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async update(data) {
        return apiCall('/distribuidores', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async delete(id) {
        return apiCall(`/distribuidores/${id}`, {
            method: 'DELETE'
        });
    },
    
    async getComissoes(id, ano, mes) {
        return apiCall(`/distribuidores/comissoes/${id}?ano=${ano}&mes=${mes}`);
    }
};

// Vendedor API
const VendedorAPI = {
    async list(page = 1, limit = 10, filters = {}) {
        const params = new URLSearchParams({ page, limit, ...filters });
        return apiCall(`/vendedores?${params}`);
    },
    
    async create(data) {
        return apiCall('/vendedores', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async update(data) {
        return apiCall('/vendedores', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },
    
    async delete(id) {
        return apiCall(`/vendedores/${id}`, {
            method: 'DELETE'
        });
    },
    
    async getComissoes(ano, mes) {
        return apiCall(`/vendedores/comissoes?ano=${ano}&mes=${mes}`);
    }
};

// Produto API
const ProdutoAPI = {
    async list(page = 1, limit = 10, filters = {}) {
        const params = new URLSearchParams({ page, limit, ...filters });
        return apiCall(`/produtos?${params}`);
    },
    
    async create(data) {
        return apiCall('/produtos', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async update(id, data) {
        return apiCall(`/produtos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    },
    
    async delete(id) {
        return apiCall(`/produtos/${id}`, {
            method: 'DELETE'
        });
    }
};

// Pedido API
const PedidoAPI = {
    async list(page = 1, limit = 10) {
        const params = new URLSearchParams({ page, limit });
        return apiCall(`/pedidos?${params}`);
    },
    
    async create(data) {
        return apiCall('/pedidos', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async finalizar(id) {
        return apiCall(`/pedidos/${id}/finalizar`, {
            method: 'PATCH'
        });
    },
    
    async cancelar(id) {
        return apiCall(`/pedidos/${id}/cancelar`, {
            method: 'PATCH'
        });
    }
};

// User API
const UserAPI = {
    async redefinirSenha(data) {
        return apiCall('/usuarios/redefinir-senha', {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }
};