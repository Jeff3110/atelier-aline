// Configuração do Supabase
const SUPABASE_URL = 'https://ojsortnbwvevbscwtmdh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qc29ydG5id3ZldmJzY3d0bWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDg2MjMsImV4cCI6MjA4NzY4NDYyM30.zpKMae0s8OudUgGQdpoVLpHaJ-zefhq77nI0658u6-k';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Elementos da Interface
const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.screen');
const mainContent = document.getElementById('main-content');

// Lógica de Navegação
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetScreen = item.getAttribute('data-screen');

        // Atualizar estado visual da navegação
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        // Trocar tela
        switchScreen(targetScreen);
    });
});

function switchScreen(screenId) {
    // Esconder todas as telas que existirem no momento (incluindo as dinâmicas)
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Mostrar a tela alvo (ou criar se não existir no HTML estático)
    let targetEl = document.getElementById(`screen-${screenId}`);
    if (!targetEl) {
        renderScreen(screenId);
        targetEl = document.getElementById(`screen-${screenId}`);
    }

    if (targetEl) {
        targetEl.classList.add('active');
        // Garantir que a navegação inferior reflita a mudança
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-screen') === screenId) nav.classList.add('active');
        });

        // Recarregar dados
        if (screenId === 'dashboard') updateDashboard();
        if (screenId === 'clientes') fetchClients();
        if (screenId === 'agenda') fetchAgenda();
        if (screenId === 'servicos') fetchServicos();
        if (screenId === 'financeiro') fetchFinanceiro();
    }
}

