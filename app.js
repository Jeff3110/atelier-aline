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

    // Mostrar a tela alvo
    const targetEl = document.getElementById(`screen-${screenId}`);

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

// (O listener de submit foi movido para o bloco unificado no final do arquivo)

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

async function showAgendaForm() {
    document.getElementById('modal-agenda').classList.add('active');
    document.getElementById('form-agenda').reset();
    document.getElementById('btn-save-agenda').innerText = 'Agendar';

    // Configurar monitoramento da forma de pagamento
    const inputEntrada = document.getElementById('a-entrada');
    inputEntrada.oninput = togglePaymentField;
    togglePaymentField();

    // Set data/hora seletor para hoje/agora
    const now = new Date();
    const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    document.getElementById('a-data').value = localNow;

    // Popular datalist de clientes
    const datalist = document.getElementById('clients-datalist');
    try {
        const { data } = await supabaseClient.from('clientes').select('nome').order('nome');
        if (data) datalist.innerHTML = data.map(c => `<option value="${c.nome}">`).join('');
    } catch (err) { console.error(err); }

    fetchServicosForSelect();
}

function togglePaymentField() {
    const val = parseFloat(document.getElementById('a-entrada').value || 0);
    const group = document.getElementById('a-forma-pagamento-group');
    const select = document.getElementById('a-forma-pagamento');
    if (group && select) {
        if (val > 0) {
            group.style.display = 'block';
            select.required = true;
        } else {
            group.style.display = 'none';
            select.required = false;
        }
    }
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
        togglePaymentField(); // Atualizar visibilidade da forma de pagamento
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
        const { data: agenda } = await supabaseClient.from('agendamentos').select('valor_pago, clientes(nome)').eq('id', id).single();
        const nomeCliente = agenda.clientes?.nome || nome;
        const valorJaPago = parseFloat(agenda.valor_pago || 0);
        const novoTotalPago = valorJaPago + restante;

        const { error } = await supabaseClient
            .from('agendamentos')
            .update({ valor_pago: novoTotalPago, pago: true, status: 'concluido' })
            .eq('id', id);

        if (error) throw error;

        // Registrar no financeiro com a forma de pagamento e DATA ATUAL LOCAL
        const dataLocal = new Date().toLocaleDateString('en-CA');
        await supabaseClient.from('financeiro').insert([{
            tipo: 'entrada',
            descricao: `Saldo de serviço: ${nomeCliente}`,
            valor: restante,
            forma_pagamento: forma,
            data: new Date(dataLocal + 'T12:00:00').toISOString(), // GARANTE DIA LOCAL
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
            const CACHE_NAME = 'atelier-v27';
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
    lucide.createIcons();
}

// (Funções showAgendaForm, hideAgendaForm, fetchServicosForSelect e updateAgendaPrice estão definidas no final do arquivo ou consolidadas abaixo)


// (O listener de submit de agenda foi movido para o bloco unificado abaixo)

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
        const localToday = now.toLocaleDateString('en-CA');
        let start = new Date(localToday + 'T00:00:00');
        let end = new Date(localToday + 'T23:59:59');

        switch (currentFinFilter) {
            case 'dia':
                // Já definido como localToday acima
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

        // Fix Timezone: Converter filtros locais para strings ISO comparáveis
        // Usamos T12:00:00Z como âncora para garantir que caia no dia solar correto
        const startISO = start.toISOString();
        const endISO = end.toISOString();

        query = query.gte('data', startISO).lte('data', endISO);

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

// (O listener de submit de edição financeira foi unificado abaixo)

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
    if (!items) return;

    const totalEntradas = items
        .filter(i => i.tipo === 'entrada')
        .reduce((sum, i) => sum + (parseFloat(i.valor || 0) || 0), 0);

    const totalSaidas = items
        .filter(i => i.tipo === 'saida')
        .reduce((sum, i) => sum + (parseFloat(i.valor || 0) || 0), 0);

    const saldoReal = totalEntradas - totalSaidas;

    const entEl = document.getElementById('fin-entradas');
    const saiEl = document.getElementById('fin-saidas');
    const salEl = document.getElementById('fin-saldo');

    if (entEl) entEl.innerText = `R$ ${totalEntradas.toFixed(2)}`;
    if (saiEl) saiEl.innerText = `R$ ${totalSaidas.toFixed(2)}`;
    if (salEl) {
        salEl.innerText = `R$ ${saldoReal.toFixed(2)}`;
        if (saldoReal > 0) salEl.style.color = '#2ecc71';
        else if (saldoReal < 0) salEl.style.color = '#e74c3c';
        else salEl.style.color = 'var(--secondary-color)';
    }

    // Atualizar Acerto (40, 50, 60% do Saldo Real)
    const a40 = document.getElementById('acerto-40');
    const a50 = document.getElementById('acerto-50');
    const a60 = document.getElementById('acerto-60');

    if (a40) a40.innerText = `R$ ${(saldoReal * 0.4).toFixed(2)}`;
    if (a50) a50.innerText = `R$ ${(saldoReal * 0.5).toFixed(2)}`;
    if (a60) a60.innerText = `R$ ${(saldoReal * 0.6).toFixed(2)}`;
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

// (O listener de submit de novo financeiro foi unificado abaixo)

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

// (O listener de submit de serviços foi unificado abaixo)

async function updateDashboard() {
    try {
        const today = new Date().toLocaleDateString('en-CA');
        // Limites do dia local em UTC (Ex: 03:00 de hoje até 02:59 de amanhã)
        const startOfDay = new Date(today + 'T00:00:00').toISOString();
        const endOfDay = new Date(today + 'T23:59:59').toISOString();

        // Contar agendamentos de hoje
        const { data: agenda } = await supabaseClient
            .from('agendamentos')
            .select('id')
            .gte('data_hora', startOfDay)
            .lte('data_hora', endOfDay);

        // Somar entradas financeiras de hoje (MESMO RANGE DO DIA LOCAL)
        const { data: finEntries } = await supabaseClient
            .from('financeiro')
            .select('valor')
            .eq('tipo', 'entrada')
            .gte('data', startOfDay) // AGORA USA O MESMO RANGE LOCAL
            .lte('data', endOfDay);

        const count = agenda?.length || 0;
        const revenue = finEntries?.reduce((sum, item) => {
            const val = parseFloat(item.valor || 0) || 0;
            return sum + val;
        }, 0) || 0;

        document.querySelectorAll('.stat-card').forEach(card => {
            const label = card.querySelector('.stat-label')?.innerText.toUpperCase();
            const valueEl = card.querySelector('.stat-value');
            if (label === 'HOJE') {
                if (valueEl) valueEl.innerText = count;
                const dashCount = document.getElementById('dashboard-count');
                if (dashCount) dashCount.innerText = count;
            }
            if (label === 'RECEITA DO DIA') {
                if (valueEl) valueEl.innerText = `R$ ${revenue.toFixed(2)}`;
                const dashRev = document.getElementById('dashboard-revenue');
                if (dashRev) dashRev.innerText = `R$ ${revenue.toFixed(2)}`;
            }
        });

        checkBirthdays();
    } catch (err) { console.error('Dashboard error:', err); }
}

// --- BLOCO UNIFICADO DE SUBMIT (v3.7) ---
document.addEventListener('submit', async (e) => {
    e.preventDefault();
    const target = e.target;

    // --- CLIENTES ---
    if (target.id === 'form-client') {
        const btn = document.getElementById('btn-save-client');
        btn.disabled = true;
        btn.innerText = 'Salvando...';
        try {
            const id = document.getElementById('c-id').value;
            const data = {
                nome: document.getElementById('c-nome').value,
                telefone: document.getElementById('c-telefone').value,
                instagram: document.getElementById('c-instagram').value,
                data_nascimento: document.getElementById('c-nascimento').value || null,
                observacoes: document.getElementById('c-obs').value,
                ficha_tecnica: document.getElementById('c-ficha').value
            };
            if (id) await supabaseClient.from('clientes').update(data).eq('id', id);
            else await supabaseClient.from('clientes').insert([data]);
            alert('✅ Cliente salvo!');
            hideClientForm();
            fetchClients();
        } catch (err) { alert('❌ Erro: ' + err.message); }
        finally { btn.disabled = false; btn.innerText = 'Salvar Cliente'; }
    }

    // --- AGENDA ---
    if (target.id === 'form-agenda') {
        const btn = document.getElementById('btn-save-agenda');
        btn.disabled = true;
        btn.innerText = 'Salvando...';
        try {
            const id = document.getElementById('a-id').value;
            const clienteNome = document.getElementById('a-cliente').value.trim();
            const servico = document.getElementById('a-servico').value;
            const dataHora = document.getElementById('a-data').value;
            const valor = parseFloat(document.getElementById('a-valor').value || 0);
            const entrada = parseFloat(document.getElementById('a-entrada').value || 0);

            let clienteId;
            const { data: existing, error: errExist } = await supabaseClient.from('clientes').select('id, ficha_tecnica').eq('nome', clienteNome).maybeSingle();
            if (errExist) throw errExist;

            if (existing) {
                clienteId = existing.id;
                const fichaNova = document.getElementById('a-ficha').value.trim();
                if (fichaNova && !(existing.ficha_tecnica || '').includes(fichaNova)) {
                    await supabaseClient.from('clientes').update({ ficha_tecnica: ((existing.ficha_tecnica || '') + '\n' + fichaNova).trim() }).eq('id', clienteId);
                }
            } else {
                const { data: novo, error: errNew } = await supabaseClient.from('clientes').insert([{ nome: clienteNome, telefone: document.getElementById('a-telefone').value, data_nascimento: document.getElementById('a-nascimento').value, ficha_tecnica: document.getElementById('a-ficha').value }]).select().single();
                if (errNew) throw errNew;
                clienteId = novo.id;
            }

            const agendaData = { cliente_id: clienteId, servico, data_hora: new Date(dataHora).toISOString(), valor, valor_pago: entrada, status: 'pendente' };
            if (id) {
                const { data: old, error: errOld } = await supabaseClient.from('agendamentos').select('valor_pago').eq('id', id).single();
                if (errOld) throw errOld;
                await supabaseClient.from('agendamentos').update(agendaData).eq('id', id);
                const diferenca = entrada - parseFloat(old?.valor_pago || 0);
                if (diferenca > 0) {
                    const dataLocal = new Date().toLocaleDateString('en-CA');
                    await supabaseClient.from('financeiro').insert([{ tipo: 'entrada', descricao: `Ajuste Entrada: ${clienteNome}`, valor: diferenca, data: new Date(dataLocal + 'T12:00:00').toISOString(), agendamento_id: id, forma_pagamento: document.getElementById('a-forma-pagamento').value || 'Pix' }]);
                }
            } else {
                const { data: agenda, error: errIns } = await supabaseClient.from('agendamentos').insert([agendaData]).select().single();
                if (errIns) throw errIns;
                if (entrada > 0) {
                    const dataLocal = new Date().toLocaleDateString('en-CA');
                    await supabaseClient.from('financeiro').insert([{ tipo: 'entrada', descricao: `Entrada: ${clienteNome}`, valor: entrada, data: new Date(dataLocal + 'T12:00:00').toISOString(), agendamento_id: agenda.id, forma_pagamento: document.getElementById('a-forma-pagamento').value || 'Pix' }]);
                }
            }
            alert('✅ Agendamento salvo!');
            hideAgendaForm();
            fetchAgenda();
            updateDashboard();
        } catch (err) { alert('❌ Erro: ' + err.message); }
        finally { btn.disabled = false; btn.innerText = 'Agendar'; }
    }

    // --- FINANÇAS (NOVO) ---
    if (target.id === 'form-financeiro') {
        const btn = document.getElementById('btn-save-financeiro');
        btn.disabled = true;
        try {
            const rawDate = document.getElementById('f-data').value;
            const valor = parseFloat(document.getElementById('f-valor').value.toString().replace(',', '.'));
            const data = {
                tipo: document.getElementById('f-tipo').value,
                descricao: document.getElementById('f-descricao').value,
                valor,
                data: new Date(rawDate + 'T12:00:00').toISOString(),
                forma_pagamento: document.getElementById('f-forma-pagamento').value
            };
            await supabaseClient.from('financeiro').insert([data]);
            alert('✅ Registro salvo!');
            hideFinanceiroForm();
            fetchFinanceiro();
            updateDashboard();
        } catch (err) { alert('❌ Erro: ' + err.message); }
        finally { btn.disabled = false; }
    }

    // --- FINANÇAS (EDIÇÃO) ---
    if (target.id === 'form-edit-financeiro') {
        try {
            const id = document.getElementById('ef-id').value;
            const data = {
                descricao: document.getElementById('ef-descricao').value,
                valor: parseFloat(document.getElementById('ef-valor').value),
                data: document.getElementById('ef-data').value
            };
            await supabaseClient.from('financeiro').update(data).eq('id', id);
            alert('✅ Transação atualizada!');
            hideEditFinForm();
            fetchFinanceiro();
            updateDashboard();
        } catch (err) { alert('❌ Erro: ' + err.message); }
    }

    // --- SERVIÇOS ---
    if (target.id === 'form-servico') {
        const btn = document.getElementById('btn-save-servico');
        btn.disabled = true;
        try {
            const id = document.getElementById('s-id').value;
            const data = { nome: document.getElementById('s-nome').value, valor: parseFloat(document.getElementById('s-valor').value) };
            if (id) await supabaseClient.from('servicos').update(data).eq('id', id);
            else await supabaseClient.from('servicos').insert([data]);
            alert('✅ Serviço salvo!');
            hideServicoForm();
            fetchServicos();
        } catch (err) { alert('❌ Erro: ' + err.message); }
        finally { btn.disabled = false; }
    }
});

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

// --- INICIALIZAÇÃO E SERVICE WORKER ---
window.addEventListener('DOMContentLoaded', () => {
    console.log('Atelier Aline Silva pronto! v3.7.1');
    lucide.createIcons();
    updateDashboard(); // Carregar stats iniciais

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker registrado!'))
            .catch(err => console.log('Erro no Service Worker:', err));
    }
});
