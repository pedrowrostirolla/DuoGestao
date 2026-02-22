let db;
let loggedUser = null;

// Inicialização do Banco de Dados
const request = indexedDB.open("DuoGestaoDB", 3);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("usuarios")) {
        const store = db.createObjectStore("usuarios", { keyPath: "usuario" });
        store.add({ usuario: "administrador", senha: "Vdabrasil@1234", nome: "Admin", tipo: "Administrador" });
    }
    if (!db.objectStoreNames.contains("centroCustos")) db.createObjectStore("centroCustos", { keyPath: "sigla" });
    if (!db.objectStoreNames.contains("planoContas")) db.createObjectStore("planoContas", { keyPath: "descricao" });
};

request.onsuccess = (e) => db = e.target.result;

// Navegação
function navegarAuth(id) {
    document.querySelectorAll('.auth-card').forEach(c => c.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function abrirModulo(id) {
    document.querySelectorAll('.modulo').forEach(m => m.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function abrirConfig(id) {
    document.querySelectorAll('.sub-modulo').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function showToast(msg) {
    const area = document.getElementById('toast-area');
    const t = document.createElement('div');
    t.className = 'toast'; t.innerText = msg;
    area.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

// Lógica de Login
document.getElementById('formLogin').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;

    const tx = db.transaction("usuarios", "readonly").objectStore("usuarios").get(u);
    tx.onsuccess = () => {
        const user = tx.result;
        if (user && user.senha === p) {
            loggedUser = user;
            document.getElementById('user-logged-info').innerText = `${user.nome} (${user.tipo})`;
            document.getElementById('auth-wrapper').classList.add('hidden');
            document.getElementById('tlApp').classList.remove('hidden');
            abrirModulo('tlDashboard');
            showToast("Login bem-sucedido!");
        } else {
            showToast("Usuário ou senha inválidos.");
        }
    };
};

// Cadastro de Usuários (Config)
document.getElementById('formUsr').onsubmit = (e) => {
    e.preventDefault();
    const tipo = document.getElementById('u-tipo').value;
    
    if (tipo === "Administrador" && loggedUser.tipo !== "Administrador") {
        return showToast("Apenas administradores criam novos admins.");
    }

    const p = document.getElementById('u-pass').value;
    const c = document.getElementById('u-pass-conf').value;
    if (p !== c) return showToast("Senhas não coincidem.");

    const novo = {
        nome: document.getElementById('u-nome').value,
        usuario: document.getElementById('u-user').value,
        senha: p,
        tipo: tipo
    };

    const tx = db.transaction("usuarios", "readwrite").objectStore("usuarios").add(novo);
    tx.onsuccess = () => { showToast("Usuário salvo!"); e.target.reset(); };
    tx.onerror = () => showToast("Erro: Username já existe.");
};

// Cadastro Centro de Custo
document.getElementById('formCC').onsubmit = (e) => {
    e.preventDefault();
    const data = {
        descricao: document.getElementById('cc-desc').value,
        sigla: document.getElementById('cc-sigla').value,
        ativo: document.getElementById('cc-ativo').checked
    };
    db.transaction("centroCustos", "readwrite").objectStore("centroCustos").add(data).onsuccess = () => {
        showToast("Centro de Custo salvo!"); e.target.reset();
    };
};

// Cadastro Plano de Contas
document.getElementById('formPC').onsubmit = (e) => {
    e.preventDefault();
    const data = {
        descricao: document.getElementById('pc-desc').value,
        ativo: document.getElementById('pc-ativo').checked
    };
    db.transaction("planoContas", "readwrite").objectStore("planoContas").add(data).onsuccess = () => {
        showToast("Plano de Contas salvo!"); e.target.reset();
    };
};

function logout() {
    location.reload();
}