// Renderização dinâmica de telas (para manter o index.html limpo)
function renderScreen(screenId) {
    let content = '';

    switch (screenId) {
        case 'agenda':
            content = `
                <section id="screen-agenda" class="screen active">
                    <header class="header">
                        <h1 class="brand">Agenda</h1>
                        <p class="greeting">Gerencie seus horários</p>
                    </header>

                    <div class="calendar-controls" style="padding: 0 20px 20px; display: flex; gap: 10px; align-items: center;">
                        <input type="date" id="agenda-date-filter" onchange="fetchAgenda()" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ddd;">
                        <button class="btn-primary" onclick="setAgendaToday()" style="width: auto; padding: 10px 20px;">Hoje</button>
                    </div>

                    <div class="actions-bar" style="padding: 0 20px 20px;">
                        <button class="btn-primary" onclick="showAgendaForm()">
                            <i data-lucide="calendar-plus"></i> Novo Agendamento
                        </button>
                    </div>

                    <div id="agenda-list" class="list-container" style="padding: 0 20px;">
                        <p style="text-align:center; color:#999; padding: 20px;">Carregando agenda...</p>
                    </div>
                </section>

                <!-- Modal de Agendamento -->
                <div id="modal-agenda" class="modal">
                    <div class="modal-content">
                        <header class="modal-header">
                            <h2 id="a-modal-title">Novo Agendamento</h2>
                            <button class="close-btn" onclick="hideAgendaForm()">&times;</button>
                        </header>
                        <form id="form-agenda">
                            <input type="hidden" id="a-id">
                            <div class="form-group">
                                <label>Cliente*</label>
                                <input type="text" id="a-cliente" list="clients-datalist" placeholder="Nome da cliente..." required>
                                <datalist id="clients-datalist"></datalist>
                            </div>
                            <div class="form-group">
                                <label>Serviço*</label>
                                <select id="a-servico" required onchange="updateAgendaPrice()">
                                    <option value="">Selecione um serviço...</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Data e Hora*</label>
                                <input type="datetime-local" id="a-data" required>
                            </div>
                            <div class="form-group">
                                <label>Valor Total (R$)</label>
                                <input type="number" id="a-valor" step="0.01" placeholder="0,00">
                            </div>
                            <div class="form-group">
                                <label>Valor de Entrada / Sinal (R$)</label>
                                <input type="number" id="a-entrada" step="0.01" placeholder="0,00" style="border: 2px solid var(--accent-color);">
                            </div>
                            <div class="form-group" id="a-forma-pagamento-group" style="display:none;">
                                <label>Forma de Pagamento (Entrada)*</label>
                                <select id="a-forma-pagamento">
                                    <option value="">Selecione...</option>
                                    <option value="Pix">Pix</option>
                                    <option value="Dinheiro">Dinheiro</option>
                                    <option value="Cartão">Cartão</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Detalhes p/ Clientes Exigentes (Ficha Técnica)</label>
                                <textarea id="a-ficha" rows="2" placeholder="Ex: Gosta de tons neutros, pele sensível..."></textarea>
                            </div>
                            
                            <!-- Campos extras para novo cliente -->
                            <div id="a-novo-cliente-fields" style="background: #f0f0f0; padding: 10px; border-radius: 8px; margin-bottom: 15px;">
                                <p style="font-size: 0.75rem; color: var(--accent-color); font-weight: 700; margin-bottom: 10px; text-transform: uppercase;">Novo Cliente? Complete o cadastro:</p>
                                <div class="form-group">
                                    <label>WhatsApp</label>
                                    <input type="tel" id="a-telefone" placeholder="(00) 00000-0000">
                                </div>
                                <div class="form-group">
                                    <label>Aniversário</label>
                                    <input type="date" id="a-nascimento">
                                </div>
                            </div>
                            <button type="submit" class="btn-primary" id="btn-save-agenda">Agendar</button>
                        </form>
                    </div>
                </div>

                <!-- Modal de Forma de Pagamento -->
                <div id="modal-pagamento" class="modal">
                    <div class="modal-content" style="max-width:300px;">
                        <header class="modal-header">
                            <h2>Receber Valor</h2>
                            <button class="close-btn" onclick="hidePaymentModal()">&times;</button>
                        </header>
                        <div style="padding:15px; text-align:center;">
                            <p style="margin-bottom:15px; font-weight:600;" id="p-pagamento-msg"></p>
                            <input type="hidden" id="p-id-agendamento">
                            <input type="hidden" id="p-valor-restante">
                            <input type="hidden" id="p-nome-cliente">
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                <button onclick="confirmarPagamento('Pix')" class="btn-primary" style="background:#32BCAD;">Pix</button>
                                <button onclick="confirmarPagamento('Dinheiro')" class="btn-primary" style="background:#2ecc71;">Dinheiro</button>
                                <button onclick="confirmarPagamento('Cartão')" class="btn-primary" style="background:#3498db;">Cartão</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            setTimeout(fetchAgenda, 100);
            break;
        case 'clientes':
            content = `
                <section id="screen-clientes" class="screen active">
                    <header class="header">
                        <h1 class="brand">Clientes</h1>
                        <p class="greeting">Sua lista de contatos</p>
                    </header>
                    
                    <div class="actions-bar" style="padding: 0 20px 20px;">
                        <button class="btn-primary" onclick="showClientForm()">
                            <i data-lucide="user-plus"></i> Novo Cliente
                        </button>
                    </div>

                    <div class="search-bar" style="padding: 0 20px 20px;">
                        <input type="text" id="client-search" placeholder="Buscar cliente..." onkeyup="filterClients()" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                    </div>

                    <div id="clients-list" class="list-container" style="padding: 0 20px;">
                        <p style="text-align:center; color:#999; padding: 20px;">Carregando clientes...</p>
                    </div>
                </section>

                <!-- Modal de Cliente -->
                <div id="modal-client" class="modal">
                    <div class="modal-content">
                        <header class="modal-header">
                            <h2 id="c-modal-title">Novo Cliente</h2>
                            <button class="close-btn" onclick="hideClientForm()">&times;</button>
                        </header>
                        <form id="form-client">
                            <input type="hidden" id="c-id">
                            <div class="form-group">
                                <label>Nome Completo*</label>
                                <input type="text" id="c-nome" required>
                            </div>
                            <div class="form-group">
                                <label>Telefone/WhatsApp</label>
                                <input type="tel" id="c-telefone" placeholder="(00) 00000-0000">
                            </div>
                            <div class="form-group">
                                <label>Instagram</label>
                                <input type="text" id="c-instagram" placeholder="@usuario">
                            </div>
                            <div class="form-group">
                                <label>Data de Aniversário</label>
                                <input type="date" id="c-nascimento">
                            </div>
                            <div class="form-group">
                                <label>Ficha Técnica / Detalhes Extras (Preferências, tipo de pele, etc.)</label>
                                <textarea id="c-ficha" rows="4" placeholder="Anote aqui os detalhes para clientes mais exigentes..."></textarea>
                            </div>
                            <div class="form-group" style="display:none;">
                                <label>Observações</label>
                                <textarea id="c-obs" rows="1"></textarea>
                            </div>
                            <button type="submit" class="btn-primary" id="btn-save-client">Salvar Cliente</button>
                        </form>
                    </div>
                </div>
            `;
            setTimeout(fetchClients, 100);
            break;
        case 'servicos':
            content = `
                <section id="screen-servicos" class="screen active">
                    <header class="header">
                        <h1 class="brand">Serviços</h1>
                        <p class="greeting">Catálogo de Procedimentos</p>
                    </header>
                    
                    <div class="actions-bar" style="padding: 0 20px 20px;">
                        <button class="btn-primary" onclick="showServicoForm()">
                            <i data-lucide="plus"></i> Novo Serviço
                        </button>
                    </div>

                    <div id="servicos-list" class="list-container" style="padding: 0 20px;">
                        <p style="text-align:center; color:#999; padding: 20px;">Carregando serviços...</p>
                    </div>
                </section>

                <!-- Modal de Serviço -->
                <div id="modal-servico" class="modal">
                    <div class="modal-content">
                        <header class="modal-header">
                            <h2 id="s-modal-title">Novo Serviço</h2>
                            <button class="close-btn" onclick="hideServicoForm()">&times;</button>
                        </header>
                        <form id="form-servico">
                            <input type="hidden" id="s-id">
                            <div class="form-group">
                                <label>Nome do Serviço*</label>
                                <input type="text" id="s-nome" required placeholder="Ex: Maquiagem Social">
                            </div>
                            <div class="form-group">
                                <label>Valor Sugerido (R$)*</label>
                                <input type="number" id="s-valor" step="0.01" required placeholder="0,00">
                            </div>
                            <button type="submit" class="btn-primary" id="btn-save-servico">Salvar Serviço</button>
                        </form>
                    </div>
                </div>
            `;
            setTimeout(fetchServicos, 100);
            break;
        case 'financeiro':
            content = `
                <section id="screen-financeiro" class="screen active">
                    <header class="header">
                        <h1 class="brand">Finanças</h1>
                        <p class="greeting">Fluxo de Caixa</p>
                    </header>
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 20px 20px;">
                        <div class="filter-bar" id="fin-filters" style="padding: 0; margin: 0; flex: 1;">
                            <button class="filter-btn active" onclick="setFinanceiroFilter('dia')">Dia</button>
                            <button class="filter-btn" onclick="setFinanceiroFilter('semana')">Semana</button>
                            <button class="filter-btn" onclick="setFinanceiroFilter('mes')">Mês</button>
                            <button class="filter-btn" onclick="setFinanceiroFilter('ano')">Ano</button>
                            <button class="filter-btn" onclick="setFinanceiroFilter('custom')">Personalizado</button>
                        </div>
                        <button class="btn-primary" onclick="toggleAcerto()" style="width: auto; padding: 8px 15px; background: var(--accent-color); font-size: 0.8rem; margin-left: 10px;">
                            <i data-lucide="calculator"></i> Acerto
                        </button>
                    </div>

                    <!-- Filtros de Forma de Pagamento (Nova v2.2) -->
                    <div id="method-filters" class="stats-grid" style="grid-template-columns: repeat(4, 1fr); padding: 0 20px 15px; gap:8px;">
                        <div class="stat-card active" onclick="setMethodFilter('todos')" id="f-m-todos" style="padding:10px; cursor:pointer; text-align:center; background:#eee; border-radius:8px;">
                            <span style="font-size:0.6rem; font-weight:700;">TODOS</span>
                        </div>
                        <div class="stat-card" onclick="setMethodFilter('Pix')" id="f-m-pix" style="padding:10px; cursor:pointer; text-align:center; border:1px solid #32BCAD; border-radius:8px;">
                            <span style="font-size:0.6rem; font-weight:700; color:#32BCAD;">PIX</span>
                        </div>
                        <div class="stat-card" onclick="setMethodFilter('Dinheiro')" id="f-m-dinheiro" style="padding:10px; cursor:pointer; text-align:center; border:1px solid #2ecc71; border-radius:8px;">
                            <span style="font-size:0.6rem; font-weight:700; color:#2ecc71;">DINHEIRO</span>
                        </div>
                        <div class="stat-card" onclick="setMethodFilter('Cartão')" id="f-m-cartao" style="padding:10px; cursor:pointer; text-align:center; border:1px solid #3498db; border-radius:8px;">
                            <span style="font-size:0.6rem; font-weight:700; color:#3498db;">CARTÃO</span>
                        </div>
                    </div>

                    <div id="acerto-display" style="display: none; padding: 0 20px 20px;">
                        <div style="background: white; border: 2px solid var(--accent-color); border-radius: 12px; padding: 15px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
                            <div>
                                <span style="display:block; font-size: 0.65rem; color: #666;">40%</span>
                                <span id="acerto-40" style="color: #2ecc71; font-weight: 700; font-size: 0.9rem;">R$ 0,00</span>
                            </div>
                            <div>
                                <span style="display:block; font-size: 0.65rem; color: #666;">50%</span>
                                <span id="acerto-50" style="color: #2ecc71; font-weight: 700; font-size: 0.9rem;">R$ 0,00</span>
                            </div>
                            <div>
                                <span style="display:block; font-size: 0.65rem; color: #666;">60%</span>
                                <span id="acerto-60" style="color: #2ecc71; font-weight: 700; font-size: 0.9rem;">R$ 0,00</span>
                            </div>
                        </div>
                    </div>

                    <div id="fin-custom-date" style="display: none; padding: 0 20px 20px; gap: 10px;">
                        <input type="date" id="f-start-date" onchange="fetchFinanceiro()" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                        <input type="date" id="f-end-date" onchange="fetchFinanceiro()" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid #ddd;">
                    </div>

                    <div class="stats-grid" style="grid-template-columns: 1fr; padding-bottom: 0;">
                        <div class="stat-card highlight" style="text-align: center; border: 2px solid var(--accent-color);">
                            <span class="stat-label">Caixa Real (Saldo Líquido)</span>
                            <span id="fin-saldo" class="stat-value" style="font-size: 2rem;">R$ 0,00</span>
                        </div>
                    </div>

                    <div class="stats-grid" style="padding-top: 15px;">
                        <div class="stat-card">
                            <span class="stat-label">Entradas (+)</span>
                            <span id="fin-entradas" class="stat-value" style="color: #2ecc71; font-size: 1.2rem;">R$ 0,00</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-label">Saídas (-)</span>
                            <span id="fin-saidas" class="stat-value" style="color: #e74c3c; font-size: 1.2rem;">R$ 0,00</span>
                        </div>
                    </div>

                    <div class="actions-bar" style="padding: 0 20px 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <button class="btn-primary" onclick="showFinanceiroForm('entrada')" style="background-color: #2ecc71;">
                            <i data-lucide="plus-circle"></i> Entrada
                        </button>
                        <button class="btn-primary" onclick="showFinanceiroForm('saida')" style="background-color: #e74c3c;">
                            <i data-lucide="minus-circle"></i> Saída
                        </button>
                    </div>

                    <div id="financeiro-list" class="list-container" style="padding: 0 20px;">
                        <p style="text-align:center; color:#999; padding: 20px;">Carregando finanças...</p>
                    </div>
                </section>

                <!-- Modal de Financeiro -->
                <div id="modal-financeiro" class="modal">
                    <div class="modal-content">
                        <header class="modal-header">
                            <h2 id="fin-modal-title">Nova Transação</h2>
                            <button class="close-btn" onclick="hideFinanceiroForm()">&times;</button>
                        </header>
                        <form id="form-financeiro">
                            <input type="hidden" id="f-tipo">
                            <div class="form-group">
                                <label>Descrição*</label>
                                <input type="text" id="f-descricao" placeholder="Ex: Pagamento Maquiagem ou Compra de Blush" required>
                            </div>
                            <div class="form-group">
                                <label>Valor (R$)*</label>
                                <input type="number" id="f-valor" step="0.01" placeholder="0,00" required>
                            </div>
                            <div class="form-group">
                                <label>Data*</label>
                                <input type="date" id="f-data" required>
                            </div>
                            <button type="submit" class="btn-primary" id="btn-save-financeiro">Salvar</button>
                        </form>
                    </div>
                </div>

                <!-- Modal de Edição (Geral) -->
                <div id="modal-edit-financeiro" class="modal">
                    <div class="modal-content">
                        <header class="modal-header">
                            <h2>Editar Transação</h2>
                            <button class="close-btn" onclick="hideEditFinForm()">&times;</button>
                        </header>
                        <form id="form-edit-financeiro">
                            <input type="hidden" id="ef-id">
                            <div class="form-group">
                                <label>Descrição*</label>
                                <input type="text" id="ef-descricao" required>
                            </div>
                            <div class="form-group">
                                <label>Valor (R$)*</label>
                                <input type="number" id="ef-valor" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label>Data*</label>
                                <input type="date" id="ef-data" required>
                            </div>
                            <button type="submit" class="btn-primary">Atualizar</button>
                        </form>
                    </div>
                </div>
            `;
            break;
    }

    mainContent.insertAdjacentHTML('beforeend', content);
    lucide.createIcons();
}

// --- MÓDULO DE CLIENTES ---

let allClients = [];

async function fetchClients() {
    const listEl = document.getElementById('clients-list');
    if (!listEl) return;

    try {
        const { data, error } = await supabaseClient
            .from('clientes')
            .select('*')
            .order('nome', { ascending: true });

        if (error) throw error;

        allClients = data;
        renderClients(data);
    } catch (err) {
        console.error('Erro ao buscar clientes:', err);
        listEl.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar clientes.</p>`;
    }
}

