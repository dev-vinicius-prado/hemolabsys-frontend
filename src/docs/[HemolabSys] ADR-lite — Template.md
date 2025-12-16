# ADR-lite — HemoLabSys

Este documento define **o modelo oficial de ADR-lite** do HemoLabSys e registra as **decisões arquiteturais fundacionais** já tomadas.

Ele existe para dar **ordem, previsibilidade e segurança técnica** ao projeto.

------

## 📐 O que é um ADR-lite neste projeto

Um ADR-lite é um **registro curto e objetivo** de uma decisão técnica relevante.

Ele não serve para discutir indefinidamente, mas para:

- Registrar contexto
- Explicar a decisão
- Tornar explícitas as consequências

No HemoLabSys:

- **Qualquer pessoa pode propor** um ADR-lite
- **A decisão final é da liderança técnica**
- ADRs aceitos passam a ser referência do projeto

------

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

- Se levar mais de 10 minutos para escrever, está grande demais
- Se não houver contexto, não há decisão
- ADR não é imutável: pode evoluir

------

# ADR-001 — Uso de Standalone Components

Status: Aceito
Autor: Arquitetura do Projeto

## Contexto

O Angular 17 consolida o uso de standalone components como padrão moderno.
O projeto HemoLabSys busca reduzir boilerplate, facilitar lazy loading e melhorar manutenibilidade.

## Decisão

Adotar **standalone components como padrão obrigatório** no frontend.
Não serão utilizados `NgModule` em novas features.

## Alternativas Consideradas

- Uso tradicional de NgModules
  - Rejeitado por maior complexidade e boilerplate

## Consequências

- Menos código estrutural
- Melhor tree-shaking
- Arquitetura mais simples para onboarding

– Pode exigir adaptação de devs acostumados com NgModule

------

# ADR-002 — Organização por Feature com Lazy Loading

Status: Aceito
Autor: Arquitetura do Projeto

## Contexto

O frontend possui múltiplos domínios administrativos (insumos, fornecedores, marca, etc.).
Carregar tudo de forma eager aumenta custo inicial e complexidade.

## Decisão

Organizar o projeto **por features**, com **lazy loading obrigatório** para cada domínio administrativo.

## Alternativas Consideradas

- Estrutura por tipo (components, services, pages)
  - Rejeitada por dificultar escalabilidade e entendimento do domínio

## Consequências

- Melhor performance inicial
- Domínios isolados
- Facilita evolução independente das features

– Requer disciplina na criação de rotas

------

# ADR-003 — Services por Feature + ApiService no Core

Status: Aceito
Autor: Arquitetura do Projeto

## Contexto

Chamadas HTTP diretas em componentes dificultam testes, manutenção e evolução.
Também existe a necessidade de padronizar comunicação com o backend.

## Decisão

- Componentes **não** fazem chamadas HTTP diretas
- Cada feature pode ter um **service dedicado**
- Toda comunicação HTTP passa pelo **ApiService no core**

## Alternativas Consideradas

- HTTP direto no componente
  - Rejeitado por acoplamento excessivo

## Consequências

- Código mais testável
- Regras de negócio centralizadas
- Facilita mudanças futuras na API

– Criação de mais arquivos por feature

------

# ADR-004 — Estratégia Atual de Autenticação

Status: Aceito
Autor: Arquitetura do Projeto

## Contexto

O sistema necessita proteger rotas administrativas e garantir acesso autenticado.
A solução atual usa JWT com interceptor e guards.

## Decisão

Utilizar:

- JWT
- AuthService centralizado
- AuthGuard / NoAuthGuard
- HttpInterceptor para anexar token

A estratégia atual é considerada **funcional**, porém **passível de evolução**.

## Alternativas Consideradas

- Cookies HttpOnly + refresh token
  - Postergado para fase posterior do projeto

## Consequências

- Implementação simples
- Fluxo de autenticação claro

– Token em localStorage
– Ausência de refresh token

Essas limitações são conhecidas e aceitas no momento atual.

------

## 🧭 Nota Final

Esses ADRs representam **o estado consciente da arquitetura neste momento do projeto**.
Eles não são verdades eternas, mas **pontos de referência**.

Quando uma decisão deixar de fazer sentido, ela deve ser **revisitada com o mesmo nível de clareza** com que foi criada.