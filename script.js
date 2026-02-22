let db;
let sessionUser = null;
const mesesNome = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

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
    initMonthGrids();
};

// --- NAVEGAÇÃO E UI ---
function abrirModulo(id) {
    document.querySelectorAll('.modulo').forEach(m => m.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'tlMovimentacoes') renderMovimentacoes();
    if(id === 'tlInvestimentos') renderInvestimentos();
    if(id === 'tlPlanejamentos') renderPlanejamento();
    if(id.includes('Nova') || id.includes('Novo')) popularSelects();
}

function abrirConfig(id) {
    document.querySelectorAll('.sub-modulo').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function showToast(msg) {
    const area = document.getElementById('toast-area');
    const t = document.createElement('div'); t.className = 'toast'; t.innerText = msg;
    area.appendChild(t); setTimeout(() => t.remove(), 3000);
}

// --- LOGICA DE MESES ---
function initMonthGrids() {
    const grids = ['m-mes-inicio', 'm-mes-fim', 'i-duracao'];
    grids.forEach(id => {
        const el = document.getElementById(id);
        if(!el) return;
        el.innerHTML = mesesNome.map((m, i) => `
            <label class="month-item"><input type="checkbox" value="${m}"> ${m}</label>
        `).join('');
    });
}

function toggleFixaFields(val) {
    document.getElementById('campos-fixa').className = (val === 'Fixa') ? '' : 'hidden';
}

// --- MOVIMENTAÇÕES ---
document.getElementById('formNovaMov').onsubmit = (e) => {
    e.preventDefault();
    const fixa = document.getElementById('m-tipo').value === 'Fixa';
    const mov = {
        data: document.getElementById('m-data').value,
        descricao: document.getElementById('m-desc').value,
        valor: parseFloat(document.getElementById('m-valor').value),
        tipo: document.getElementById('m-tipo').value,
        operacao: document.getElementById('m-operacao').value,
        pc: document.getElementById('m-pc').value,
        cc: document.getElementById('m-cc').value,
        mesesInicio: fixa ? getCheckedMonths('m-mes-inicio') : [],
        mesesFim: fixa ? getCheckedMonths('m-mes-fim') : []
    };
    const tx = db.transaction("movimentacoes", "readwrite").objectStore("movimentacoes").add(mov);
    tx.onsuccess = () => { showToast("Movimentação salva!"); abrirModulo('tlMovimentacoes'); };
};

function renderMovimentacoes() {
    const tbody = document.querySelector("#tableMov tbody");
    tbody.innerHTML = "";
    db.transaction("movimentacoes").objectStore("movimentacoes").openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            const tr = document.createElement('tr');
            tr.className = `color-${cursor.value.operacao}`;
            tr.innerHTML = `
                <td><input type="checkbox" value="${cursor.value.id}"></td>
                <td>${cursor.value.data}</td>
                <td>${cursor.value.descricao}</td>
                <td>R$ ${cursor.value.valor.toFixed(2)}</td>
                <td>${cursor.value.operacao}</td>
            `;
            tr.onclick = (ev) => { if(ev.target.type !== 'checkbox') console.log("Editar ID:", cursor.value.id); };
            tbody.appendChild(tr);
            cursor.continue();
        }
    };
}

// --- PLANEJAMENTO ---
function renderPlanejamento() {
    const container = document.getElementById('lista-planejamento');
    container.innerHTML = "";
    const ano = 2026;

    mesesNome.forEach(mes => {
        const div = document.createElement('div');
        div.className = 'plan-month';
        div.innerHTML = `<div class="plan-header" onclick="this.nextElementSibling.classList.toggle('hidden')">
            <span>${mes}/${ano}</span> <span>+</span>
        </div><div class="plan-content hidden" id="plan-${mes}">Carregando...</div>`;
        container.appendChild(div);

        const content = div.querySelector('.plan-content');
        db.transaction("movimentacoes").objectStore("movimentacoes").getAll().onsuccess = (e) => {
            const fixas = e.target.result.filter(m => m.tipo === 'Fixa' && m.mesesInicio.includes(mes));
            content.innerHTML = fixas.length ? fixas.map(f => `<div>${f.descricao} - R$ ${f.valor.toFixed(2)}</div>`).join('') : "Nenhuma fixa para este mês.";
        };
    });
}