function renderClients(clients) {
    const listEl = document.getElementById('clients-list');
    if (!listEl) return;

    if (clients.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:#999; padding:20px;">Nenhum cliente cadastrado.</p>`;
        return;
    }

    listEl.innerHTML = clients.map(c => `
        <div class="card client-card" style="margin-bottom: 15px; padding: 15px; border-radius: 12px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
            <div onclick="openClientProfile('${c.id}')" style="cursor:pointer; flex: 1;">
                <h3 style="font-family: 'Montserrat', sans-serif; font-size: 1rem; margin-bottom: 2px; color: var(--primary-color); text-decoration: underline;">${c.nome}</h3>
                <p style="font-size: 0.8rem; color: #666;">${c.telefone || 'Sem telefone'}</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button class="btn-icon" onclick="openWhatsApp('${c.telefone}')" style="background:none; border:none; color: #25D366; cursor: pointer;">
                    <i data-lucide="phone"></i>
                </button>
                <button class="btn-icon" onclick="editClient('${c.id}')" style="background:none; border:none; color: var(--primary-color); cursor: pointer;">
                    <i data-lucide="edit-3"></i>
                </button>
                <button class="btn-icon" onclick="deleteClient('${c.id}')" style="background:none; border:none; color: #e74c3c; cursor: pointer;">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function filterClients() {
    const query = document.getElementById('client-search').value.toLowerCase();
    const filtered = allClients.filter(c => c.nome.toLowerCase().includes(query));
    renderClients(filtered);
}

function editClient(id) {
    const c = allClients.find(c => c.id === id);
    if (!c) return;

    showClientForm();
    document.getElementById('c-id').value = c.id;
    document.getElementById('c-nome').value = c.nome;
    document.getElementById('c-telefone').value = c.telefone || '';
    document.getElementById('c-instagram').value = c.instagram || '';
    document.getElementById('c-nascimento').value = c.data_nascimento || '';
    document.getElementById('c-obs').value = c.observacoes || '';
    document.getElementById('c-ficha').value = c.ficha_tecnica || '';
    document.getElementById('c-modal-title').innerText = 'Editar Cliente';
}

async function deleteClient(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    try {
        const { error } = await supabaseClient.from('clientes').delete().eq('id', id);
        if (error) throw error;
        fetchClients();
        alert('✅ Cliente removido com sucesso!');
    } catch (err) {
        alert('❌ Erro ao excluir cliente: ' + err.message);
    }
}

function hideClientForm() {
    document.getElementById('modal-client').classList.remove('active');
    document.getElementById('form-client').reset();
    document.getElementById('c-ficha').value = '';
}

function showClientForm() {
    document.getElementById('modal-client').classList.add('active');
    document.getElementById('form-client').reset();
    document.getElementById('c-id').value = '';
    document.getElementById('c-modal-title').innerText = 'Novo Cliente';
}

// Interceptar envio do formulário
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'form-client') {
        e.preventDefault();
        console.log('--- Iniciando Cadastro de Cliente ---');

        const btn = document.getElementById('btn-save-client');
        btn.disabled = true;
        btn.innerText = 'Salvando...';

        const clientData = {
            nome: document.getElementById('c-nome').value,
            telefone: document.getElementById('c-telefone').value,
            instagram: document.getElementById('c-instagram').value,
            data_nascimento: document.getElementById('c-nascimento').value || null,
            observacoes: document.getElementById('c-obs').value,
            ficha_tecnica: document.getElementById('c-ficha').value
        };

        console.log('Dados coletados:', clientData);

        if (!supabaseClient) {
            console.error('Erro: supabaseClient não foi inicializado!');
            alert('Erro: O sistema de banco de dados não carregou corretamente.');
            btn.disabled = false;
            btn.innerText = 'Salvar Cliente';
            return;
        }

        const id = document.getElementById('c-id').value;

        try {
            if (id) {
                // Modo Edição
                const { error } = await supabaseClient
                    .from('clientes')
                    .update(clientData)
                    .eq('id', id);
                if (error) throw error;
                alert('✅ Cliente atualizado com sucesso!');
            } else {
                // Modo Novo
                const { error } = await supabaseClient
                    .from('clientes')
                    .insert([clientData]);
                if (error) throw error;
                alert('✅ Cliente cadastrado com sucesso!');
            }

            hideClientForm();
            fetchClients();
        } catch (err) {
            console.error('Falha catastrófica ao salvar:', err);
            alert('❌ Erro ao salvar cliente!\n\nDetalhe: ' + (err.message || 'Erro desconhecido. Verifique se o SQL foi rodado no painel do Supabase.'));
        } finally {
            btn.disabled = false;
            btn.innerText = 'Salvar Cliente';
        }
    }
});

async function openClientProfile(id) {
    if (!id || id === 'undefined' || id === null) return;
    const modal = document.getElementById('modal-perfil-cliente');
    const content = document.getElementById('perfil-cliente-content');

    try {
        const { data, error } = await supabaseClient.from('clientes').select('*').eq('id', id).single();
        if (error) throw error;

        // Contar visitas (agendamentos concluídos ou pagos)
        const { count: visitas } = await supabaseClient
            .from('agendamentos')
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', id);

        const bday = data.data_nascimento ? (() => {
            const [y, m, d] = data.data_nascimento.split('-');
            return `${d}/${m}`;
        })() : 'Não informado';

        content.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--secondary-color); padding:10px; border-radius:8px;">
                <div>
                    <strong style="color:var(--primary-color); font-size:0.7rem; text-transform:uppercase;">Frequência</strong>
                    <p style="font-size:1.2rem; font-weight:700; color:var(--primary-color);">${visitas || 0} Visitas</p>
                </div>
                <div style="text-align:right;">
                    <strong style="color:var(--primary-color); font-size:0.7rem; text-transform:uppercase;">Aniversário</strong>
                    <p style="font-weight:600;">${bday}</p>
                </div>
            </div>
            <div>
                <strong style="color:var(--accent-color); font-size:0.7rem; text-transform:uppercase;">Nome</strong>
                <p style="font-size:1.1rem; font-weight:600;">${data.nome}</p>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div>
                    <strong style="color:var(--accent-color); font-size:0.7rem; text-transform:uppercase;">WhatsApp</strong>
                    <p>${data.telefone || 'Não informado'}</p>
                </div>
                <div>
                    <strong style="color:var(--accent-color); font-size:0.7rem; text-transform:uppercase;">Instagram</strong>
                    <p>${data.instagram || 'Não informado'}</p>
                </div>
            </div>
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; border-left:4px solid var(--accent-color);">
                <strong style="color:var(--accent-color); font-size:0.7rem; text-transform:uppercase;">Ficha Técnica / Detalhes</strong>
                <p style="font-size:0.9rem; margin-top:5px; white-space:pre-wrap;">${data.ficha_tecnica || 'Nenhum detalhe extra cadastrado ainda.'}</p>
            </div>
        `;

        document.getElementById('btn-edit-perfil').onclick = () => {
            modal.classList.remove('active');
            editClient(id);
        };

        document.getElementById('btn-whatsapp-perfil').onclick = () => {
            openWhatsApp(data.telefone);
        };

        modal.classList.add('active');
        lucide.createIcons();
    } catch (err) {
        console.error('Erro ao abrir perfil:', err);
    }
}

