// --- DuoGestão Core Engine ---
let db;
let sessionUser = null;

const dbRequest = indexedDB.open("DuoGestaoDB", 4);

dbRequest.onupgradeneeded = (e) => {
    db = e.target.result;
    const stores = ["usuarios", "centroCustos", "planoContas"];
    stores.forEach(s => {
        if (!db.objectStoreNames.contains(s)) {
            const key = s === "usuarios" ? "usuario" : (s === "centroCustos" ? "sigla" : "descricao");
            db.createObjectStore(s, { keyPath: key });
        }
    });

    // Seed User Admin
    const tx = e.target.transaction.objectStore("usuarios");
    tx.put({ usuario: "administrador", senha: "Vdabrasil@1234", nome: "Administrador", tipo: "Administrador" });
};

dbRequest.onsuccess = (e) => db = e.target.result;

// --- Navegação ---
function navegarAuth(id) {
    document.querySelectorAll('.glass-card').forEach(c => c.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

function abrirModulo(id) {
    document.querySelectorAll('.modulo').forEach(m => m.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    // Efeito visual de ativo
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
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
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3000);
}

// --- Autenticação ---
document.getElementById('formLogin').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;

    const tx = db.transaction("usuarios", "readonly").objectStore("usuarios").get(u);
    tx.onsuccess = () => {
        const user = tx.result;
        if (user && user.senha === p) {
            sessionUser = user;
            document.getElementById('user-logged-info').innerText = user.nome;
            document.getElementById('auth-wrapper').classList.add('hidden');
            document.getElementById('tlApp').classList.remove('hidden');
            abrirModulo('tlDashboard');
            showToast("Bem-vindo ao DuoGestão");
        } else {
            showToast("Credenciais incorretas.");
        }
    };
};

// --- Gestão de Configurações ---
document.getElementById('formUsr').onsubmit = (e) => {
    e.preventDefault();
    const tipo = document.getElementById('u-tipo').value;
    if (tipo === "Administrador" && sessionUser.tipo !== "Administrador") {
        return showToast("Apenas admins podem criar novos admins.");
    }
    const p = document.getElementById('u-pass').value;
    const c = document.getElementById('u-pass-conf').value;
    if (p !== c) return showToast("Senhas não coincidem.");

    const payload = {
        nome: document.getElementById('u-nome').value,
        usuario: document.getElementById('u-user').value,
        senha: p,
        tipo: tipo
    };

    db.transaction("usuarios", "readwrite").objectStore("usuarios").add(payload).onsuccess = () => {
        showToast("Usuário cadastrado!"); e.target.reset();
    };
};

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

function logout() { location.reload(); }