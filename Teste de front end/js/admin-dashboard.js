// Admin Dashboard JavaScript

let currentSection = 'distribuidores';
let currentPage = 1;
let editingId = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function () {
    if (!checkAuth()) return;

    const user = getCurrentUser();
    if (user.role !== 'ADMIN') {
        showToast('Acesso negado', 'error');
        logout();
        return;
    }

    // Load initial data
    loadDistribuidores();

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
    switch (section) {
        case 'distribuidores':
            loadDistribuidores();
            break;
        case 'vendedores':
            loadVendedores();
            break;
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

// Load Distribuidores
// async function loadDistribuidores(page = 1) {
//     try {
//         const data = await DistribuidorAPI.list(page);
//         renderDistribuidoresTable(data.content || data);
//         renderPagination('distribuidores', data.totalPages || 1, page);
//         currentPage = page;
//     } catch (error) {
//         console.error('Error loading distribuidores:', error);
//         document.getElementById('distribuidores-table').innerHTML = 
//             '<tr><td colspan="6" class="text-center">Erro ao carregar dados</td></tr>';
//     }
// }

async function loadDistribuidores(page = 0) {
    console.log('[loadDistribuidores] Chamando com página:', page);

    try {
        const nome = document.getElementById('distribuidor-nome-filter')?.value || '';
        const status = document.getElementById('distribuidor-status-filter')?.value || '';

        const filters = {};
        if (nome) filters.nome = nome;
        if (status) filters.status = status;

        const data = await DistribuidorAPI.list(page, 10, filters);
        const distribuidores = data.content || data;

        if (!distribuidores || distribuidores.length === 0) {
            console.warn('[loadDistribuidores] Nenhum distribuidor encontrado.');
            renderDistribuidoresTable([]);
            renderPagination('distribuidores', 1, page);
            return;
        }

        renderDistribuidoresTable(distribuidores);
        renderPagination('distribuidores', data.totalPages || 1, page);

    } catch (error) {
        console.error('[loadDistribuidores] Erro ao carregar distribuidores:', error);
        document.getElementById('distribuidores-table').innerHTML =
            `<tr><td colspan="6" class="text-center text-error">Erro ao carregar distribuidores.</td></tr>`;
    }
}


// Render Distribuidores Table
function renderDistribuidoresTable(distribuidores) {
    const tbody = document.getElementById('distribuidores-table');

    if (!distribuidores || distribuidores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhum distribuidor encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = distribuidores.map(distribuidor => `
        <tr>
            <td>${distribuidor.id}</td>
            <td>${distribuidor.nome}</td>
            <td class="action-buttons">
                <button class="btn-danger btn-sm" onclick="deleteDistribuidor(${distribuidor.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Delete Distribuidor
async function deleteDistribuidor(id) {
    if (!confirm('Tem certeza que deseja excluir este distribuidor?')) return;

    try {
        await DistribuidorAPI.delete(id);
        showToast('Distribuidor excluído com sucesso', 'success');
        loadDistribuidores(currentPage);
    } catch (error) {
        console.error('Error deleting distribuidor:', error);
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
            <td>${vendedor.distribuidorId || '-'}</td>
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
    } catch (error) {
        console.error('Error deleting vendedor:', error);
    }
}

let produtos = []; // Lista global de produtos, para que você possa acessá-la em qualquer parte do código

// Carregar produtos
async function loadProdutos(page = 0) {
    console.log('[loadProdutos] Chamando com página:', page);

    try {
        const nome = document.getElementById('produto-nome-filter')?.value || '';

        const filters = {};
        if (nome) filters.nome = nome;

        const data = await ProdutoAPI.list(page, 10, filters);
        const produtosListados = data.content || data;

        if (!produtosListados || produtosListados.length === 0) {
            console.warn('[loadProdutos] Nenhum produto encontrado.');
            renderProdutosTable([]);
            renderPagination('produtos', 1, page);
            return;
        }

        // Salva os produtos carregados no estado global
        produtos = produtosListados;

        renderProdutosTable(produtos);
        renderPagination('produtos', data.totalPages || 1, page);

    } catch (error) {
        console.error('[loadProdutos] Erro ao carregar produtos:', error);
        document.getElementById('produtos-table').innerHTML =
            `<tr><td colspan="6" class="text-center text-error">Erro ao carregar produtos.</td></tr>`;
    }
}

// Renderiza a tabela de produtos
function renderProdutosTable(produtos) {
    const tbody = document.getElementById('produtos-table');

    if (!produtos || produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Nenhum produto encontrado</td></tr>';
        return;
    }

    tbody.innerHTML = produtos.map(produto => `
        <tr>
            <td>${produto.id || '-'}</td>
            <td>${produto.codigoProduto || '-'}</td>
            <td>${produto.nome || '-'}</td>
            <td>${produto.categoria || '-'}</td>
            <td>${produto.descricao || '-'}</td>
            <td>${formatCurrency(produto.precoVenda)}</td>
            <td>${formatCurrency(produto.precoCusto)}</td>
            <td>${produto.estoqueAtual != null ? produto.estoqueAtual : '-'}</td>
            <td>${produto.estoqueMinimo != null ? produto.estoqueMinimo : '-'}</td>
            <td>${produto.ncm || '-'}</td>
            <td class="action-buttons">
                <button class="btn-primary btn-sm" onclick="editProduto(${produto.id})">Editar</button>
                <button class="btn-danger btn-sm" onclick="deleteProduto(${produto.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Editar Produto
async function editProduto(id) {
    console.log('[editProduto] Editando produto com ID:', id);

    try {
        // Encontra o produto na lista de produtos já carregados
        const produto = produtos.find(p => p.id === id);

        if (!produto) {
            alert('Produto não encontrado.');
            return;
        }

        // Preenche os campos do modal com os dados do produto
        document.getElementById('produto-modal-title').textContent = 'Editar Produto';
        document.getElementById('produto-id').value = produto.id; // Adicionando o ID do produto
        document.getElementById('produto-codigo').value = produto.codigoProduto || '';
        document.getElementById('produto-nome').value = produto.nome || '';
        document.getElementById('produto-descricao').value = produto.descricao || '';
        document.getElementById('produto-preco-custo').value = produto.precoCusto || '';
        document.getElementById('produto-preco').value = produto.precoVenda || '';
        document.getElementById('produto-estoque').value = produto.estoqueAtual || '';
        document.getElementById('produto-estoque-minimo').value = produto.estoqueMinimo || '';
        document.getElementById('produto-ncm').value = produto.ncm || '';
        document.getElementById('produto-categoria').value = produto.categoria || '';
        document.getElementById('produto-img').value = produto.imgUrl || '';

        // Exibe o modal
        openModal('produto-modal');
    } catch (error) {
        console.error('[editProduto] Erro ao carregar produto:', error);
        alert('Erro ao carregar produto. Tente novamente.');
    }
}

async function saveProdutoEdit() {
    // Pega o ID do produto do campo oculto
    const id = document.getElementById('produto-id').value;

    // Preenche o objeto produto com os novos dados
    const produto = {
        codigoProduto: document.getElementById('produto-codigo').value,
        nome: document.getElementById('produto-nome').value,
        descricao: document.getElementById('produto-descricao').value,
        precoCusto: parseFloat(document.getElementById('produto-preco-custo').value),
        precoVenda: parseFloat(document.getElementById('produto-preco').value),
        estoqueAtual: parseInt(document.getElementById('produto-estoque').value),
        estoqueMinimo: parseInt(document.getElementById('produto-estoque-minimo').value),
        ncm: document.getElementById('produto-ncm').value,
        categoria: document.getElementById('produto-categoria').value,
        imgUrl: document.getElementById('produto-img').value
    };

    try {
        // Chama a API para atualizar o produto
        await ProdutoAPI.update(id, produto); // Atualiza o produto com o ID correto

        // Exibe mensagem de sucesso
        showToast('Produto atualizado com sucesso', 'success');

        // Fecha o modal
        closeModal('produto-modal');

        // Recarrega a lista de produtos para refletir a edição
        loadProdutos();
    } catch (error) {
        console.error('[saveProdutoEdit] Erro ao salvar edição:', error);
        alert('Erro ao atualizar produto. Tente novamente.');
    }
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

// Render Pagination
function renderPagination(entity, totalPages, currentPage) {
    const container = document.getElementById(`${entity}-pagination`);
    if (!container) return;

    container.innerHTML = '';

    if (totalPages <= 1) return;

    const pagination = createPagination(currentPage, totalPages, (page) => {
        switch (entity) {
            case 'distribuidores':
                loadDistribuidores(page);
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
    // Distribuidor Form
    const distribuidorForm = document.getElementById('distribuidor-form');
    distribuidorForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = new FormData(distribuidorForm);
        const data = Object.fromEntries(formData.entries());

        const submitBtn = distribuidorForm.querySelector('button[type="submit"]');
        setLoadingState(submitBtn, true);

        try {
            await DistribuidorAPI.create(data);
            showToast('Distribuidor criado com sucesso', 'success');
            closeModal('distribuidor-modal');
            distribuidorForm.reset();
            loadDistribuidores(currentPage);
        } catch (error) {
            console.error('Error creating distribuidor:', error);
        } finally {
            setLoadingState(submitBtn, false);
        }
    });

    // Produto Form
    const produtoForm = document.getElementById('produto-form');
    produtoForm.addEventListener('submit', async function (e) {
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

// Reset modal on close
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal')) {
        editingId = null;
        document.getElementById('produto-modal-title').textContent = 'Novo Produto';
        clearFieldErrors();
    }
});