async function openClientProfileByName(desc) {
    if (!desc || desc.trim() === '') return;
    let nome = desc.trim();
    if (desc.includes(': ')) {
        nome = desc.split(': ')[1].trim();
    }
    try {
        const { data, error } = await supabaseClient.from('clientes').select('id').ilike('nome', nome).maybeSingle();
        if (data) openClientProfile(data.id);
        else {
            const { data: data2 } = await supabaseClient.from('clientes').select('id').ilike('nome', `%${nome}%`).limit(1).maybeSingle();
            if (data2) openClientProfile(data2.id);
        }
    } catch (err) {
        console.error('Erro ao buscar cliente por nome:', err);
    }
}

function openWhatsApp(phone) {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${cleanPhone}`, '_blank');
}

// --- MÓDULO DE AGENDA ---

function setAgendaToday() {
    const filter = document.getElementById('agenda-date-filter');
    if (filter) {
        filter.valueAsDate = new Date();
        fetchAgenda();
    }
}

function showAgendaForm() {
    document.getElementById('modal-agenda').classList.add('active');
    document.getElementById('form-agenda').reset();
    document.getElementById('a-id').value = '';
    document.getElementById('a-modal-title').innerText = 'Novo Agendamento';
}

function hideAgendaForm() {
    document.getElementById('modal-agenda').classList.remove('active');
}

async function editAgendamento(id) {
    try {
        const { data, error } = await supabaseClient.from('agendamentos').select('*').eq('id', id).single();
        if (error) throw error;

        showAgendaForm();
        document.getElementById('a-id').value = data.id;
        document.getElementById('a-cliente').value = ''; // Nome deve ser buscado ou preenchido manualmente
        // Buscar nome do cliente se necessário
        const { data: cliente } = await supabaseClient.from('clientes').select('nome').eq('id', data.cliente_id).single();
        if (cliente) document.getElementById('a-cliente').value = cliente.nome;

        document.getElementById('a-servico').value = data.servico;
        // Formatar data_hora para datetime-local
        const dt = new Date(data.data_hora);
        dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
        document.getElementById('a-data').value = dt.toISOString().slice(0, 16);

        document.getElementById('a-valor').value = data.valor;
        document.getElementById('a-entrada').value = data.valor_pago || 0;
        document.getElementById('a-modal-title').innerText = 'Editar Agendamento';
    } catch (err) {
        alert('Erro ao carregar agendamento: ' + err.message);
    }
}

async function deleteAgendamento(id) {
    if (!confirm('Deseja excluir este agendamento?')) return;
    try {
        const { error } = await supabaseClient.from('agendamentos').delete().eq('id', id);
        if (error) throw error;
        fetchAgenda();
        updateDashboard();
    } catch (err) {
        alert('Erro ao excluir agendamento: ' + err.message);
    }
}

async function setNoShow(id) {
    if (!confirm('Marcar que a cliente não veio (Ausente)?')) return;
    try {
        const { error } = await supabaseClient.from('agendamentos').update({ status: 'ausente' }).eq('id', id);
        if (error) throw error;
        fetchAgenda();
        alert('✅ Status atualizado para Ausente.');
    } catch (err) {
        alert('Erro ao atualizar status: ' + err.message);
    }
}

function showPaymentModal(id, restante, nome) {
    document.getElementById('modal-pagamento').classList.add('active');
    document.getElementById('p-id-agendamento').value = id;
    document.getElementById('p-valor-restante').value = restante;
    document.getElementById('p-nome-cliente').value = nome;
    document.getElementById('p-pagamento-msg').innerText = `Receber R$ ${restante.toFixed(2)} de ${nome}`;
}

function hidePaymentModal() {
    document.getElementById('modal-pagamento').classList.remove('active');
}

async function confirmarPagamento(forma) {
    const id = document.getElementById('p-id-agendamento').value;
    const restante = parseFloat(document.getElementById('p-valor-restante').value);
    const nome = document.getElementById('p-nome-cliente').value;

    try {
        const { data: agenda } = await supabaseClient.from('agendamentos').select('valor_pago').eq('id', id).single();
        const novoPago = parseFloat(agenda.valor_pago || 0) + restante;

        const { error } = await supabaseClient
            .from('agendamentos')
            .update({ valor_pago: novoPago, pago: true, status: 'concluido' })
            .eq('id', id);

        if (error) throw error;

        // Registrar no financeiro com a forma de pagamento e DATA ATUAL
        await supabaseClient.from('financeiro').insert([{
            tipo: 'entrada',
            descricao: `Saldo de serviço: ${nome}`,
            valor: restante,
            forma_pagamento: forma,
            data: new Date().toISOString(), // AGORA USA A DATA REAL DO RECEBIMENTO
            agendamento_id: id
        }]);

        hidePaymentModal();
        fetchAgenda();
        updateDashboard();
        alert(`✅ Recebido em ${forma}!`);
    } catch (err) {
        alert('Erro ao processar pagamento: ' + err.message);
    }
}

async function fetchAgenda() {
    const listEl = document.getElementById('agenda-list');
    const dateFilter = document.getElementById('agenda-date-filter');
    if (!listEl) return;

    // Se o filtro não estiver definido, colocar hoje como padrão
    if (dateFilter && !dateFilter.value) {
        dateFilter.value = new Date().toLocaleDateString('en-CA');
    }

    const selectedDate = dateFilter ? dateFilter.value : null;

    try {
        let query = supabaseClient
            .from('agendamentos')
            .select('*, clientes(nome)')
            .order('data_hora', { ascending: true });

        // Filtrar por data se selecionado
        if (selectedDate) {
            // Fix Timezone: Criar limites do dia local em UTC
            const startOfDay = new Date(selectedDate + 'T00:00:00').toISOString();
            const endOfDay = new Date(selectedDate + 'T23:59:59').toISOString();
            query = query.gte('data_hora', startOfDay).lte('data_hora', endOfDay);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Ordenar alfabeticamente pelo nome do cliente (conforme pedido)
        data.sort((a, b) => {
            const nomeA = (a.clientes?.nome || '').toLowerCase();
            const nomeB = (b.clientes?.nome || '').toLowerCase();
            return nomeA.localeCompare(nomeB);
        });
        renderAgenda(data);
    } catch (err) {
        console.error('Erro ao buscar agenda:', err);
        listEl.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar agenda.</p>`;
    }
}

