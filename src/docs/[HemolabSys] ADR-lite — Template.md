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
