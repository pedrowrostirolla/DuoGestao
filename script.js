// --- DuoGestão Core System ---
let db;
let sessionUser = null;

// Inicialização do Banco de Dados v6
const dbRequest = indexedDB.open("DuoGestaoDB", 6);

dbRequest.onupgradeneeded = (e) => {
    db = e.target.result;
    const schemas = [
        { name: "usuarios", key: "usuario" },
        { name: "centroCustos", key: "sigla" },
        { name: "planoContas", key: "descricao" }
    ];

    schemas.forEach(s => {
        if (!db.objectStoreNames.contains(s.name)) {
            db.createObjectStore(s.name, { keyPath: s.key });
        }
    });

    // Usuário Administrador Mestre
    const tx = e.target.transaction.objectStore("usuarios");
    tx.put({ usuario: "administrador", senha: "Vdabrasil@1234", nome: "Administrador", tipo: "Administrador" });
};

dbRequest.onsuccess = (e) => {
    db = e.target.result;
    console.log("DuoGestão DB Conectado.");
    if (sessionUser) renderAllGrids();
};

// --- Gerenciamento de Interface ---
function navegarAuth(id) {
    document.querySelectorAll('.glass-card').forEach(c => c.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function abrirModulo(id) {
    document.querySelectorAll('.modulo').forEach(m => m.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if(id === 'tlConfiguracoes') renderAllGrids();
}

function abrirConfig(id) {
    document.querySelectorAll('.sub-modulo').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    renderAllGrids();
}

function showToast(msg) {
    const area = document.getElementById('toast-area');
    const t = document.createElement('div');
    t.className = 'toast'; t.innerText = msg;
    area.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3000);
}

// --- Renderização Dinâmica de Grids ---
function updateTable(storeName, tableId, columns) {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    tbody.innerHTML = "";

    const tx = db.transaction(storeName, "readonly").objectStore(storeName).openCursor();
    tx.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
            const tr = document.createElement('tr');
            tr.innerHTML = columns.map(col => {
                let val = cursor.value[col];
                if (col === 'ativo') val = val ? "Ativo" : "Inativo";
                return `<td>${val}</td>`;
            }).join('');
            
            // Seleção para edição futura
            tr.onclick = () => carregarDadosEdicao(storeName, cursor.value);
            
            tbody.appendChild(tr);
            cursor.continue();
        }
    };
}

function renderAllGrids() {
    updateTable("centroCustos", "tableCC", ["sigla", "descricao", "ativo"]);
    updateTable("planoContas", "tablePC", ["descricao", "ativo"]);
    updateTable("usuarios", "tableUsr", ["nome", "usuario", "tipo"]);
}

// --- Operações de Cadastro ---

// Centro de Custos
document.getElementById('formCC').onsubmit = (e) => {
    e.preventDefault();
    const obj = {
        descricao: document.getElementById('cc-desc').value,
        sigla: document.getElementById('cc-sigla').value,
        ativo: document.getElementById('cc-ativo').checked
    };
    db.transaction("centroCustos", "readwrite").objectStore("centroCustos").put(obj).onsuccess = () => {
        showToast("Centro de custo salvo!");
        e.target.reset();
        renderAllGrids();
    };
};

// Plano de Contas
document.getElementById('formPC').onsubmit = (e) => {
    e.preventDefault();
    const obj = {
        descricao: document.getElementById('pc-desc').value,
        ativo: document.getElementById('pc-ativo').checked
    };
    db.transaction("planoContas", "readwrite").objectStore("planoContas").put(obj).onsuccess = () => {
        showToast("Plano de contas salvo!");
        e.target.reset();
        renderAllGrids();
    };
};

// Usuários
document.getElementById('formUsr').onsubmit = (e) => {
    e.preventDefault();
    const p1 = document.getElementById('u-pass').value;
    const p2 = document.getElementById('u-pass-conf').value;
    const tipo = document.getElementById('u-tipo').value;

    if (p1 !== p2) return showToast("Senhas não conferem.");
    if (tipo === "Administrador" && sessionUser.tipo !== "Administrador") {
        return showToast("Acesso negado para criar Administradores.");
    }

    const obj = {
        nome: document.getElementById('u-nome').value,
        usuario: document.getElementById('u-user').value,
        senha: p1,
        tipo: tipo
    };

    db.transaction("usuarios", "readwrite").objectStore("usuarios").put(obj).onsuccess = () => {
        showToast("Usuário registrado!");
        e.target.reset();
        renderAllGrids();
    };
};

// --- Sistema de Login ---
document.getElementById('formLogin').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;

    // Login especial Admin Mestre ou consulta DB
    const tx = db.transaction("usuarios", "readonly").objectStore("usuarios").get(u);
    tx.onsuccess = () => {
        const user = tx.result;
        if ((u === 'administrador' && p === 'Vdabrasil@1234') || (user && user.senha === p)) {
            sessionUser = user || { nome: "Mestre", tipo: "Administrador" };
            document.getElementById('user-logged-info').innerText = sessionUser.nome;
            document.getElementById('auth-wrapper').classList.add('hidden');
            document.getElementById('tlApp').classList.remove('hidden');
            abrirModulo('tlDashboard');
        } else {
            showToast("Usuário ou senha inválidos.");
        }
    };
};

function logout() { location.reload(); }