function renderAgenda(items) {
    const listEl = document.getElementById('agenda-list');
    if (!listEl) return;

    if (items.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:#999; padding:20px;">Nenhum agendamento para hoje.</p>`;
        return;
    }

    listEl.innerHTML = items.map(item => {
        const date = new Date(item.data_hora);
        const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = date.toLocaleDateString('pt-BR');

        const valorTotal = parseFloat(item.valor || 0);
        const valorPago = parseFloat(item.valor_pago || 0);
        const restante = valorTotal - valorPago;
        const isPago = restante <= 0 && item.status !== 'ausente';

        return `
            <div class="card agenda-card" style="margin-bottom: 15px; padding: 15px; border-radius: 12px; background: ${item.status === 'ausente' ? '#f8f9fa' : (isPago ? '#f0fff4' : 'white')}; box-shadow: 0 2px 8px rgba(0,0,0,0.05); opacity: ${item.status === 'ausente' ? '0.6' : '1'}; border-left: 5px solid ${item.status === 'ausente' ? '#ccc' : (isPago ? '#2ecc71' : 'var(--accent-color)')};">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <div>
                        <span style="font-size: 0.7rem; color: var(--accent-color); font-weight: 600; text-transform: uppercase;">${timeStr} - ${dateStr}</span>
                        <h3 onclick="${item.clientes?.id ? `openClientProfile('${item.clientes.id}')` : `openClientProfileByName('${item.clientes?.nome || ''}')`}" style="font-family: 'Montserrat', sans-serif; font-size: 1rem; margin: 4px 0; cursor: pointer; text-decoration: underline;">${item.clientes?.nome || 'Cliente não encontrado'}</h3>
                    </div>
                    <div style="text-align: right;">
                        <span style="display:block; font-size: 0.8rem; font-weight: 600;">Total: R$ ${valorTotal.toFixed(2)}</span>
                        ${restante > 0 && item.status !== 'ausente' ? `<span style="display:block; font-size: 0.75rem; color: #e74c3c;">Falta: R$ ${restante.toFixed(2)}</span>` : (item.status === 'ausente' ? '<span style="color:#999;font-size:0.75rem;">Ausente</span>' : '<span style="display:block; font-size: 0.75rem; color: #2ecc71;">Pago ✅</span>')}
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.85rem; color: #666;">${item.servico}</span>
                    <div style="display: flex; gap: 5px; flex-wrap: wrap; justify-content: flex-end;">
                        ${restante > 0 && item.status === 'pendente' ? `<button onclick="showPaymentModal('${item.id}', ${restante}, '${item.clientes?.nome || 'Cliente'}')" style="background: var(--accent-color); color: white; border: none; padding: 6px 10px; border-radius: 6px; font-size: 0.7rem; cursor: pointer; font-weight:600;">Receber</button>` : ''}
                        
                        ${item.status === 'pendente' ? `<button onclick="setNoShow('${item.id}')" title="Não veio" style="background:#eee; color:#666; border:none; padding:6px; border-radius:6px; cursor:pointer;"><i data-lucide="user-x" style="width:16px; height:16px;"></i></button>` : ''}
                        
                        <button onclick="editAgendamento('${item.id}')" class="btn-icon" style="background:#eee; padding:6px; border-radius:6px; color:var(--primary-color);"><i data-lucide="edit-3" style="width:16px; height:16px;"></i></button>
                        
                        <button onclick="deleteAgendamento('${item.id}')" class="btn-icon" style="background:#eee; padding:6px; border-radius:6px; color:#e74c3c;"><i data-lucide="trash-2" style="width:16px; height:16px;"></i></button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function quitarSaldo(id, restante, nomeCliente) {
    if (!confirm(`Deseja liquidar o saldo de R$ ${restante.toFixed(2)} deste serviço?`)) return;

    try {
        // Buscar agendamento atual para somar o valor_pago
        const { data: agenda } = await supabaseClient.from('agendamentos').select('valor, valor_pago').eq('id', id).single();
        const novoPago = parseFloat(agenda.valor_pago || 0) + restante;

        const { error } = await supabaseClient
            .from('agendamentos')
            .update({ valor_pago: novoPago, pago: true })
            .eq('id', id);

        if (error) throw error;

        // Registrar no financeiro de HOJE
        const finData = {
            tipo: 'entrada',
            descricao: `Acerto: ${nomeCliente}`,
            valor: restante,
            data: new Date().toISOString().split('T')[0],
            agendamento_id: id
        };
        await supabaseClient.from('financeiro').insert([finData]);

        alert('✅ Saldo liquidado e registrado no caixa de hoje!');
        fetchAgenda();
        updateDashboard();
    } catch (err) {
        alert('❌ Erro ao liquidar: ' + err.message);
    }
}

async function showAgendaForm() {
    document.getElementById('modal-agenda').classList.add('active');
    document.getElementById('form-agenda').reset();
    document.getElementById('btn-save-agenda').innerText = 'Agendar';
    document.getElementById('a-forma-pagamento-group').style.display = 'none';
    document.getElementById('a-forma-pagamento').required = false;

    // Monitorar valor de entrada para mostrar forma de pagamento
    const inputEntrada = document.getElementById('a-entrada');
    inputEntrada.oninput = () => {
        const val = parseFloat(inputEntrada.value || 0);
        const group = document.getElementById('a-forma-pagamento-group');
        const select = document.getElementById('a-forma-pagamento');
        if (val > 0) {
            group.style.display = 'block';
            select.required = true;
        } else {
            group.style.display = 'none';
            select.required = false;
        }
    };

    // Set data/hora seletor para hoje/agora
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('a-data').value = now.toISOString().slice(0, 16);

    // Popular datalist de clientes
    const datalist = document.getElementById('clients-datalist');
    try {
        const { data } = await supabaseClient.from('clientes').select('nome').order('nome');
        if (data) datalist.innerHTML = data.map(c => `<option value="${c.nome}">`).join('');
    } catch (err) { console.error(err); }

    fetchServicosForSelect();
}

function hideAgendaForm() {
    document.getElementById('modal-agenda').classList.remove('active');
    document.getElementById('form-agenda').reset();
}

// Interceptar envio do formulário de agenda
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'form-agenda') {
        e.preventDefault();
        const btn = document.getElementById('btn-save-agenda');
        btn.disabled = true;
        btn.innerText = 'Salvando...';

        const clienteNome = document.getElementById('a-cliente').value.trim();
        const servico = document.getElementById('a-servico').value;
        const dataHora = document.getElementById('a-data').value;
        const valor = parseFloat(document.getElementById('a-valor').value || 0);
        const entrada = parseFloat(document.getElementById('a-entrada').value || 0);

        try {
            // 1. Resolver Cliente (Buscar ou Criar)
            let clienteId;
            const { data: existing } = await supabaseClient.from('clientes').select('id, ficha_tecnica').eq('nome', clienteNome).maybeSingle();
            if (existing) {
                clienteId = existing.id;
                // Atualizar ficha se preenchida
                const fichaNova = document.getElementById('a-ficha').value.trim();
                if (fichaNova) {
                    const fichaAtual = existing.ficha_tecnica || '';
                    if (!fichaAtual.includes(fichaNova)) {
                        await supabaseClient.from('clientes').update({ ficha_tecnica: (fichaAtual + '\n' + fichaNova).trim() }).eq('id', clienteId);
                    }
                }
            } else {
                const { data: novo, error: errC } = await supabaseClient.from('clientes').insert([{
                    nome: clienteNome,
                    telefone: document.getElementById('a-telefone').value.trim(),
                    data_nascimento: document.getElementById('a-nascimento').value || null,
                    ficha_tecnica: document.getElementById('a-ficha').value.trim()
                }]).select().single();
                if (errC) throw errC;
                clienteId = novo.id;
            }

            // 2. Criar/Atualizar Agendamento
            const agendaData = {
                cliente_id: clienteId,
                servico: servico,
                data_hora: new Date(dataHora).toISOString(),
                valor: valor,
                valor_pago: entrada,
                status: 'pendente'
            };

            const agendaId = document.getElementById('a-id').value;

            if (agendaId) {
                // Modo Edição
                const { error: errU } = await supabaseClient.from('agendamentos').update(agendaData).eq('id', agendaId);
                if (errU) throw errU;
                alert('✅ Agendamento atualizado!');
            } else {
                // Modo Novo
                const { data: agenda, error: errA } = await supabaseClient.from('agendamentos').insert([agendaData]).select().single();
                if (errA) throw errA;

                // 3. Registrar Entrada se houver (apenas para novo agendamento para evitar duplicar entrada na edição)
                if (entrada > 0) {
                    const forma = document.getElementById('a-forma-pagamento').value;
                    const finData = {
                        tipo: 'entrada',
                        descricao: `Entrada: ${clienteNome}`,
                        valor: entrada,
                        data: new Date().toISOString(),
                        agendamento_id: agenda.id,
                        forma_pagamento: forma || 'Pix'
                    };
                    await supabaseClient.from('financeiro').insert([finData]);
                }
                alert('✅ Agendado com sucesso!');
            }

            hideAgendaForm();
            fetchAgenda();
            updateDashboard();
        } catch (err) {
            alert('❌ Erro: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerText = 'Agendar';
        }
    }
});

// --- MÓDULO FINANCEIRO ---

let currentFinFilter = 'dia';
let currentMethodFilter = 'todos';

function setMethodFilter(method) {
    currentMethodFilter = method;

    // Atualizar UI dos botões de método
    const methods = ['todos', 'Pix', 'Dinheiro', 'Cartão'];
    methods.forEach(m => {
        const id = `f-m-${m.toLowerCase().replace('ã', 'a')}`;
        const el = document.getElementById(id);
        if (el) {
            el.style.background = m === method ? (m === 'todos' ? '#eee' : (m === 'Pix' ? '#32BCAD22' : (m === 'Dinheiro' ? '#2ecc7122' : '#3498db22'))) : 'white';
            el.classList.toggle('active', m === method);
        }
    });

    fetchFinanceiro();
}

function setFinanceiroFilter(filter) {
    currentFinFilter = filter;

    // Atualizar UI dos botões
    document.querySelectorAll('#fin-filters .filter-btn').forEach(btn => {
        const text = btn.innerText.toLowerCase();
        const target = filter === 'custom' ? 'personalizado' : filter;
        btn.classList.toggle('active', text === target || (filter === 'mes' && text === 'mês'));
    });

    // Mostrar/esconder campos de data customizada
    const customDiv = document.getElementById('fin-custom-date');
    if (customDiv) customDiv.style.display = filter === 'custom' ? 'flex' : 'none';

    fetchFinanceiro();
}

async function fetchFinanceiro() {
    const listEl = document.getElementById('financeiro-list');
    if (!listEl) return;

    try {
        let query = supabaseClient.from('financeiro').select('*');

        const now = new Date();
        let start = new Date();
        let end = new Date();

        switch (currentFinFilter) {
            case 'dia':
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'semana':
                const day = now.getDay();
                start.setDate(now.getDate() - day);
                start.setHours(0, 0, 0, 0);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            case 'mes':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case 'ano':
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear(), 11, 31);
                end.setHours(23, 59, 59, 999);
                break;
            case 'custom':
                const sd = document.getElementById('f-start-date').value;
                const ed = document.getElementById('f-end-date').value;
                if (sd && ed) {
                    start = new Date(sd + 'T00:00:00');
                    end = new Date(ed + 'T23:59:59');
                } else {
                    // Se não preencheu, não filtra nada ou mostra aviso
                    listEl.innerHTML = '<p style="text-align:center; padding:20px;">Selecione o período...</p>';
                    return;
                }
                break;
        }

        // Fix Timezone: Converter filtros locais para ISO string UTC compatível
        query = query.gte('data', start.toISOString()).lte('data', end.toISOString());

        const { data, error } = await query.order('data', { ascending: false });
        if (error) throw error;

        // Filtrar por método se necessário
        let filteredData = data;
        if (currentMethodFilter !== 'todos') {
            filteredData = data.filter(i => i.forma_pagamento === currentMethodFilter);
        }

        renderFinanceiro(filteredData);
        calculateTotals(filteredData); // Calcula apenas do método selecionado
    } catch (err) {
        console.error('Erro ao buscar finanças:', err);
        listEl.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar dados.</p>`;
    }
}

async function deleteFinanceiro(id) {
    if (!confirm('Tem certeza que deseja apagar esta transação?')) return;

    try {
        const { error } = await supabaseClient.from('financeiro').delete().eq('id', id);
        if (error) throw error;
        alert('✅ Transação removida!');
        fetchFinanceiro();
        updateDashboard();
    } catch (err) {
        alert('❌ Erro ao apagar: ' + err.message);
    }
}

async function editFinanceiro(id) {
    try {
        const { data, error } = await supabaseClient.from('financeiro').select('*').eq('id', id).single();
        if (error) throw error;

        document.getElementById('ef-id').value = data.id;
        document.getElementById('ef-descricao').value = data.descricao;
        document.getElementById('ef-valor').value = data.valor;
        document.getElementById('ef-data').value = data.data.split('T')[0];

        document.getElementById('modal-edit-financeiro').classList.add('active');
    } catch (err) {
        alert('❌ Erro ao carregar transação: ' + err.message);
    }
}

function hideEditFinForm() {
    document.getElementById('modal-edit-financeiro').classList.remove('active');
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'form-edit-financeiro') {
        e.preventDefault();
        const id = document.getElementById('ef-id').value;
        const updateData = {
            descricao: document.getElementById('ef-descricao').value,
            valor: parseFloat(document.getElementById('ef-valor').value),
            data: document.getElementById('ef-data').value
        };

        try {
            const { error } = await supabaseClient.from('financeiro').update(updateData).eq('id', id);
            if (error) throw error;

            hideEditFinForm();
            fetchFinanceiro();
            updateDashboard();
            alert('✅ Transação atualizada!');
        } catch (err) {
            alert('❌ Erro ao atualizar: ' + err.message);
        }
    }
});

