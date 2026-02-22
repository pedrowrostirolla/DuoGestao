# Documentação do Sistema - DuoGestão

## v1.0.0 a v1.4.0 - Histórico
- Estrutura base, Autenticação, Configurações (Centro de Custos, Plano de Contas, Usuários) e Redesign Glassmorphism (Bloqueado).

## v1.5.0 (22/02/2026) - Movimentações e Financeiro (ATUAL)
- **tlMovimentacoes:** Gestão de lançamentos com diferenciação por cores:
    - Entrada: Verde | Saída: Vermelho | Investimento: Azul.
- **tlNovaMovimentacao:** Lógica de recorrência Fixa/Variável. Se Fixa, permite seleção de intervalo de meses (Início/Fim).
- **tlPlanejamento:** Visualização mensal expandível das movimentações do tipo "FIXA".
- **tlInvestimentos:** Controle específico de aportes com duração mensal.
- **Backup (Configurações):** Sub-aba para Exportar e Importar todo o banco de dados em formato JSON.
- **Banco de Dados:** Atualizado para v7 com stores `movimentacoes` e `investimentos`.