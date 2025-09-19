// Cliente Dashboard JavaScript (E-commerce)

let currentSection = 'produtos';
let currentPage = 1;
let cart = [];
let currentUser;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuth()) return;

    const user = getCurrentUser();
    currentUser = user.id;
    if (user.role !== 'CLIENTE') {
        showToast('Acesso negado', 'error');
        logout();
        return;
    }

    console.log(currentUser)

    // Load cart from localStorage
    loadCart();

    // Load initial data
    loadProdutos();

    // Setup forms
    setupForms();

    // Setup search
    setupSearch();
});

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('section').forEach(el => el.classList.add('hidden'));

    // Show selected section
    document.getElementById(`${section}-section`).classList.remove('hidden');

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');

    currentSection = section;
    currentPage = 1;

    // Load data for section
    switch (section) {
        case 'produtos':
            loadProdutos();
            break;
        case 'pedidos':
            loadPedidos();
            break;
    }
}

// Setup search
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const produtoFilter = document.getElementById('produto-nome-filter');

    // Sync search inputs
    if (searchInput && produtoFilter) {
        searchInput.addEventListener('input', function () {
            produtoFilter.value = this.value;
        });

        produtoFilter.addEventListener('input', function () {
            searchInput.value = this.value;
        });

        // Search on Enter
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
}

// Search products
function searchProducts() {
    loadProdutos(1);
}

async function loadProdutos(page = 0) {
    console.log('[loadProdutos] Chamando com página:', page);

    try {
        const nome = document.getElementById('produto-nome-filter')?.value || '';

        const filters = {};
        if (nome) filters.nome = nome;

        const data = await ProdutoAPI.list(page, 10, filters);
        const produtos = data.content || data;

        if (!produtos || produtos.length === 0) {
            console.warn('[loadProdutos] Nenhum produto encontrado.');
            renderProdutosTable([]);
            renderPagination('produtos', 1, page);
            return;
        }

        renderProdutosGrid(produtos);
        renderPagination('produtos', data.totalPages || 1, page);

    } catch (error) {
        console.error('[loadProdutos] Erro ao carregar produtos:', error);
        document.getElementById('produtos-table').innerHTML =
            `<tr><td colspan="6" class="text-center text-error">Erro ao carregar produtos.</td></tr>`;
    }
}

// Render Produtos Grid
function renderProdutosGrid(produtos) {
    const grid = document.getElementById('produtos-grid');

    if (!produtos || produtos.length === 0) {
        grid.innerHTML = '<div class="text-center" style="grid-column: 1 / -1;">Nenhum produto encontrado</div>';
        return;
    }

    grid.innerHTML = produtos.map(produto => `
        <div class="product-card" style="position: relative;">
            ${produto.desconto ? `<div class="discount-badge">${produto.desconto}% OFF</div>` : ''}
            
            <div class="product-image">
                ${produto.imgUrl ? `<img src="${produto.imgUrl}" alt="${produto.nome}" style="width: 100%; height: 100%; object-fit: cover;">` : 'Sem imagem'}
            </div>
            
            <div class="product-info">
                <div class="product-title">${produto.nome}</div>
                
                ${produto.precoOriginal ? `
                    <div style="text-decoration: line-through; color: #999; font-size: 0.9rem;">
                        ${formatCurrency(produto.precoVenda)}
                    </div>
                ` : ''}
                
                <div class="product-price">${formatCurrency(produto.precoVenda)}</div>
                
                ${produto.precoParcelado ? `
                    <div style="font-size: 0.8rem; color: #666;">
                        ou 12x de ${formatCurrency(produto.precoParcelado)}
                    </div>
                ` : ''}
                
                <button class="btn-primary" onclick="addToCart(${produto.id}, '${produto.nome}', ${produto.precoVenda})" 
                        style="width: 100%; margin-top: 10px;">
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    `).join('');
}

// Cart functions

function getCartStorageKey() {
    if (!currentUser) {
        return 'cart'; // fallback, mas não recomendado
    }
    return `cart_user_${currentUser}`;
}

function loadCart() {
    const savedCart = getFromStorage(getCartStorageKey());
    if (savedCart) {
        cart = savedCart;
        updateCartDisplay();
    } else {
        cart = [];
        updateCartDisplay();
    }
}

function saveCart() {
    setInStorage(getCartStorageKey(), cart);
}

function addToCart(id, nome, preco) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantidade += 1;
    } else {
        cart.push({
            id: id,
            nome: nome,
            precoVenda: preco,
            quantidade: 1
        });
    }

    saveCart();
    updateCartDisplay();
    showToast('Produto adicionado ao carrinho', 'success');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartDisplay();
    renderCartItems();
}

