// Distribuidor Dashboard JavaScript

let currentSection = 'clientes';
let currentPage = 1;
let editingId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    
    const user = getCurrentUser();
    if (user.role !== 'DISTRIBUIDOR') {
        showToast('Acesso negado', 'error');
        logout();
        return;
    }
    
    // Update user info
    document.getElementById('user-info').textContent = `Logado como: ${user.username}`;
    
    // Load initial data
    loadClientes();
    loadVendedoresForSelect();
    
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
        case 'vendedores':
            loadVendedores();
            break;
        case 'produtos':
            loadProdutos();
            break;
        case 'pedidos':
            loadPedidos();
            break;
    }
}

// // Load Clientes
// async function loadClientes(page = 1) {
//     try {
//         const data = await ClienteAPI.list(page);
//         renderClientesTable(data.content || data);
//         renderPagination('clientes', data.totalPages || 1, page);
//         currentPage = page;
//     } catch (error) {
//         console.error('Error loading clientes:', error);
//         document.getElementById('clientes-table').innerHTML = 
//             '<tr><td colspan="6" class="text-center">Erro ao carregar dados</td></tr>';
//     }
// }

async function loadClientes(page = 0) {
    console.log('[loadClientes] Chamando com página:', page);

    try {
        const data = await ClienteAPI.list(page);
        const clientes = data.content || data;

        if (!clientes || clientes.length === 0) {
            console.warn('[loadClientes] Nenhum cliente encontrado.');
            renderClientesTable([]);
            renderPagination('clientes', 1, page);
            return;
        }

        renderClientesTable(clientes);
        renderPagination('clientes', data.totalPages || 1, page);

    } catch (error) {
        console.error('[loadClientes] Erro ao carregar clientes:', error);
        document.getElementById('clientes-table').innerHTML = 
            `<tr><td colspan="6" class="text-center text-error">Erro ao carregar clientes.</td></tr>`;
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
            <td>${cliente.status || 'Ativo'}</td>
            <td class="action-buttons">
                <button class="btn-danger btn-sm" onclick="deleteCliente(${cliente.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Delete Cliente
async function deleteCliente(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
        await ClienteAPI.delete(id);
        showToast('Cliente excluído com sucesso', 'success');
        loadClientes(currentPage);
    } catch (error) {
        console.error('Error deleting cliente:', error);
    }
}

// // Load Vendedores
// async function loadVendedores(page = 1) {
//     try {
//         const nome = document.getElementById('vendedor-nome-filter')?.value || '';
//         const status = document.getElementById('vendedor-status-filter')?.value || '';
        
//         const filters = {};
//         if (nome) filters.nome = nome;
//         if (status) filters.status = status;
        
//         const data = await VendedorAPI.list(page, 10, filters);
//         renderVendedoresTable(data.content || data);
//         renderPagination('vendedores', data.totalPages || 1, page);
//         currentPage = page;
//     } catch (error) {
//         console.error('Error loading vendedores:', error);
//         document.getElementById('vendedores-table').innerHTML = 
//             '<tr><td colspan="6" class="text-center">Erro ao carregar dados</td></tr>';
//     }
// }

async function loadVendedores(page = 0) {
    console.log('[loadVendedores] Chamando com página:', page);

    try {
        const nome = document.getElementById('vendedor-nome-filter')?.value || '';
        const status = document.getElementById('vendedor-status-filter')?.value || '';

        const filters = {};
        if (nome) filters.nome = nome;
        if (status) filters.status = status;

        const data = await VendedorAPI.list(page, 10, filters);
        const vendedores = data.content || data;

        if (!vendedores || vendedores.length === 0) {
            console.warn('[loadVendedores] Nenhum vendedor encontrado.');
            renderVendedoresTable([]);
            renderPagination('vendedores', 1, page);
            return;
        }

        renderVendedoresTable(vendedores);
        renderPagination('vendedores', data.totalPages || 1, page);

    } catch (error) {
        console.error('[loadVendedores] Erro ao carregar vendedores:', error);
        document.getElementById('vendedores-table').innerHTML =
            `<tr><td colspan="6" class="text-center text-error">Erro ao carregar vendedores.</td></tr>`;
    }
}


// Load Vendedores for Select
async function loadVendedoresForSelect() {
    try {
        const data = await VendedorAPI.list(1, 100);
        const select = document.getElementById('vendedor-comissao-select');
        
        select.innerHTML = '<option value="">Selecione um vendedor</option>';
        
        if (data.content || data) {
            const vendedores = data.content || data;
            vendedores.forEach(vendedor => {
                const option = document.createElement('option');
                option.value = vendedor.id;
                option.textContent = vendedor.nome;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading vendedores for select:', error);
    }
}

// Render Vendedores Table
function renderVendedoresTable(vendedores) {
    const tbody = document.getElementById('vendedores-table');
    
    if (!vendedores || vendedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum vendedor encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = vendedores.map(vendedor => `
        <tr>
            <td>${vendedor.id}</td>
            <td>${vendedor.nome}</td>
            <td>${vendedor.email}</td>
            <td>${vendedor.status || 'Ativo'}</td>
            <td>${formatDate(vendedor.dataCadastro) || '-'}</td>
            <td class="action-buttons">
                <button class="btn-danger btn-sm" onclick="deleteVendedor(${vendedor.id})">Desativar</button>
            </td>
        </tr>
    `).join('');
}

// Delete Vendedor
async function deleteVendedor(id) {
    if (!confirm('Tem certeza que deseja desativar este vendedor?')) return;
    
    try {
        await VendedorAPI.delete(id);
        showToast('Vendedor desativado com sucesso', 'success');
        loadVendedores(currentPage);
        loadVendedoresForSelect(); // Update select options
    } catch (error) {
        console.error('Error deleting vendedor:', error);
    }
}

// // Load Produtos
// async function loadProdutos(page = 1) {
//     try {
//         const nome = document.getElementById('produto-nome-filter')?.value || '';
        
//         const filters = {};
//         if (nome) filters.nome = nome;
        
//         const data = await ProdutoAPI.list(page, 10, filters);
//         renderProdutosTable(data.content || data);
//         renderPagination('produtos', data.totalPages || 1, page);
//         currentPage = page;
//     } catch (error) {
//         console.error('Error loading produtos:', error);
//         document.getElementById('produtos-table').innerHTML = 
//             '<tr><td colspan="6" class="text-center">Erro ao carregar dados</td></tr>';
//     }
// }

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

        renderProdutosTable(produtos);
        renderPagination('produtos', data.totalPages || 1, page);

    } catch (error) {
        console.error('[loadProdutos] Erro ao carregar produtos:', error);
        document.getElementById('produtos-table').innerHTML =
            `<tr><td colspan="6" class="text-center text-error">Erro ao carregar produtos.</td></tr>`;
    }
}


// Render Produtos Table
function renderProdutosTable(produtos) {
    const tbody = document.getElementById('produtos-table');
    
    if (!produtos || produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum produto encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = produtos.map(produto => `
        <tr>
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>${produto.descricao || '-'}</td>
            <td>${formatCurrency(produto.precoVenda)}</td>
            <td>${produto.estoque || 0}</td>
            <td class="action-buttons">
                <button class="btn-primary btn-sm" onclick="editProduto(${produto.id})">Editar</button>
                <button class="btn-danger btn-sm" onclick="deleteProduto(${produto.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Edit Produto
function editProduto(id) {
    editingId = id;
    document.getElementById('produto-modal-title').textContent = 'Editar Produto';
    openModal('produto-modal');
}

// Delete Produto
async function deleteProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    try {
        await ProdutoAPI.delete(id);
        showToast('Produto excluído com sucesso', 'success');
        loadProdutos(currentPage);
    } catch (error) {
        console.error('Error deleting produto:', error);
    }
}

// // Load Pedidos
// async function loadPedidos(page = 1) {
//     try {
//         const data = await PedidoAPI.list(page);
//         renderPedidosTable(data.content || data);
//         renderPagination('pedidos', data.totalPages || 1, page);
//         currentPage = page;
//     } catch (error) {
//         console.error('Error loading pedidos:', error);
//         document.getElementById('pedidos-table').innerHTML = 
//             '<tr><td colspan="6" class="text-center">Erro ao carregar dados</td></tr>';
//     }
// }

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
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum pedido encontrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = pedidos.map(pedido => `
        <tr>
            <td>${pedido.id}</td>
            <td>${pedido.cliente.nome || '-'}</td>
            <td>${formatDate(pedido.dataPedido)}</td>
            <td>${formatCurrency(pedido.valorTotal)}</td>
            <td>${pedido.status || 'Pendente'}</td>
            <td class="action-buttons">
                ${pedido.status !== 'Finalizado' ? `<button class="btn-primary btn-sm" onclick="finalizarPedido(${pedido.id})">Finalizar</button>` : ''}
                ${pedido.status !== 'Cancelado' ? `<button class="btn-danger btn-sm" onclick="cancelarPedido(${pedido.id})">Cancelar</button>` : ''}
            </td>
        </tr>
    `).join('');
}

// Finalizar Pedido
async function finalizarPedido(id) {
    if (!confirm('Tem certeza que deseja finalizar este pedido?')) return;
    
    try {
        await PedidoAPI.finalizar(id);
        showToast('Pedido finalizado com sucesso', 'success');
        loadPedidos(currentPage);
    } catch (error) {
        console.error('Error finalizing pedido:', error);
    }
}

// Cancelar Pedido
async function cancelarPedido(id) {
    if (!confirm('Tem certeza que deseja cancelar este pedido?')) return;
    
    try {
        await PedidoAPI.cancelar(id);
        showToast('Pedido cancelado com sucesso', 'success');
        loadPedidos(currentPage);
    } catch (error) {
        console.error('Error canceling pedido:', error);
    }
}

// // Consultar Comissões
// async function consultarComissoes() {
//     const vendedorId = document.getElementById('vendedor-comissao-select').value;
//     const ano = document.getElementById('comissao-ano').value;
//     const mes = document.getElementById('comissao-mes').value;
    
//     if (!vendedorId) {
//         showToast('Selecione um vendedor', 'warning');
//         return;
//     }
    
//     try {
//         const data = await DistribuidorAPI.getComissoes(vendedorId, ano, mes);
//         renderComissoesResult(data);
//     } catch (error) {
//         console.error('Error loading comissoes:', error);
//         document.getElementById('comissoes-result').innerHTML = 
//             '<div class="alert alert-danger">Erro ao carregar comissões</div>';
//     }
// }

async function loadVendedoresForSelect() {
    console.log('[loadVendedoresForSelect] Carregando vendedores para select');

    try {
        // Chama a API pedindo 100 vendedores na página 1, sem filtros
        const data = await VendedorAPI.list(1, 100, {});

        const vendedores = data.content || data;

        const select = document.getElementById('vendedor-comissao-select');
        if (!select) {
            console.warn('[loadVendedoresForSelect] Select não encontrado');
            return;
        }

        select.innerHTML = '<option value="">Selecione um vendedor</option>';

        if (!vendedores || vendedores.length === 0) {
            console.warn('[loadVendedoresForSelect] Nenhum vendedor encontrado para o select');
            return;
        }

        vendedores.forEach(vendedor => {
            const option = document.createElement('option');
            option.value = vendedor.id;
            option.textContent = vendedor.nome;
            select.appendChild(option);
        });

        console.log('[loadVendedoresForSelect] Vendedores carregados no select:', vendedores.length);
    } catch (error) {
        console.error('[loadVendedoresForSelect] Erro ao carregar vendedores para select:', error);
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
            <h3>Resultado da Consulta de Comissões</h3>
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
                                <th>Data</th>
                                <th>Valor Pedido</th>
                                <th>Comissão</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.comissoes.map(comissao => `
                                <tr>
                                    <td>${comissao.pedidoId}</td>
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
            case 'vendedores':
                loadVendedores(page);
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
    // Vendedor Form
    const vendedorForm = document.getElementById('vendedor-form');
    vendedorForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(vendedorForm);
        const data = Object.fromEntries(formData.entries());
        
        const submitBtn = vendedorForm.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true);
        
        try {
            await VendedorAPI.create(data);
            showToast('Vendedor criado com sucesso', 'success');
            closeModal('vendedor-modal');
            vendedorForm.reset();
            loadVendedores(currentPage);
            loadVendedoresForSelect();
        } catch (error) {
            console.error('Error creating vendedor:', error);
        } finally {
            setLoadingState(submitBtn, false);
        }
    });
    
    // Produto Form
    const produtoForm = document.getElementById('produto-form');
    produtoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(produtoForm);
        const data = Object.fromEntries(formData.entries());
        
        const submitBtn = produtoForm.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true);
        
        try {
            if (editingId) {
                await ProdutoAPI.update(editingId, data);
                showToast('Produto atualizado com sucesso', 'success');
            } else {
                await ProdutoAPI.create(data);
                showToast('Produto criado com sucesso', 'success');
            }
            
            closeModal('produto-modal');
            produtoForm.reset();
            editingId = null;
            loadProdutos(currentPage);
        } catch (error) {
            console.error('Error saving produto:', error);
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

// Reset modal on close
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
        editingId = null;
        document.getElementById('produto-modal-title').textContent = 'Novo Produto';
        clearFieldErrors();
    }
});