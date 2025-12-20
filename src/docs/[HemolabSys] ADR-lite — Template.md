# ADR-lite — HemoLabSys

Este documento define **o modelo oficial de ADR-lite** do HemoLabSys e registra as **decisões arquiteturais fundacionais** já tomadas.

Ele existe para dar **ordem, previsibilidade e segurança técnica** ao projeto.

---

## 📐 O que é um ADR-lite neste projeto

Um ADR-lite é um **registro curto e objetivo** de uma decisão técnica relevante.

Ele não serve para discutir indefinidamente, mas para:

* Registrar contexto
* Explicar a decisão
* Tornar explícitas as consequências

No HemoLabSys:

* **Qualquer pessoa pode propor** um ADR-lite
* **A decisão final é da liderança técnica**
* ADRs aceitos passam a ser referência do projeto

---

## 🧩 Template Oficial de ADR-lite

Use este modelo sempre que propor uma decisão.

```md
# ADR-XXX — Título Curto e Objetivo

Status: Proposto | Aceito | Revisado | Obsoleto
Autor: Nome
Data: YYYY-MM-DD

## Contexto
Explique o problema real que motivou a decisão.
Inclua restrições, dores do time ou do projeto.

## Decisão
Descreva claramente o que foi decidido.
Evite ambiguidades.

## Alternativas Consideradas
Liste opções que foram avaliadas e por que não foram escolhidas.

## Consequências
Liste impactos positivos e negativos.

+ Benefícios
– Custos ou limitações
```

Regras importantes:

* Se levar mais de 10 minutos para escrever, está grande demais
* Se não houver contexto, não há decisão
* ADR não é imutável: pode evoluir

---

# ADR-001 — Uso de Standalone Components

Status: Aceito
Autor: Vinicius Prado

## Contexto

O Angular 17 consolida o uso de standalone components como padrão moderno.
O projeto HemoLabSys busca reduzir boilerplate, facilitar lazy loading e melhorar manutenibilidade.

## Decisão

Adotar **standalone components como padrão obrigatório** no frontend.
Não serão utilizados `NgModule` em novas features.

## Alternativas Consideradas

* Uso tradicional de NgModules

  * Rejeitado por maior complexidade e boilerplate

## Consequências

* Menos código estrutural
* Melhor tree-shaking
* Arquitetura mais simples para onboarding

– Pode exigir adaptação de devs acostumados com NgModule

---

# ADR-002 — Organização por Feature com Lazy Loading

Status: Aceito
Autor: Vinicius Prado

## Contexto

O frontend possui múltiplos domínios administrativos (insumos, fornecedores, marca, etc.).
Carregar tudo de forma eager aumenta custo inicial e complexidade.

## Decisão

Organizar o projeto **por features**, com **lazy loading obrigatório** para cada domínio administrativo.

## Alternativas Consideradas

* Estrutura por tipo (components, services, pages)

  * Rejeitada por dificultar escalabilidade e entendimento do domínio

## Consequências

* Melhor performance inicial
* Domínios isolados
* Facilita evolução independente das features

– Requer disciplina na criação de rotas

---

# ADR-003 — Services por Feature + ApiService no Core

Status: Aceito
Autor: Vinicius Prado

## Contexto

Chamadas HTTP diretas em componentes dificultam testes, manutenção e evolução.
Também existe a necessidade de padronizar comunicação com o backend.

## Decisão

* Componentes **não** fazem chamadas HTTP diretas
* Cada feature pode ter um **service dedicado**
* Toda comunicação HTTP passa pelo **ApiService no core**

## Alternativas Consideradas

* HTTP direto no componente

  * Rejeitado por acoplamento excessivo

## Consequências

* Código mais testável
* Regras de negócio centralizadas
* Facilita mudanças futuras na API

– Criação de mais arquivos por feature

---

# ADR-004 — Estratégia Atual de Autenticação

Status: Aceito
Autor: Vinicius Prado

## Contexto

O sistema necessita proteger rotas administrativas e garantir acesso autenticado.
A solução atual usa JWT com interceptor e guards.

## Decisão

Utilizar:

* JWT
* AuthService centralizado
* AuthGuard / NoAuthGuard
* HttpInterceptor para anexar token

A estratégia atual é considerada **funcional**, porém **passível de evolução**.

## Alternativas Consideradas

* Cookies HttpOnly + refresh token

  * Postergado para fase posterior do projeto

## Consequências

* Implementação simples
* Fluxo de autenticação claro

– Token em localStorage
– Ausência de refresh token

Essas limitações são conhecidas e aceitas no momento atual.

---

## 🧭 Nota Final

Esses ADRs representam **o estado consciente da arquitetura neste momento do projeto**.
Eles não são verdades eternas, mas **pontos de referência**.

Quando uma decisão deixar de fazer sentido, ela deve ser **revisitada com o mesmo nível de clareza** com que foi criada.

---

# ADR-005 — Uso de Signals para Estado Local de UI

Status: Aceito
Autor: Vinicius Prado

## Contexto

As features administrativas possuem estados locais simples (listas, filtros, seleção, modo de tela).
Atualmente há mistura entre arrays locais e `BehaviorSubject`, gerando inconsistência e complexidade desnecessária.
O Angular (16+) introduz `signals` como mecanismo nativo, leve e performático para reatividade local.

## Decisão

Adotar **signals como padrão para estado local de UI** (listas, filtros, seleção, modos de tela).
RxJS permanece indicado para fluxos assíncronos complexos, streams compartilhados ou integrações externas.

