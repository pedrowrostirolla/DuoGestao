let db;
let sessionUser = null;
const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// IndexedDB v7
const dbRequest = indexedDB.open("DuoGestaoDB", 7);

dbRequest.onupgradeneeded = (e) => {
    db = e.target.result;
    const stores = ["usuarios", "centroCustos", "planoContas", "movimentacoes", "investimentos"];
    stores.forEach(s => {
        if (!db.objectStoreNames.contains(s)) {
            const pk = (s === 'usuarios') ? 'usuario' : (s === 'centroCustos' ? 'sigla' : (s === 'movimentacoes' || s === 'investimentos' ? 'id' : 'descricao'));
            db.createObjectStore(s, { keyPath: pk, autoIncrement: (s === 'movimentacoes' || s === 'investimentos') });
        }
    });
};

dbRequest.onsuccess = (e) => {
    db = e.target.result;
    initGrids();
};

// --- NAVEGAÇÃO ---
function navegarAuth(id) {
    document.querySelectorAll('.glass-card').forEach(c => c.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function abrirModulo(id) {
    document.querySelectorAll('.modulo').forEach(m => m.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'tlMovimentacoes') renderMovimentacoes();
    if(id === 'tlInvestimentos') renderInvestimentos();
    if(id === 'tlPlanejamentos') renderPlanejamento();
    if(id === 'tlConfiguracoes') renderConfiguracoes();
    if(id.includes('Nova') || id.includes('Novo')) popularSelects();
}

function abrirConfig(id) {
    document.querySelectorAll('.sub-modulo').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// --- INTERFACE ---
function initGrids() {
    const ids = ['m-mes-inicio', 'm-mes-fim', 'i-duracao'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerHTML = MESES.map(m => `<label class="month-item"><input type="checkbox" value="${m}"> ${m}</label>`).join('');
    });
}

function toggleFixaFields(val) {
    document.getElementById('campos-fixa').classList.toggle('hidden', val !== 'Fixa');
}

function showToast(msg) {
    const area = document.getElementById('toast-area');
    const t = document.createElement('div'); t.className = 'toast'; t.innerText = msg;
    area.appendChild(t); setTimeout(() => t.remove(), 3000);
}

// --- MOVIMENTAÇÕES ---
document.getElementById('formNovaMov').onsubmit = (e) => {
    e.preventDefault();
    const mov = {
        data: document.getElementById('m-data').value,
        descricao: document.getElementById('m-desc').value,
        valor: parseFloat(document.getElementById('m-valor').value),
        tipo: document.getElementById('m-tipo').value,
        operacao: document.getElementById('m-operacao').value,
        pc: document.getElementById('m-pc').value,
        cc: document.getElementById('m-cc').value,
        mesesInicio: getChecked('m-mes-inicio'),
        mesesFim: getChecked('m-mes-fim')
    };
    db.transaction("movimentacoes", "readwrite").objectStore("movimentacoes").add(mov).onsuccess = () => {
        showToast("Lançamento concluído."); abrirModulo('tlMovimentacoes');
    };
};

function renderMovimentacoes() {
    const tbody = document.querySelector("#tableMov tbody"); tbody.innerHTML = "";
    db.transaction("movimentacoes").objectStore("movimentacoes").openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            const tr = document.createElement('tr');
            tr.className = `color-${cursor.value.operacao}`;
            tr.innerHTML = `<td><input type="checkbox" value="${cursor.value.id}"></td>
                            <td>${cursor.value.data}</td><td>${cursor.value.descricao}</td>
                            <td>R$ ${cursor.value.valor.toFixed(2)}</td><td>${cursor.value.operacao}</td>`;
            tr.onclick = (ev) => { if(ev.target.type !== 'checkbox') console.log("Edição ID:", cursor.value.id); };
            tbody.appendChild(tr); cursor.continue();
        }
    };
}

// --- PLANEJAMENTO (VISUALIZAÇÃO APENAS) ---
function renderPlanejamento() {
    const container = document.getElementById('lista-planejamento'); container.innerHTML = "";
    MESES.forEach(mes => {
        const div = document.createElement('div'); div.className = 'plan-month';
        div.innerHTML = `<div class="plan-header" onclick="this.nextElementSibling.classList.toggle('hidden')">
                            <span>${mes}/2026</span><span>+</span></div>
                         <div class="plan-content hidden">Aguarde...</div>`;
        container.appendChild(div);
        const content = div.querySelector('.plan-content');
        db.transaction("movimentacoes").objectStore("movimentacoes").getAll().onsuccess = (e) => {
            const fixas = e.target.result.filter(m => m.tipo === 'Fixa' && m.mesesInicio.includes(mes));
            content.innerHTML = fixas.length ? fixas.map(f => `<div>${f.descricao} - R$ ${f.valor.toFixed(2)}</div>`).join('') : "Sem fixas planejadas.";
        };
    });
}

