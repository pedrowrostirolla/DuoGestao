# Documentação do Sistema - DuoGestão

## v1.0.0 (22/02/2026) - Estrutura Inicial
- Objetivo: Gestão financeira para casais.
- Tecnologias: HTML5, CSS3, JavaScript (Vanilla), IndexedDB.
- Usuário Padrão: administrador / Vdabrasil@1234 (Permanente).

## v1.1.0 (22/02/2026) - Sistema de Autenticação e Layout
- **Novas Telas de Fluxo:** - `tlLogin`: Tela inicial obrigatória com campos de username e senha.
    - `tlPrimeiroAcesso`: Cadastro de novos usuários (Nome, Usuário, Senha, Confirmar Senha).
    - `tlEsqueciMinhaSenha`: Redefinição de senha com validação de existência do usuário.
- **Layout tlDashboard:**
    - Cabeçalho (Header) fixo com Logomarca à esquerda.
    - Menu central com botões: Dashboard, Movimentações, Planejamentos, Investimentos, Configurações.
    - Lado direito: Identificação do usuário logado e botão "Sair".
- **Padronização:** Botões "Salvar" e "Cancelar" presentes em todos os formulários; Alertas tratados no canto inferior direito.
- **Regras de Negócio:** Bloqueio de alteração de senha caso o usuário não exista; Persistência via IndexedDB.