// --- INVESTIMENTOS ---
document.getElementById('formNovoInv').onsubmit = (e) => {
    e.preventDefault();
    const inv = {
        descricao: document.getElementById('i-desc').value,
        valor: parseFloat(document.getElementById('i-valor').value),
        duracao: getCheckedMonths('i-duracao'),
        pc: document.getElementById('i-pc').value,
        cc: document.getElementById('i-cc').value
    };
    db.transaction("investimentos", "readwrite").objectStore("investimentos").add(inv).onsuccess = () => {
        showToast("Investimento salvo!"); abrirModulo('tlInvestimentos');
    };
};

function renderInvestimentos() {
    const tbody = document.querySelector("#tableInv tbody");
    tbody.innerHTML = "";
    db.transaction("investimentos").objectStore("investimentos").openCursor().onsuccess = (e) => {
        const cursor = e.target.result;
        if(cursor) {
            tbody.innerHTML += `<tr>
                <td><input type="checkbox" value="${cursor.value.id}"></td>
                <td>${cursor.value.descricao}</td>
                <td>R$ ${cursor.value.valor.toFixed(2)}</td>
            </tr>`;
            cursor.continue();
        }
    };
}

// --- BACKUP ---
async function exportarBackup() {
    const data = {};
    const stores = ["usuarios", "centroCustos", "planoContas", "movimentacoes", "investimentos"];
    for (let s of stores) {
        data[s] = await new Promise(res => {
            db.transaction(s).objectStore(s).getAll().onsuccess = (e) => res(e.target.result);
        });
    }
    const blob = new Blob([JSON.stringify(data)], {type: "application/json"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `DuoGestao_Backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importarBackup(input) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = JSON.parse(e.target.result);
        for(let s in data) {
            const tx = db.transaction(s, "readwrite").objectStore(s);
            data[s].forEach(item => tx.put(item));
        }
        showToast("Backup importado!");
        setTimeout(() => location.reload(), 1000);
    };
    reader.readAsText(input.files[0]);
}

// --- AUXILIARES ---
function getCheckedMonths(id) {
    return Array.from(document.querySelectorAll(`#${id} input:checked`)).map(i => i.value);
}

function popularSelects() {
    const pcSelects = ['m-pc', 'i-pc', 'dash-pc'];
    const ccSelects = ['m-cc', 'i-cc', 'dash-cc'];
    
    db.transaction("planoContas").objectStore("planoContas").getAll().onsuccess = (e) => {
        const options = e.target.result.map(i => `<option value="${i.descricao}">${i.descricao}</option>`).join('');
        pcSelects.forEach(s => { const el = document.getElementById(s); if(el) el.innerHTML = options; });
    };
    db.transaction("centroCustos").objectStore("centroCustos").getAll().onsuccess = (e) => {
        const options = e.target.result.map(i => `<option value="${i.sigla}">${i.descricao}</option>`).join('');
        ccSelects.forEach(s => { const el = document.getElementById(s); if(el) el.innerHTML = options; });
    };
}

function toggleSelectAll(source, tableId) {
    document.querySelectorAll(`#${tableId} tbody input[type="checkbox"]`).forEach(c => c.checked = source.checked);
}

function excluirSelecionados(storeName) {
    const ids = Array.from(document.querySelectorAll('.modulo:not(.hidden) table tbody input:checked')).map(i => parseInt(i.value));
    if(!ids.length) return showToast("Selecione itens para excluir.");
    const tx = db.transaction(storeName, "readwrite");
    ids.forEach(id => tx.objectStore(storeName).delete(id));
    tx.oncomplete = () => { showToast("Excluído!"); abrirModulo('tl'+storeName.charAt(0).toUpperCase() + storeName.slice(1)); };
}

function logout() { location.reload(); }