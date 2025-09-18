// Vendedor Dashboard JavaScript

let currentSection = 'clientes';
let currentPage = 1;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    const user = getCurrentUser();
    if (user.role !== 'VENDEDOR') {
        showToast('Acesso negado', 'error');
        logout();
        return;
    }
    
    // Update user info
    document.getElementById('user-info').textContent = `Logado como: ${user.username}`;
    
    // Load initial data
    loadClientes();
    
    // Setup forms
    setupForms();
});

// Show section
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.content-area').forEach(el => el.classList.add('hidden'));
    
    // Show selected section
    document.getElementById(`${section}-section`).classList.remove('hidden');
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');
    
    currentSection = section;
    currentPage = 1;
    
    // Load data for section
    switch(section) {
        case 'clientes':
            loadClientes();
            break;
        case 'produtos':
            loadProdutos();
            break;
        case 'pedidos':
            loadPedidos();
            break;
    }
}

// Load Clientes
async function loadClientes(page = 1) {
    try {
        const data = await ClienteAPI.list(page);
        renderClientesTable(data.content || data);
        renderPagination('clientes', data.totalPages || 1, page);
        currentPage = page;
    } catch (error) {
        console.error('Error loading clientes:', error);
        document.getElementById('clientes-table').innerHTML = 
            '<tr><td colspan="6" class="text-center">Erro ao carregar dados</td></tr>';
    }
}

// Render Clientes Table
function renderClientesTable(clientes) {
    const tbody = document.getElementById('clientes-table');
    
    if (!clientes || clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum cliente encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = clientes.map(cliente => `
        <tr>
            <td>${cliente.id}</td>
            <td>${cliente.nome}</td>
            <td>${cliente.email}</td>
            <td>${cliente.telefone || '-'}</td>
            <td>${cliente.cpf || '-'}</td>
            <td>${cliente.status || 'Ativo'}</td>
        </tr>
    `).join('');
}

// Load Produtos
async function loadProdutos(page = 1) {
    try {
        const nome = document.getElementById('produto-nome-filter')?.value || '';
        
        const filters = {};
        if (nome) filters.nome = nome;
        
        const data = await ProdutoAPI.list(page, 10, filters);
        renderProdutosTable(data.content || data);
        renderPagination('produtos', data.totalPages || 1, page);
        currentPage = page;
    } catch (error) {
        console.error('Error loading produtos:', error);
        document.getElementById('produtos-table').innerHTML = 
            '<tr><td colspan="5" class="text-center">Erro ao carregar dados</td></tr>';
    }
}

// Render Produtos Table
function renderProdutosTable(produtos) {
    const tbody = document.getElementById('produtos-table');
    
    if (!produtos || produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum produto encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = produtos.map(produto => `
        <tr>
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.descricao || '-'}</td>
            <td>${formatCurrency(produto.preco)}</td>
            <td>${produto.estoque || 0}</td>
        </tr>
    `).join('');
}

// Load Pedidos
async function loadPedidos(page = 1) {
    try {
        const data = await PedidoAPI.list(page);
        renderPedidosTable(data.content || data);
        renderPagination('pedidos', data.totalPages || 1, page);
        currentPage = page;
    } catch (error) {
        console.error('Error loading pedidos:', error);
        document.getElementById('pedidos-table').innerHTML = 
            '<tr><td colspan="5" class="text-center">Erro ao carregar dados</td></tr>';
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
            <td>${pedido.cliente || '-'}</td>
            <td>${formatDate(pedido.data)}</td>
            <td>${formatCurrency(pedido.total)}</td>
            <td>${pedido.status || 'Pendente'}</td>
        </tr>
    `).join('');
}

// Consultar Comissões
async function consultarComissoes() {
    const ano = document.getElementById('comissao-ano').value;
    const mes = document.getElementById('comissao-mes').value;
    
    try {
        const data = await VendedorAPI.getComissoes(ano, mes);
        renderComissoesResult(data);
    } catch (error) {
        console.error('Error loading comissoes:', error);
        document.getElementById('comissoes-result').innerHTML = 
            '<div class="alert alert-danger">Erro ao carregar comissões</div>';
    }
}

// Render Comissões Result
function renderComissoesResult(data) {
    const container = document.getElementById('comissoes-result');
    
    if (!data || (!data.comissoes && !data.total)) {
        container.innerHTML = '<div class="alert alert-info">Nenhuma comissão encontrada para o período selecionado</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="content-area">
            <h3>Minhas Comissões - ${document.getElementById('comissao-mes').selectedOptions[0].text}/${document.getElementById('comissao-ano').value}</h3>
            <div class="form-row">
                <div class="form-col">
                    <strong>Total de Comissões: ${formatCurrency(data.total || 0)}</strong>
                </div>
            </div>
            ${data.comissoes ? `
                <div class="table-container mt-20">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Data</th>
                                <th>Valor Pedido</th>
                                <th>Comissão</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.comissoes.map(comissao => `
                                <tr>
                                    <td>${comissao.pedidoId}</td>
                                    <td>${comissao.cliente || '-'}</td>
                                    <td>${formatDate(comissao.data)}</td>
                                    <td>${formatCurrency(comissao.valorPedido)}</td>
                                    <td>${formatCurrency(comissao.valorComissao)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
        </div>
    `;
}

// Render Pagination
function renderPagination(entity, totalPages, currentPage) {
    const container = document.getElementById(`${entity}-pagination`);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    const pagination = createPagination(currentPage, totalPages, (page) => {
        switch(entity) {
            case 'clientes':
                loadClientes(page);
                break;
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
    // Cliente Form
    const clienteForm = document.getElementById('cliente-form');
    clienteForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(clienteForm);
        const data = Object.fromEntries(formData.entries());
        
        // Basic CPF validation
        if (data.cpf && !isValidCPF(data.cpf)) {
            showFieldErrors([{ field: 'cpf', message: 'CPF inválido' }]);
            return;
        }
        
        const submitBtn = clienteForm.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true);
        
        try {
            await ClienteAPI.create(data);
            showToast('Cliente criado com sucesso', 'success');
            closeModal('cliente-modal');
            clienteForm.reset();
            loadClientes(currentPage);
        } catch (error) {
            console.error('Error creating cliente:', error);
        } finally {
            setLoadingState(submitBtn, false);
        }
    });
    
    // Atualizar Dados Form
    const atualizarDadosForm = document.getElementById('atualizar-dados-form');
    atualizarDadosForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(atualizarDadosForm);
        const data = Object.fromEntries(formData.entries());
        
        const submitBtn = atualizarDadosForm.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true);
        
        try {
            await VendedorAPI.update(data);
            showToast('Dados atualizados com sucesso', 'success');
        } catch (error) {
            console.error('Error updating vendedor:', error);
        } finally {
            setLoadingState(submitBtn, false);
        }
    });
    
    // Redefinir Senha Form
    const redefinirSenhaForm = document.getElementById('redefinir-senha-form');
    redefinirSenhaForm.addEventListener('submit', async function(e) {
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