function renderFinanceiro(items) {
    const listEl = document.getElementById('financeiro-list');
    if (!listEl) return;

    if (items.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:#999; padding:20px;">Nenhuma movimentação registrada.</p>`;
        return;
    }

    listEl.innerHTML = items.map(item => `
        <div class="card fin-card" style="margin-bottom: 15px; padding: 15px; border-radius: 12px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;">
            <div style="flex: 1;">
                <h3 onclick="openClientProfileByName('${item.descricao.split(': ')[1] || item.descricao}')" style="font-family: 'Montserrat', sans-serif; font-size: 0.95rem; margin-bottom: 2px; ${item.descricao.includes(':') ? 'cursor: pointer; text-decoration: underline; color: var(--primary-color);' : ''}">${item.descricao}</h3>
                <p style="font-size: 0.75rem; color: #666;">${new Date(item.data).toLocaleDateString('pt-BR')}</p>
            </div>
            <div style="text-align: right; display: flex; align-items: center; gap: 12px;">
                <span style="font-weight: 600; color: ${item.tipo === 'entrada' ? '#2ecc71' : '#e74c3c'};">
                    ${item.tipo === 'entrada' ? '+' : '-'} R$ ${item.valor.toFixed(2)}
                </span>
                <div class="card-actions">
                    <button onclick="editFinanceiro('${item.id}')" class="action-btn edit"><i data-lucide="edit-2" style="width: 16px; height: 16px;"></i></button>
                    <button onclick="deleteFinanceiro('${item.id}')" class="action-btn delete"><i data-lucide="trash-2" style="width: 16px; height: 16px;"></i></button>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function calculateTotals(items) {
    const totalEntradas = items
        .filter(i => i.tipo === 'entrada')
        .reduce((sum, i) => sum + parseFloat(i.valor), 0);

    const totalSaidas = items
        .filter(i => i.tipo === 'saida')
        .reduce((sum, i) => sum + parseFloat(i.valor), 0);

    const saldoReal = totalEntradas - totalSaidas;

    document.getElementById('fin-entradas').innerText = `R$ ${totalEntradas.toFixed(2)}`;
    document.getElementById('fin-saidas').innerText = `R$ ${totalSaidas.toFixed(2)}`;
    document.getElementById('fin-saldo').innerText = `R$ ${saldoReal.toFixed(2)}`;

    // Atualizar Acerto (40, 50, 60% do Saldo Real)
    document.getElementById('acerto-40').innerText = `R$ ${(saldoReal * 0.4).toFixed(2)}`;
    document.getElementById('acerto-50').innerText = `R$ ${(saldoReal * 0.5).toFixed(2)}`;
    document.getElementById('acerto-60').innerText = `R$ ${(saldoReal * 0.6).toFixed(2)}`;

    // Cor dinâmica para o saldo
    const saldoEl = document.getElementById('fin-saldo');
    if (saldoReal > 0) saldoEl.style.color = '#2ecc71';
    else if (saldoReal < 0) saldoEl.style.color = '#e74c3c';
    else saldoEl.style.color = 'var(--secondary-color)';
}

function toggleAcerto() {
    const display = document.getElementById('acerto-display');
    if (display.style.display === 'none') {
        display.style.display = 'block';
    } else {
        display.style.display = 'none';
    }
}

function showFinanceiroForm(tipo) {
    document.getElementById('modal-financeiro').classList.add('active');
    document.getElementById('f-tipo').value = tipo;
    document.getElementById('f-data').valueAsDate = new Date();
    document.getElementById('fin-modal-title').innerText = tipo === 'entrada' ? 'Nova Entrada' : 'Nova Saída';
}

function hideFinanceiroForm() {
    document.getElementById('modal-financeiro').classList.remove('active');
    document.getElementById('form-financeiro').reset();
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'form-financeiro') {
        e.preventDefault();
        const btn = document.getElementById('btn-save-financeiro');
        btn.disabled = true;
        btn.innerText = 'Salvando...';

        const finData = {
            tipo: document.getElementById('f-tipo').value,
            descricao: document.getElementById('f-descricao').value,
            valor: parseFloat(document.getElementById('f-valor').value),
            data: document.getElementById('f-data').value,
            forma_pagamento: document.getElementById('f-forma-pagamento').value
        };

        try {
            const { error } = await supabaseClient.from('financeiro').insert([finData]);
            if (error) throw error;

            hideFinanceiroForm();
            fetchFinanceiro();
            alert('✅ Registro salvo!');
        } catch (err) {
            alert('❌ Erro ao salvar: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerText = 'Salvar';
        }
    }
});

// --- MÓDULO DE SERVIÇOS ---

async function fetchServicos() {
    const listEl = document.getElementById('servicos-list');
    if (!listEl) return;

    try {
        const { data, error } = await supabaseClient.from('servicos').select('*').order('nome');
        if (error) throw error;
        renderServicos(data);
    } catch (err) {
        console.error('Erro ao buscar serviços:', err);
        listEl.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar serviços.</p>`;
    }
}

