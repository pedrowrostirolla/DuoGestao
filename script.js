// Configuração do Banco de Dados (IndexedDB)
let db;
const request = indexedDB.open("DuoGestaoDB", 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains("usuarios")) {
        db.createObjectStore("usuarios", { keyPath: "usuario" });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Banco de dados pronto.");
};

// Sistema de Alertas (Toast)
function showToast(mensagem, tipo = 'sucesso') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensagem;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// Lógica de Login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    // Validação do Administrador conforme regra obrigatória
    if (user === 'administrador' && pass === 'Vdabrasil@1234') {
        showToast('Login realizado com sucesso!');
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('main-layout').classList.remove('hidden');
    } else {
        showToast('Credenciais inválidas!', 'erro');
    }
});

// Navegação Básica
document.querySelectorAll('.sidebar li').forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        document.getElementById('page-title').innerText = page.charAt(0).toUpperCase() + page.slice(1);
        showToast(`Carregando ${page}...`);
    });
});
