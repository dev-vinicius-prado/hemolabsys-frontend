# 📋 Requisitos — HemolabSys Backend

Esta pasta contém todos os requisitos funcionais e não-funcionais do sistema.

---

## 📄 Documentos

### [functional-requirements.md](functional-requirements.md)
**Requisitos Funcionais e User Stories (v2.1)**

**Principais Módulos:**

#### 1. Gestão de Insumos
- Cadastro de insumos (nome, categoria, descrição, unidade de medida)
- Vinculação com fornecedores
- Controle de estoque mínimo
- Identificação por QR Code/Código de Barras

#### 2. Controle de Estoque
- Entrada de insumos (NF-e, lote, validade, quantidade)
- Saída de insumos (solicitação, lote FEFO)
- Ajustes manuais (com justificativa)
- Descarte de vencidos (automático ou manual)

#### 3. Solicitações de Insumos
- Criação de solicitações por setor
- Aprovação hierárquica (Responsável → Gerente)
- Atendimento parcial ou total
- Histórico de solicitações

#### 4. Alertas e Notificações
- Estoque mínimo atingido
- Insumos próximos ao vencimento (30/15/7 dias)
- Solicitações pendentes de aprovação
- Notificações em tempo real (WebSocket)

#### 5. Dashboard e Relatórios
- Visão geral do estoque
- Movimentações recentes
- Alertas ativos
- Gráficos de consumo

#### 6. Auditoria e Rastreabilidade
- Histórico completo de movimentações
- Registro de quem fez cada operação
- Justificativas para ajustes
- Logs de alterações

---

## 🎯 User Stories

### Backlog Refinado de User Stories

**Fluxo 1: Dashboard e Visibilidade (RF-04)**

| **ID** | **User Story**                                                                                                                                            | **Prioridade (MoSCoW)** | **Acceptance Criteria**                                                                                                                                                                           |
|--------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| US-01  | Como Coordenador, eu quero um dashboard com overview do estoque em tempo real para que eu possa identificar itens críticos e autorizar ações preventivas. | Alta (Must)             | - Cards com total de itens, críticos e consumo diário (por setor). - Atualização automática a cada 30s via WebSocket. - Filtros por categoria (coleta/limpeza/administrativo); mobile responsivo. |
| US-02  | Como Estoquista, eu quero uma lista de alertas visíveis no dashboard para que eu possa agir em estoques baixos ou validades próximas.                     | Alta (Must)             | - Alertas em cards (ex.: vencimento em 30/15/1 dia). - **Subtração automática de quantidades vencidas no dia 1 do vencimento.** - Notificações push/e-mail; marcar como "resolvido".              |

**Fluxo 2: Gerenciamento de Produtos e Rastreabilidade (RF-06, RF-02)**

| **ID** | **User Story**                                                                                                                       | **Prioridade (MoSCoW)** | **Acceptance Criteria**                                                                                                                                                                                   |
|--------|--------------------------------------------------------------------------------------------------------------------------------------|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| US-03  | Como Estoquista, eu quero cadastrar/editar insumos com lote obrigatório para que eu garanta rastreabilidade (conforme RDC 302/2005). | Alta (Must)             | - Formulário com dropdowns (categoria, fornecedor); **lote como código de conjunto, validade por unidade**. - Toggle para obrigatório; validação de campos; insumos pré-cadastrados para adições rápidas. |
| US-04  | Como Gerente, eu quero visualizar lotes por insumo para que eu acompanhe vencimentos e audite conformidade VISA.                     | Média (Should)          | - Modal com tabela (lote, validade, qtd); filtro por data; export para relatórios.                                                                                                                        |

**Fluxo 3: Entradas e Retiradas (RF-01, RF-03)**

| **ID** | **User Story**                                                                                                                         | **Prioridade (MoSCoW)** | **Acceptance Criteria**                                                                                                                                     |
|--------|----------------------------------------------------------------------------------------------------------------------------------------|-------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| US-05  | Como Estoquista, eu quero registrar entrada de insumos para que o estoque seja atualizado automaticamente.                             | Alta (Must)             | - Formulário: insumo pré-cadastrado, qtd, lote; import NF-e. - Gera movimentação 'E' e trigger para estoque; notificação de sucesso.                        |
| US-06  | Como Estoquista, eu quero registrar retirada de insumos com solicitante (setor/colaborador) para que haja controle de consumo por uso. | Alta (Must)             | - Seleção de insumo + verificação estoque; **registrar solicitante obrigatório**. - Habilita qtd só se > mínimo; gera 'S' e atualiza estoque; tempo <5 min. |
| US-07  | Como Coordenador, eu quero aprovar retiradas para ponto de coleta para que eu controle acessos e evite excessos.                       | Alta (Must)             | - Lista de pendentes com solicitante; ações aprovar/rejeitar. - **Hierarquia: Coordenador para ponto, Gerente para Central**; notificação ao estoquista.    |
| US-08  | Como Estoquista, eu quero realizar contagens físicas para que eu reconcilie discrepâncias e ajuste estoque.                            | Média (Should)          | - Inventário semanal com scanner; tipo 'A' para ajustes; alerta se variação >10%.                                                                           |

