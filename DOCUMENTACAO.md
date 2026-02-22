# Documentação do Sistema - DuoGestão

## v1.0.0 (22/02/2026) - Estrutura Inicial
- Objetivo: Gestão financeira para casais.
- Tecnologias: HTML5, CSS3, JavaScript (Vanilla), IndexedDB.
- Usuário Padrão (Permanente): administrador / Vdabrasil@1234.

## v1.1.0 (22/02/2026) - Autenticação
- Fluxos: `tlLogin`, `tlPrimeiroAcesso`, `tlEsqueciMinhaSenha`.
- Navegação: Header fixo com menu central e logoff.

## v1.2.0 (22/02/2026) - Módulos e Configurações (Controle de Versão)
- **tlDashboard:** Área de filtros (Data, Descrição, Tipo, Operação, Plano de Contas, Centro de Custo). Exibição de Gráfico de Pizza (Resumo) e tabela de movimentações. Somente leitura.
- **tlConfiguracoes:** Estrutura de sub-abas:
    - `tlCentroCustos`: Cadastro com Descrição, Sigla e Ativo (checkbox).
    - `tlPlanoContas`: Cadastro com Descrição e Ativo (checkbox).
    - `tlUsuarios`: Gestão de usuários (Nome, Usuário, Senha, Confirmação e Tipo de Acesso).
- **Regra de Segurança:** Apenas usuários do tipo "Administrador" podem criar outros usuários "Administrador".
- **Banco de Dados (IndexedDB):** Adicionadas stores `centroCustos` e `planoContas`. Atualizada store `usuarios` para conter `tipoAcesso`.