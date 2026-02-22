// --- Inicialização do Banco de Dados ---
let db;
const request = indexedDB.open("DuoGestaoDB", 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains("usuarios")) {
        const store = db.createObjectStore("usuarios", { keyPath: "usuario" });
        // Inserção do usuário administrador obrigatório
        store.add({ 
            usuario: "administrador", 
            senha: "Vdabrasil@1234", 
            nome: "Administrador do Sistema" 
        });
    }
};

request.onsuccess = (e) => {
    db = e.target.result;
    console.log("Banco DuoGestão pronto.");
};

// --- Gerenciamento de Telas ---
function navegarAuth(proximaTela) {
    document.querySelectorAll('.auth-card').forEach(card => card.classList.add('hidden'));
    document.getElementById(proximaTela).classList.remove('hidden');
}

function showToast(mensagem) {
    const area = document.getElementById('toast-area');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensagem;
    area.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3500);
}

// --- Funções de Autenticação ---

// Login
document.getElementById('formLogin').onsubmit = (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    const transaction = db.transaction(["usuarios"], "readonly");
    const store = transaction.objectStore("usuarios");
    const getReq = store.get(user);

    getReq.onsuccess = () => {
        const usuario = getReq.result;
        if (usuario && usuario.senha === pass) {
            document.getElementById('user-logged-name').innerText = `Olá, ${usuario.nome}`;
            document.getElementById('auth-wrapper').classList.add('hidden');
            document.getElementById('tlDashboard').classList.remove('hidden');
            showToast("Acesso autorizado!");
        } else {
            showToast("Usuário ou senha inválidos.");
        }
    };
};

// Primeiro Acesso
document.getElementById('formPrimeiroAcesso').onsubmit = (e) => {
    e.preventDefault();
    const nome = document.getElementById('reg-nome').value;
    const user = document.getElementById('reg-user').value;
    const pass = document.getElementById('reg-pass').value;
    const conf = document.getElementById('reg-pass-conf').value;

    if (pass !== conf) return showToast("As senhas não coincidem.");

    const transaction = db.transaction(["usuarios"], "readwrite");
    const store = transaction.objectStore("usuarios");
    
    const addReq = store.add({ usuario: user, senha: pass, nome: nome });
    
    addReq.onsuccess = () => {
        showToast("Cadastro realizado! Faça login.");
        navegarAuth('tlLogin');
    };
    addReq.onerror = () => showToast("Erro: Username já existe.");
};

// Esqueci Minha Senha
document.getElementById('formEsqueciSenha').onsubmit = (e) => {
    e.preventDefault();
    const user = document.getElementById('reset-user').value;
    const pass = document.getElementById('reset-pass').value;
    const conf = document.getElementById('reset-pass-conf').value;

    if (pass !== conf) return showToast("As senhas não coincidem.");

    const transaction = db.transaction(["usuarios"], "readwrite");
    const store = transaction.objectStore("usuarios");
    const getReq = store.get(user);

    getReq.onsuccess = () => {
        const usuario = getReq.result;
        if (!usuario) return showToast("Usuário não encontrado.");
        
        usuario.senha = pass;
        store.put(usuario);
        showToast("Senha redefinida com sucesso!");
        navegarAuth('tlLogin');
    };
};

function logout() {
    document.getElementById('tlDashboard').classList.add('hidden');
    document.getElementById('auth-wrapper').classList.remove('hidden');
    navegarAuth('tlLogin');
    showToast("Sessão encerrada.");
}

function limparLogin() {
    document.getElementById('formLogin').reset();
    showToast("Campos limpos.");
}