**Fluxo 4: Pedidos e Solicitações (RF-09, INT-01/02)**

| **ID** | **User Story**                                                                                                      | **Prioridade (MoSCoW)** | **Acceptance Criteria**                                                                                                                                             |
|--------|---------------------------------------------------------------------------------------------------------------------|-------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| US-09  | Como Estoquista, eu quero gerar solicitação automática para Central após retirada crítica para que eu evite faltas. | Alta (Must)             | - **Geração se qtd após retirada ≤ mínimo (sem zerar); aprovação por Coordenador/Gerente**. - Integração ERP para status; requisições semanais baseadas em consumo. |
| US-10  | Como Gerente, eu quero rastrear solicitações para Central para que eu audite fluxos e custos.                       | Média (Should)          | - Histórico com status/autorizações; filtros por data/setor; export PDF.                                                                                            |

**Fluxo 5: Relatórios e Alertas (RF-07, RF-05)**

| **ID** | **User Story**                                                                                                 | **Prioridade (MoSCoW)** | **Acceptance Criteria**                                                                               |
|--------|----------------------------------------------------------------------------------------------------------------|-------------------------|-------------------------------------------------------------------------------------------------------|
| US-11  | Como Gerente, eu quero relatórios de consumo e vencimentos para que eu meça desperdícios e ROI.                | Alta (Must)             | - Filtros por período/solicitante; gráficos de giro; **incluir subtração de vencidos**; export Excel. |
| US-12  | Como Coordenador, eu quero configurar alertas de validade para que eu receba avisos escalonados (30/15/1 dia). | Média (Should)          | - Tela de params: thresholds por insumo; notificações automáticas; **subtração no vencimento**.       |

**Fluxo 6: Usuários e Segurança (RNF-03)**

| **ID** | **User Story**                                                                                                | **Prioridade (MoSCoW)** | **Acceptance Criteria**                                                         |
|--------|---------------------------------------------------------------------------------------------------------------|-------------------------|---------------------------------------------------------------------------------|
| US-13  | Como Gerente, eu quero gerenciar perfis para que eu defina acessos hierárquicos (Estoquista vs. Coordenador). | Média (Should)          | - Associação via perfis; roles para aprovações; logs de ações para LGPD/ANVISA. |
| US-14  | Como Estoquista, eu quero acesso mobile para retiradas para que eu registre no local sem atrasos.             | Baixa (Could)           | - App responsivo com QR Code para insumos; sincronização offline.               |

---

## 🔍 Como Usar

### Consultar Requisitos

```bash
# Buscar por palavra-chave
grep -i "alerta" functional-requirements.md

# Listar todas as user stories
grep "^### US-" functional-requirements.md
```

### Adicionar Novo Requisito

1. **Abra `functional-requirements.md`**
2. **Adicione nova user story:**

```markdown
### US-XXX: Título da User Story
**Como** [papel]  
**Quero** [ação]  
**Para** [benefício]

**Critérios de Aceite:**
- ✅ [Critério 1]
- ✅ [Critério 2]

**Regras de Negócio:**
- [Regra 1]

**Dependências:**
- [Dependência 1]
```

3. **Notifique a equipe**

---

## 📐 Rastreabilidade

### Requisito → Implementação (Exemplos)

| Requisito | Tabelas                                | Endpoints                     | Testes                    |
|-----------|----------------------------------------|-------------------------------|---------------------------|
| US-01     | `insumo`, `insumo_fornecedor`          | `POST /insumos`               | `InsumoServiceTest`       |
| US-02     | `lote`, `estoque_lote`, `movimentacao` | `POST /movimentacoes/entrada` | `MovimentacaoServiceTest` |
| US-03     | `solicitacao`, `solicitacao_item`      | `POST /solicitacoes`          | `SolicitacaoServiceTest`  |

### Requisito → ADR (Exemplos)

| Requisito                      | ADR Relacionada                    |
|--------------------------------|------------------------------------|
| US-08 (Contagem Física)        | ADR-XXX (Processamento de Ajustes) |
| US-09 (Solicitação Automática) | ADR-XXX (Integração ERP)           |
| US-10 (Rastrear Solicitações)  | ADR-XXX (Relatórios e Auditoria)   |

---

## 📚 Recursos

- [User Story Mapping](https://www.jpattonassociates.com/user-story-mapping/)
- [Acceptance Criteria Best Practices](https://www.agilealliance.org/glossary/acceptance-criteria/)

---

[← Voltar para Documentação](../README.md)
