// Utility functions

// Show toast notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-left: 10px;">&times;</button>
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

// Clear field errors
function clearFieldErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');

    const inputElements = document.querySelectorAll('input.error, select.error');
    inputElements.forEach(el => el.classList.remove('error'));
}

// Show field errors
function showFieldErrors(errors) {
    clearFieldErrors();

    errors.forEach(error => {
        const field = document.getElementById(error.field);
        const errorElement = document.getElementById(`${error.field}-error`);

        if (field) {
            field.classList.add('error');
        }

        if (errorElement) {
            errorElement.textContent = error.message;
        }
    });
}

// Format currency
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Format date
// function formatDate(dateString) {
//     return new Date(dateString).toLocaleDateString('pt-BR');
// }

function formatDate(dateString) {
    if (!dateString || typeof dateString !== 'string') return '-';

    const parts = dateString.split(' ');

    let datePart = parts[0];
    let timePart = parts[1]; // pode ser undefined

    const dateParts = datePart.split('/');
    if (dateParts.length !== 3) return '-';

    const [day, month, year] = dateParts;

    if (!timePart) {
        // Só data
        const date = new Date(`${year}-${month}-${day}T00:00:00`);
        if (isNaN(date.getTime())) {
            console.warn('Data inválida recebida:', dateString);
            return '-';
        }
        // Formata só a data
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    }

    // Data e hora
    const timeParts = timePart.split(':');
    if (timeParts.length !== 2) return '-';

    const [hour, minute] = timeParts;

    const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);

    if (isNaN(date.getTime())) {
        console.warn('Data inválida recebida:', dateString);
        return '-';
    }

    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}


// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Get query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set query parameters
function setQueryParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.pushState({}, '', url);
}

// Validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate CPF (basic)
function isValidCPF(cpf) {
    return cpf && cpf.length === 11 && /^\d+$/.test(cpf);
}

// Show loading state
function setLoadingState(button, loading = true) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');

    if (loading) {
        button.disabled = true;
        button.classList.add('btn-loading');
        if (btnText) btnText.style.display = 'none';
        if (btnLoading) btnLoading.style.display = 'inline';
    } else {
        button.disabled = false;
        button.classList.remove('btn-loading');
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
    }
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Close modal on background click
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
});

// Pagination helper
function createPagination(currentPage, totalPages, onPageChange) {
    const pagination = document.createElement('div');
    pagination.className = 'pagination';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Anterior';
    prevBtn.disabled = currentPage <= 1;
    prevBtn.onclick = () => onPageChange(currentPage - 1);
    pagination.appendChild(prevBtn);

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPage ? 'current-page' : '';
        pageBtn.onclick = () => onPageChange(i);
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Próximo';
    nextBtn.disabled = currentPage >= totalPages;
    nextBtn.onclick = () => onPageChange(currentPage + 1);
    pagination.appendChild(nextBtn);

    return pagination;
}

// Local storage helpers
function getFromStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error getting from storage:', e);
        return null;
    }
}

function setInStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error setting in storage:', e);
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error('Error removing from storage:', e);
    }
}


function aplicarMascaras() {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', (e) => {
            const field = e.target;
            const value = field.value.replace(/\D/g, '');

            switch (field.dataset.mask) {
                case 'cpf':
                    field.value = formatCPF(value);
                    break;
                case 'cnpj':
                    field.value = formatCNPJ(value);
                    break;
                case 'telefone':
                    field.value = formatTelefone(value);
                    break;
                case 'cep':
                    field.value = formatCEP(value);
                    if (value.length === 8) {
                        buscarEnderecoPorCEP(value, field);
                    }
                    break;
            }
        });
    });
}

function formatCPF(cpf) {
    return cpf
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2')
        .slice(0, 14);
}

function formatCNPJ(cnpj) {
    return cnpj
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
}

function formatTelefone(tel) {
    if (tel.length <= 10) {
        return tel
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .slice(0, 14);
    } else {
        return tel
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15);
    }
}

function formatCEP(cep) {
    return cep
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .slice(0, 9);
}

async function buscarEnderecoPorCEP(cep, inputField) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            showToast('CEP não encontrado.', 'warning');
            return;
        }

        preencherCamposEndereco(data, inputField);
    } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        showToast('Erro ao buscar endereço.', 'error');
    }
}

function preencherCamposEndereco(data, inputField) {
    const form = inputField.closest('form');
    if (!form) return;

    const mapping = {
        logradouro: 'rua',
        bairro: 'bairro',
        localidade: 'cidade',
        uf: 'estado'
    };

    for (const [viaCepField, formFieldIdSuffix] of Object.entries(mapping)) {
        const input = form.querySelector(`#vendedor-${formFieldIdSuffix}, #cliente-${formFieldIdSuffix}`);
        if (input) {
            input.value = data[viaCepField] || '';
        }
    }
}

document.addEventListener('DOMContentLoaded', aplicarMascaras);