function updateCartQuantity(id, quantidade) {
    const item = cart.find(item => item.id === id);
    if (item) {
        if (quantidade <= 0) {
            removeFromCart(id);
        } else {
            item.quantidade = quantidade;
            saveCart();
            updateCartDisplay();
            renderCartItems();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantidade, 0);
    cartCount.textContent = totalItems;

    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.precoVenda * item.quantidade), 0);
        cartTotal.textContent = formatCurrency(total);
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    cartSidebar.classList.toggle('open');

    if (cartSidebar.classList.contains('open')) {
        renderCartItems();
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="text-center">Carrinho vazio</div>';
        return;
    }

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.nome}</div>
                <div class="cart-item-price">${formatCurrency(item.precoVenda)}</div>
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantidade - 1})" 
                            style="background: #f0f0f0; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer;">-</button>
                    <span>${item.quantidade}</span>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantidade + 1})" 
                            style="background: #f0f0f0; border: none; width: 25px; height: 25px; border-radius: 50%; cursor: pointer;">+</button>
                    <button onclick="removeFromCart(${item.id})" 
                            style="background: var(--error-color); color: white; border: none; padding: 2px 8px; border-radius: 4px; cursor: pointer; margin-left: auto;">🗑️</button>
                </div>
            </div>
        </div>
    `).join('');
}

async function finalizarCompra() {
    if (cart.length === 0) {
        showToast('Carrinho está vazio', 'warning');
        return;
    }

    try {
        const pedidoData = {
            itens: cart.map(item => ({
                produtoId: item.id,
                quantidade: item.quantidade,
                precoVenda: item.precoVenda
            })),
            total: cart.reduce((sum, item) => sum + (item.precoVenda * item.quantidade), 0)
        };

        await PedidoAPI.create(pedidoData);

        // Clear cart
        cart = [];
        saveCart();
        updateCartDisplay();
        toggleCart();

        showToast('Pedido realizado com sucesso!', 'success');

        // Redirect to orders
        showSection('pedidos');

    } catch (error) {
        console.error('Error creating pedido:', error);
    }
}

// Load Pedidos
async function loadPedidos(page = 0) {
    console.log('[loadPedidos] Chamando com página:', page);

    try {
        const data = await PedidoAPI.list(page);
        const pedidos = data.content || data;

        if (!pedidos || pedidos.length === 0) {
            console.warn('[loadPedidos] Nenhum pedido encontrado.');
            renderPedidosTable([]);
            renderPagination('pedidos', 1, page);
            return;
        }

        renderPedidosTable(pedidos);
        renderPagination('pedidos', data.totalPages || 1, page);

    } catch (error) {
        console.error('[loadPedidos] Erro ao carregar pedidos:', error);
        document.getElementById('pedidos-table').innerHTML =
            `<tr><td colspan="6" class="text-center text-error">Erro ao carregar pedidos.</td></tr>`;
    }
}


// Render Pedidos Table
function renderPedidosTable(pedidos) {
    const tbody = document.getElementById('pedidos-table');

    if (!pedidos || pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum pedido encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = pedidos.map(pedido => `
        <tr>
            <td>${pedido.id}</td>
            <td>${formatDate(pedido.dataPedido)}</td>
            <td>${formatCurrency(pedido.valorTotal)}</td>
            <td>
                <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; 
                      background: ${getStatusColor(pedido.status)}; color: white;">
                    ${pedido.status || 'Pendente'}
                </span>
            </td>
            <td>
                <button class="btn-primary btn-sm" onclick="viewPedidoDetails(${pedido.id})">Ver Detalhes</button>
            </td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    switch (status) {
        case 'FINALIZADO': return '#27ae60';
        case 'CANCELADO': return '#e74c3c';
        case 'PROCESSANDO': return '#f39c12';
        default: return '#6c757d';
    }
}

function viewPedidoDetails(id) {
    showToast('Funcionalidade em desenvolvimento', 'info');
}

// Render Pagination
function renderPagination(entity, totalPages, currentPage) {
    const container = document.getElementById(`${entity}-pagination`);
    if (!container) return;

    container.innerHTML = '';

    if (totalPages <= 1) return;

    const pagination = createPagination(currentPage, totalPages, (page) => {
        switch (entity) {
            case 'produtos':
                loadProdutos(page);
                break;
            case 'pedidos':
                loadPedidos(page);
                break;
        }
    });

    container.appendChild(pagination);
}

// Setup Forms
function setupForms() {
    // Atualizar Perfil Form
    const atualizarPerfilForm = document.getElementById('atualizar-perfil-form');
    atualizarPerfilForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(atualizarPerfilForm);
        const data = Object.fromEntries(formData.entries());

        // Basic CPF validation
        if (data.cpf && !isValidCPF(data.cpf)) {
            showFieldErrors([{ field: 'cpf', message: 'CPF inválido' }]);
            return;
        }

        const submitBtn = atualizarPerfilForm.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true);

        try {
            await ClienteAPI.update(data);
            showToast('Perfil atualizado com sucesso', 'success');
        } catch (error) {
            console.error('Error updating perfil:', error);
        } finally {
            setLoadingState(submitBtn, false);
        }
    });

    // Redefinir Senha Form
    const redefinirSenhaForm = document.getElementById('redefinir-senha-form');
    redefinirSenhaForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(redefinirSenhaForm);
        const data = Object.fromEntries(formData.entries());

        // Validate password confirmation
        if (data.novaSenha !== data.confirmarSenha) {
            showFieldErrors([{ field: 'confirmarSenha', message: 'Senhas não conferem' }]);
            return;
        }

        const submitBtn = redefinirSenhaForm.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true);

        try {
            await UserAPI.redefinirSenha({
                senhaAtual: data.senhaAtual,
                novaSenha: data.novaSenha
            });
            showToast('Senha redefinida com sucesso', 'success');
            redefinirSenhaForm.reset();
        } catch (error) {
            console.error('Error changing password:', error);
        } finally {
            setLoadingState(submitBtn, false);
        }
    });
}

// Close cart when clicking outside
document.addEventListener('click', function (e) {
    const cartSidebar = document.getElementById('cart-sidebar');
    if (cartSidebar.classList.contains('open') && !cartSidebar.contains(e.target) && !e.target.closest('.cart-icon')) {
        toggleCart();
    }
});