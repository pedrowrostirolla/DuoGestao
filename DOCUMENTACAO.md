# Documentação do Sistema - DuoGestão

## v1.0.0 (22/02/2026) - Estrutura Inicial
- Objetivo: Gestão financeira para casais.
- Usuário Padrão: administrador / Vdabrasil@1234.

## v1.1.0 (22/02/2026) - Fluxo de Autenticação
- Telas: `tlLogin`, `tlPrimeiroAcesso`, `tlEsqueciMinhaSenha`.

## v1.2.0 (22/02/2026) - Configurações e Dashboard
- Implementação de Centro de Custos, Plano de Contas e Gestão de Usuários.
- Filtros de Dashboard integrados.

## v1.3.0 (22/02/2026) - Redesign Elegante (BLOQUEADO)
- Estilo: Glassmorphism (Neon Cyan & Dark Slate).
- Status: Layout e textos protegidos contra alterações automáticas.

## v1.4.0 (22/02/2026) - Gestão de Dados em Configurações (ATUAL)
- **Visualização em Linha:** Adicionadas tabelas dinâmicas abaixo dos formulários de cadastro.
- **Componentes:**
    - `tlCentroCustos`: Grid com Sigla, Descrição e Status.
    - `tlPlanoContas`: Grid com Descrição e Status.
    - `tlUsuarios`: Grid com Nome, Usuário e Tipo de Acesso.
- **Interatividade:** Clique na linha da tabela prepara o sistema para seleção/edição.
- **Banco de Dados:** Versão 6 do IndexedDB com persistência total.