// --- INVESTIMENTOS ---
document.getElementById('formNovoInv').onsubmit = (e) => {
    e.preventDefault();
    const inv = {
        descricao: document.getElementById('i-desc').value,
        valor: parseFloat(document.getElementById('i-valor').value),
        duracao: getChecked('i-duracao'),
        pc: document.getElementById('i-pc').value,
        cc: document.getElementById('i-cc').value
    };
    db.transaction("investimentos", "readwrite").objectStore("investimentos").add(inv).onsuccess = () => {
        showToast("Investimento salvo."); abrirModulo('tlInvestimentos');
    };
};

function renderInvestimentos() {
    const tbody = document.querySelector("#tableInv tbody"); tbody.innerHTML = "";
    db.transaction("investimentos").objectStore("investimentos").openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            tbody.innerHTML += `<tr><td><input type="checkbox" value="${cursor.value.id}"></td>
                                <td>${cursor.value.descricao}</td><td>R$ ${cursor.value.valor.toFixed(2)}</td></tr>`;
            cursor.continue();
        }
    };
}

// --- CONFIGURAÇÕES E BACKUP ---
function renderConfiguracoes() {
    renderTableConfig("centroCustos", "tableCC", ["sigla", "descricao", "ativo"]);
    renderTableConfig("planoContas", "tablePC", ["descricao", "ativo"]);
    renderTableConfig("usuarios", "tableUsr", ["nome", "usuario", "tipo"]);
}

function renderTableConfig(store, tableId, fields) {
    const tbody = document.querySelector(`#${tableId} tbody`); tbody.innerHTML = "";
    db.transaction(store).objectStore(store).openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            const tr = document.createElement('tr');
            tr.innerHTML = fields.map(f => `<td>${f==='ativo'?(cursor.value[f]?'Ativo':'Inativo'):cursor.value[f]}</td>`).join('');
            tbody.appendChild(tr); cursor.continue();
        }
    };
}

async function exportarBackup() {
    const out = {};
    const stores = ["usuarios", "centroCustos", "planoContas", "movimentacoes", "investimentos"];
    for(let s of stores) out[s] = await new Promise(r => db.transaction(s).objectStore(s).getAll().onsuccess = (e) => r(e.target.result));
    const blob = new Blob([JSON.stringify(out)], {type: "application/json"});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = "DuoGestao_Backup.json"; a.click();
}

function importarBackup(input) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        for(let s in data) {
            const tx = db.transaction(s, "readwrite").objectStore(s);
            data[s].forEach(item => tx.put(item));
        }
        showToast("Importação completa!"); setTimeout(() => location.reload(), 1000);
    };
    reader.readAsText(input.files[0]);
}

// --- HELPERS ---
function getChecked(id) { return Array.from(document.querySelectorAll(`#${id} input:checked`)).map(i => i.value); }

function popularSelects() {
    db.transaction("planoContas").objectStore("planoContas").getAll().onsuccess = (e) => {
        const h = e.target.result.map(i => `<option value="${i.descricao}">${i.descricao}</option>`).join('');
        ['m-pc', 'i-pc'].forEach(id => document.getElementById(id).innerHTML = h);
    };
    db.transaction("centroCustos").objectStore("centroCustos").getAll().onsuccess = (e) => {
        const h = e.target.result.map(i => `<option value="${i.sigla}">${i.descricao}</option>`).join('');
        ['m-cc', 'i-cc'].forEach(id => document.getElementById(id).innerHTML = h);
    };
}

function toggleSelectAll(src, tid) { document.querySelectorAll(`#${tid} tbody input`).forEach(c => c.checked = src.checked); }

function excluirSelecionados(store) {
    const ids = Array.from(document.querySelectorAll('.modulo:not(.hidden) tbody input:checked')).map(i => parseInt(i.value));
    const tx = db.transaction(store, "readwrite");
    ids.forEach(id => tx.objectStore(store).delete(id));
    tx.oncomplete = () => { showToast("Itens excluídos."); abrirModulo('tl'+store.charAt(0).toUpperCase() + store.slice(1)); };
}

// --- LOGIN ---
document.getElementById('formLogin').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    db.transaction("usuarios").objectStore("usuarios").get(u).onsuccess = (ev) => {
        const user = ev.target.result;
        if((u==='administrador' && p==='Vdabrasil@1234') || (user && user.senha === p)) {
            sessionUser = user || {nome: "Mestre", tipo: "Administrador"};
            document.getElementById('user-logged-info').innerText = sessionUser.nome;
            document.getElementById('auth-wrapper').classList.add('hidden');
            document.getElementById('tlApp').classList.remove('hidden');
            abrirModulo('tlDashboard');
        } else showToast("Erro de login.");
    };
};

function logout() { location.reload(); }