# Guia do Desenvolvedor: HemoLabSys — Frontend

## 📋 Visão Geral do Projeto

**HemoLabSys** é uma aplicação frontend desenvolvida em **Angular 17+**, baseada no **template Fuse**, voltada ao gerenciamento de estoque para laboratórios de coleta. O sistema prioriza escalabilidade, modularidade, experiência de usuário administrativa e conformidade com contextos regulatórios (ex.: rastreabilidade, controle e auditoria).

O projeto adota **standalone components**, **lazy loading por feature** e uma separação clara entre UI, regras de negócio e integração com APIs.

------

## 🚀 Tecnologias Principais

- **Angular 17+** (standalone components)
- **Fuse Template** (layouts, navegação, temas)
- **Angular Material** (UI components)
- **RxJS** (programação reativa)
- **TypeScript** (tipagem forte)
- **Tailwind CSS** (estilização utilitária)
- **Luxon** (datas e horários)
- **Transloco** (i18n)
- **ApexCharts** (dashboards e gráficos)

------

## 🏗️ Estrutura de Pastas

```
src/app/
├── core/                    # Infraestrutura e serviços globais
│   ├── auth/                # Autenticação (service, guards, interceptor)
│   ├── api/                 # ApiService e abstrações HTTP
│   ├── navigation/          # Navegação dinâmica (sidebar/menu)
│   └── user/                # Contexto do usuário logado
│
├── layout/                  # Layouts Fuse (vertical, empty, etc.)
│
├── modules/
│   └── admin/               # Features administrativas
│       ├── dashboard/       # Visão geral e indicadores
│       ├── insumos/         # Gestão de insumos
│       ├── fornecedores/    # Gestão de fornecedores
│       ├── marca/           # Marcas
│       ├── setor/           # Setores
│       └── ...
│
├── mock-api/                # APIs mock para desenvolvimento
├── app.routes.ts            # Roteamento principal (lazy-loaded)
├── app.config.ts            # Providers globais
└── styles/                  # Estilos globais
```

------

## 🧩 Arquitetura e Padrões

### Standalone Components

- Não utiliza `NgModule`
- Cada feature declara seus próprios imports
- Melhor tree-shaking e redução de boilerplate

### Modularidade por Feature

Cada domínio (ex.: insumos, fornecedores) é isolado em sua pasta, contendo:

- Componente principal
- Rotas lazy-loaded
- Service dedicado (quando aplicável)

### Fluxo de Dados

```
Component (UI)
   ↓
Service de Feature (ex: FornecedoresService)
   ↓
ApiService (core/api)
   ↓
Interceptor (Auth, Errors)
   ↓
Backend API
```

### Autenticação e Segurança

- JWT
- AuthService centralizado
- AuthGuard / NoAuthGuard
- HttpInterceptor para Bearer Token

------

## ⚙️ Configurações e Dependências

### Dependências Relevantes

- @angular/core, router, material
- rxjs
- @ngneat/transloco
- tailwindcss
- luxon

### Arquivos-Chave

- `app.config.ts` → Providers globais
- `angular.json` → Build, styles e assets
- `app.routes.ts` → Lazy loading e guards

------

## 🛠️ Padrão para Novas Funcionalidades

### Estrutura Recomendada

```
modules/admin/nova-feature/
├── nova-feature.component.ts
├── nova-feature.component.html
├── nova-feature.component.scss
├── nova-feature.routes.ts
└── nova-feature.service.ts
```

### Passos

1. Criar rota lazy-loaded
2. Criar componente standalone
3. Criar service encapsulando regras e chamadas HTTP
4. Integrar navegação (navigation API)
5. Proteger com AuthGuard

------

## 📚 Exemplos de Implementação

### Autenticação

- Login via AuthService
- Token anexado automaticamente pelo interceptor
- Redirecionamento por guards

### CRUD Administrativo

- Listagem com filtros
- Formulários reativos
- Validação de domínio (ex.: CNPJ)
- Exportação (CSV)

------

## ⚠️ Pontos de Atenção

### Segurança

- Token em localStorage (avaliar migração para HttpOnly cookies)
- Ausência de refresh token

### Manutenção

- Alguns responses ainda tipados como `any`
- Reload forçado em 401 pode afetar UX

------

## 🔄 Fluxo de Desenvolvimento

1. Analisar feature similar existente
2. Definir interface e regras de negócio
3. Criar service dedicado
4. Implementar UI
5. Validar integração com API
6. Testar fluxos principais

------

## 📞 Referências Internas

- `core/auth` → Autenticação
- `core/api` → Comunicação HTTP
- `modules/admin/insumos` → Feature de referência
- `navigation.service.ts` → Sidebar dinâmica

Este guia serve como **documento base para onboarding, padronização e evolução do frontend do HemoLabSys**, seguindo o mesmo nível de clareza e consistência do Guia do Projeto Konekt.