## Alternativas Consideradas

* Manter RxJS (`BehaviorSubject`) para todo estado

  * Rejeitado por excesso de complexidade para casos simples

## Consequências

* Código mais simples e legível
* Menor sobrecarga cognitiva
* Melhor alinhamento com boas práticas modernas do Angular

– Necessita adaptação do time ao novo modelo mental

---

# ADR-006 — Adoção de Reactive Forms para Domínios Regulatórios

Status: Aceito
Autor: Vinicius Prado

## Contexto

O domínio do HemoLabSys envolve validações críticas (lotes, datas, códigos regulatórios, obrigatoriedade de campos).
O uso predominante de template-driven forms (`ngModel`) limita validações robustas e testabilidade.

## Decisão

Adotar **ReactiveForms como padrão** para formulários que envolvam regras de negócio ou validações regulatórias.
Template-driven forms ficam restritos a cenários simples e não críticos.

## Alternativas Consideradas

* Manter template-driven forms em todas as features

  * Rejeitado por fragilidade em validações complexas

## Consequências

* Validações mais robustas e explícitas
* Melhor testabilidade
* Maior aderência a requisitos regulatórios

– Maior verbosidade inicial nos formulários

---

# ADR-007 — Componentes Shared para CRUD Administrativo

Status: Aceito
Autor: Vinicius Prado

## Contexto

As features CRUD apresentam alto grau de repetição: tabela, filtro, seleção, ações e exportação.
Essa duplicação aumenta o custo de manutenção e risco de inconsistência visual e comportamental.

## Decisão

Criar **componentes shared reutilizáveis** (ex.: tabela CRUD administrativa) em um módulo compartilhado (`core/shared`).
As features devem reutilizar esses componentes e focar apenas nas regras específicas do domínio.

## Alternativas Consideradas

* Manter implementação duplicada por feature

  * Rejeitado por violar DRY e dificultar evolução

## Consequências

* Redução significativa de código duplicado
* Evolução centralizada de UX e comportamento
* Menor custo de manutenção

– Exige cuidado para evitar componentes shared excessivamente genéricos

---

# ADR-008 — Tratamento de Erros e Feedback ao Usuário

Status: Aceito
Autor: Vinicius Prado

## Contexto

Falhas de API atualmente não oferecem feedback consistente ao usuário.
Em um sistema regulado, a ausência de tratamento explícito de erros e auditoria representa risco operacional.

## Decisão

Adotar **tratamento de erros padronizado**, com:

* Feedback visual ao usuário (ex.: SnackBar)
* Tratamento centralizado no service
* Preparação para logs e auditoria de ações críticas

## Alternativas Consideradas

* Tratamento ad-hoc por componente

  * Rejeitado por inconsistência e dificuldade de manutenção

## Consequências

* Melhor experiência do usuário
* Maior confiabilidade operacional
* Base para auditoria e rastreabilidade futura

– Introduz dependência de mecanismos globais de notificação

# ADR-009 — Aplicação do Princípio da Responsabilidade Única (SRP) em Features CRUD Complexas

Status: Aceito
Autor: Vinicius Prado
Data: 2025-12-20

## Contexto

Algumas features administrativas, em especial `insumos.component.ts`, concentram múltiplas responsabilidades: busca de dados, filtragem, gerenciamento de estado de UI, manipulação de formulários e lógica auxiliar (ex.: exportação).

Esse acúmulo cria componentes "inchados", difíceis de compreender, testar e evoluir, além de aumentar o risco de efeitos colaterais a cada mudança. O domínio de Insumos tende a crescer, tornando esse risco estruturalmente relevante.

## Decisão

Aplicar explicitamente o **Princípio da Responsabilidade Única (SRP)** na organização das features CRUD complexas, adotando as seguintes diretrizes:

* Componentes de página devem atuar como **orquestradores**, focados em fluxo e estado de UI
* Lógica de dados, estado reativo e regras de negócio devem ser extraídas para **services dedicados**
* Sempre que aplicável, separar componentes em **Contêiner (smart)** e **Apresentacionais (dumb)**

Para a feature de Insumos, a referência de divisão é:

* `InsumosComponent` → contêiner / orquestração
* `InsumosDataService` (ou Store) → dados, estado e filtragem
* `DependenciesService` → carregamento e estado de dependências (ex.: Fornecedores, Almoxarifados, Setores)
* `InsumosTableComponent` → apresentação da tabela
* `InsumosFormComponent` → apresentação e interação do formulário

## Alternativas Consideradas

* Manter toda a lógica concentrada no componente de página

  * Rejeitado por comprometer legibilidade, testabilidade e evolução do domínio

* Introduzir biblioteca completa de state management (ex.: NgRx) imediatamente

  * Postergado por ser desnecessário para o estágio atual e aumentar complexidade inicial

## Consequências

* Componentes menores, com propósito claro
* Melhoria significativa de legibilidade e onboarding
* Maior facilidade para testes unitários
* Redução de conflitos em trabalho colaborativo

– Aumento inicial no número de arquivos
– Exige disciplina na separação de responsabilidades

------

## 🧭 Nota Final

Esses ADRs representam **o estado consciente da arquitetura neste momento do projeto**.
Eles não são verdades eternas, mas **pontos de referência**.

Quando uma decisão deixar de fazer sentido, ela deve ser **revisitada com o mesmo nível de clareza** com que foi criada.