async function fetchServicosForSelect() {
    const sSelect = document.getElementById('a-servico');
    if (!sSelect) return;

    try {
        const { data: servicos } = await supabaseClient.from('servicos').select('*').order('nome');
        if (servicos) {
            sSelect.innerHTML = '<option value="">Selecione um serviço...</option>' +
                servicos.map(s => `<option value="${s.nome}" data-valor="${s.valor}">${s.nome}</option>`).join('');
        }
    } catch (err) {
        console.error('Erro ao carregar serviços para select:', err);
    }
}

function renderServicos(items) {
    const listEl = document.getElementById('servicos-list');
    if (!listEl) return;

    if (items.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; color:#999; padding:20px;">Nenhum serviço cadastrado.</p>`;
        return;
    }

    listEl.innerHTML = items.map(item => `
        <div class="card" style="margin-bottom: 15px; padding:15px; border-radius:12px; background:white; box-shadow:0 2px 8px rgba(0,0,0,0.05); display:flex; justify-content:space-between; align-items:center;">
            <div>
                <h3 style="font-family:'Montserrat', sans-serif; font-size:1rem; margin-bottom:2px;">${item.nome}</h3>
                <p style="font-size:0.85rem; color:var(--accent-color); font-weight:600;">R$ ${item.valor.toFixed(2)}</p>
            </div>
            <div class="card-actions">
                <button onclick="editServico('${item.id}', '${item.nome}', ${item.valor})" class="action-btn edit">
                    <i data-lucide="edit-3" style="width:20px; height:20px;"></i>
                </button>
                <button onclick="deleteServico('${item.id}')" class="action-btn delete">
                    <i data-lucide="trash-2" style="width:20px; height:20px;"></i>
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function showServicoForm() {
    document.getElementById('modal-servico').classList.add('active');
    document.getElementById('form-servico').reset();
    document.getElementById('s-id').value = '';
    document.getElementById('s-modal-title').innerText = 'Novo Serviço';
}

function editServico(id, nome, valor) {
    document.getElementById('modal-servico').classList.add('active');
    document.getElementById('s-id').value = id;
    document.getElementById('s-nome').value = nome;
    document.getElementById('s-valor').value = valor;
    document.getElementById('s-modal-title').innerText = 'Editar Serviço';
}

function hideServicoForm() {
    document.getElementById('modal-servico').classList.remove('active');
}

async function deleteServico(id) {
    if (!confirm('Deseja excluir este serviço do catálogo?')) return;
    try {
        const { error } = await supabaseClient.from('servicos').delete().eq('id', id);
        if (error) throw error;
        fetchServicos();
    } catch (err) {
        alert('Erro ao excluir: ' + err.message);
    }
}

function updateAgendaPrice() {
    const select = document.getElementById('a-servico');
    const selectedOption = select.options[select.selectedIndex];
    const valor = selectedOption.getAttribute('data-valor');
    if (valor) {
        document.getElementById('a-valor').value = valor;
    }
}

document.addEventListener('submit', async (e) => {
    if (e.target.id === 'form-servico') {
        e.preventDefault();
        const btn = document.getElementById('btn-save-servico');
        btn.disabled = true;
        btn.innerText = 'Salvando...';

        const servicoData = {
            nome: document.getElementById('s-nome').value,
            valor: parseFloat(document.getElementById('s-valor').value)
        };

        const id = document.getElementById('s-id').value;

        try {
            if (id) {
                // Atualização
                const { error } = await supabaseClient.from('servicos').update(servicoData).eq('id', id);
                if (error) throw error;
                alert('✅ Serviço atualizado com sucesso!');
            } else {
                // Inserção
                const { error } = await supabaseClient.from('servicos').insert([servicoData]);
                if (error) throw error;
                alert('✅ Serviço cadastrado com sucesso!');
            }

            hideServicoForm();
            fetchServicos();
        } catch (err) {
            alert('❌ Erro ao salvar serviço: ' + err.message);
        } finally {
            btn.disabled = false;
            btn.innerText = 'Salvar Serviço';
        }
    }
});

async function updateDashboard() {
    try {
        const today = new Date().toLocaleDateString('en-CA');
        const startOfDay = new Date(today + 'T00:00:00').toISOString();
        const endOfDay = new Date(today + 'T23:59:59').toISOString();

        // Contar agendamentos de hoje
        const { data: agenda } = await supabaseClient
            .from('agendamentos')
            .select('id')
            .gte('data_hora', startOfDay)
            .lte('data_hora', endOfDay);

        // Somar entradas financeiras de hoje (incluindo entradas de serviços futuros)
        const startOfFin = new Date(today + 'T00:00:00').toISOString();
        const endOfFin = new Date(today + 'T23:59:59').toISOString();

        const { data: finEntries } = await supabaseClient
            .from('financeiro')
            .select('valor')
            .eq('tipo', 'entrada')
            .gte('data', startOfFin)
            .lte('data', endOfFin);

        const count = agenda?.length || 0;
        const revenue = finEntries?.reduce((sum, item) => sum + parseFloat(item.valor || 0), 0) || 0;

        document.querySelectorAll('.stat-card').forEach(card => {
            const label = card.querySelector('.stat-label')?.innerText.toUpperCase();
            const valueEl = card.querySelector('.stat-value');
            if (label === 'HOJE') valueEl.innerText = count;
            if (label === 'RECEITA DO DIA') valueEl.innerText = `R$ ${revenue.toFixed(2)}`;
        });

        checkBirthdays();
    } catch (err) { console.error('Dashboard error:', err); }
}

async function checkBirthdays() {
    const banner = document.getElementById('birthday-banner-container');
    const list = document.getElementById('birthday-list');
    if (!banner || !list) return;

    try {
        const { data: clients } = await supabaseClient.from('clientes').select('nome, data_nascimento');

        // Normalizar data atual para meia-noite
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        const aniversariantes = clients.filter(c => {
            if (!c.data_nascimento) return false;

            // Parse manual para evitar erro de Timezone (UTC)
            const [y, m, d] = c.data_nascimento.split('-');
            const bday = new Date(today.getFullYear(), m - 1, d);
            bday.setHours(0, 0, 0, 0);

            return bday >= startOfWeek && bday <= endOfWeek;
        });

        if (aniversariantes.length > 0) {
            list.innerHTML = aniversariantes.map(c => {
                const [y, m, d] = c.data_nascimento.split('-');
                return `${c.nome} (${d}/${m})`;
            }).join(', ');
            banner.style.display = 'block';
        } else {
            list.innerHTML = '<span style="font-weight:400; opacity:0.8;">Nenhum nesta semana</span>';
            banner.style.display = 'block';
        }
    } catch (err) { console.error(err); }
}

// Inicialização
window.addEventListener('DOMContentLoaded', () => {
    console.log('Atelier Aline Silva pronto! v2.6');
    lucide.createIcons();
    updateDashboard(); // Carregar stats iniciais

    // Registrar Service Worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker registrado!'))
            .catch(err => console.log('Erro no Service Worker:', err));
    }
});
