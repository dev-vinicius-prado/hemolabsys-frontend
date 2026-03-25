# Como Contribuir — HemoLabSys (Guia Educativo)

Este documento existe para **ensinar o jeito certo de evoluir o HemoLabSys**, não para burocratizar. A ideia é ajudar qualquer pessoa do time a contribuir com segurança, consistência e entendimento do todo.

Se você leu isso até aqui: ótimo sinal 🙂

------

## 🎯 Objetivo deste Guia

- Evitar retrabalho e refactors desnecessários
- Preservar a arquitetura ao longo do tempo
- Ajudar novos devs a se orientarem rapidamente
- Criar um padrão comum de decisão técnica

Aqui não tem “polícia de código”, mas existem **boas práticas que já se provaram úteis neste projeto**.

------

## 🧭 Onde Contribuir

### Estrutura Geral

O frontend é organizado **por domínio funcional**.

```
src/app/modules/admin/
├── dashboard/
├── insumos/
├── fornecedores/
├── marca/
├── setor/
└── ...
```

➡️ **Regra geral:** novas funcionalidades devem viver dentro de `modules/admin/*`.

### Pode mexer com tranquilidade

- Componentes de uma feature específica
- Services dedicados da feature
- Templates HTML e estilos locais
- Rotas lazy-loaded da feature

### Mexa com cuidado

- `core/auth`
- `core/api`
- `navigation.service.ts`

Se precisar alterar algo no `core`, **explique o motivo no PR**.

------

## 🧱 Padrões Essenciais do Projeto

Esses padrões não são modinha — eles existem para manter o projeto saudável.

### 1️⃣ Standalone Components

- Não usamos `NgModule`
- Cada componente importa o que usa

✔️ Sim:

```
@Component({ standalone: true })
```

❌ Não:

```
@NgModule(...)
```

------

### 2️⃣ Lazy Loading por Feature

Toda feature administrativa deve ser lazy-loaded.

Motivo:

- Melhor performance
- Menor custo cognitivo
- Separação clara de responsabilidades

------

### 3️⃣ Regra de Ouro: Sem HTTP no Componente

Componentes **não** fazem chamadas HTTP diretas.

✔️ Fluxo correto:

```
Component → Service da Feature → ApiService
```

Isso facilita:

- Testes
- Reuso
- Manutenção

------

### 4️⃣ Services de Feature

Se a feature tem regra de negócio, ela merece um service.

Exemplos:

- FornecedoresService
- InsumosService

O service:

- Encapsula endpoints
- Centraliza formatações
- Pode evoluir para cache ou regras mais complexas

------

### 5️⃣ Tipagem Importa

Evite `any`.

Se não souber o tipo agora:

- Crie uma interface simples
- Evolua depois

Código tipado explica intenção.

------

## 🛠️ Como Criar uma Nova Feature (Passo a Passo)

Exemplo: criar a feature **Relatórios**

### Passo 1 — Criar a pasta

```
modules/admin/relatorios/
```

### Passo 2 — Criar as rotas

```
relatorios.routes.ts
```

### Passo 3 — Criar o componente standalone

- HTML
- SCSS
- Lógica simples

### Passo 4 — Criar o service (se necessário)

- Encapsule chamadas HTTP
- Não exponha detalhes da API no componente

### Passo 5 — Integrar navegação

- Atualize navigation API (mock ou backend)

### Passo 6 — Proteger rota

- AuthGuard já aplicado no contexto admin

------

## 🚫 Coisas que Evitamos Fazer

Não é proibição — é experiência acumulada 😅

- ❌ Duplicar lógica do ApiService
- ❌ Criar estado global fora de services
- ❌ Usar `location.reload()` fora do interceptor
- ❌ Colocar regra de negócio no template
- ❌ Criar dependências novas sem justificar

Se parecer necessário quebrar uma dessas regras, **provavelmente vale uma conversa antes**.

------

## ✅ Quando uma Feature Pode Ser Considerada Pronta

Antes de abrir PR ou pedir review, verifique:

- A feature funciona no fluxo principal?
- Está protegida por autenticação?
- Segue o padrão das outras features?
- Não quebrou navegação?
- Código está legível para outra pessoa?

Se a resposta for “sim” para tudo acima, você está no caminho certo.

------

## 🧠 Filosofia do Projeto

Este projeto não busca:

- Código perfeito
- Arquitetura acadêmica

Ele busca:

- Clareza
- Evolução contínua
- Decisões técnicas conscientes

Se você contribuiu pensando nisso, **sua contribuição foi válida**.

------

Se algo neste guia não fizer mais sentido no futuro, ele **pode e deve evoluir**.
Documentação viva também é parte do produto.