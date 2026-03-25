# Engineering Guideline do Projeto

Bem-vindo(a) ao guia de engenharia do nosso projeto! Este documento serve como a fonte central de verdade para os nossos padrões de desenvolvimento, garantindo consistência, qualidade e uma colaboração mais eficiente.

O objetivo é que este seja um documento vivo, atualizado conforme as necessidades do projeto evoluem.

## Tabela de Conteúdos

- [Engineering Guideline do Projeto](#engineering-guideline-do-projeto)
  - [Tabela de Conteúdos](#tabela-de-conteúdos)
  - [1. Princípios Gerais](#1-princípios-gerais)
  - [2. Ambiente de Desenvolvimento](#2-ambiente-de-desenvolvimento)
  - [3. Diretrizes de Backend (Java + Spring Boot)](#3-diretrizes-de-backend-java--spring-boot)
    - [3.1. Estrutura de Pacotes](#31-estrutura-de-pacotes)
    - [3.2. Nomenclatura](#32-nomenclatura)
    - [3.3. Padrões e Boas Práticas](#33-padrões-e-boas-práticas)
  - [4. Diretrizes de Frontend (Angular + TypeScript)](#4-diretrizes-de-frontend-angular--typescript)
    - [4.1. Estrutura de Pastas](#41-estrutura-de-pastas)
    - [4.3. Padrões e Boas Práticas](#43-padrões-e-boas-práticas)
  - [5. Diretrizes de Banco de Dados (H2 + PostgreSQL)](#5-diretrizes-de-banco-de-dados-h2--postgresql)
  - [6. Diretrizes de Testes (JUnit 5 + Mockito)](#6-diretrizes-de-testes-junit-5--mockito)
  - [7. Diretrizes de Controle de Versão (Git)](#7-diretrizes-de-controle-de-versão-git)

---

## 1. Princípios Gerais

-   **KISS (Keep It Simple, Stupid):** Prefira soluções simples e diretas. Evite complexidade desnecessária.
-   **DRY (Don't Repeat Yourself):** Evite duplicação de código. Crie funções, componentes ou serviços reutilizáveis.
-   **SOLID:** Siga os princípios SOLID para criar um código robusto e flexível no backend.

---

## 2. Ambiente de Desenvolvimento

-   **Java:** OpenJDK 17
-   **Build Tool (Backend):** Maven (ou Gradle, a ser definido)
-   **Node.js:** Versão LTS
-   **Angular CLI:** Versão 17
-   **IDE:** IntelliJ IDEA (Backend) e Visual Studio Code (Frontend)
-   **Banco de Dados Local:** Docker com imagem `postgres:latest`
-   **Plugins Recomendados:**
    -   **VS Code:** Angular Language Service, ESLint, Prettier.
    -   **IntelliJ:** Lombok.

---

## 3. Diretrizes de Backend (Java + Spring Boot)

### 3.1. Estrutura de Pacotes

Adotamos a estrutura por camadas:

    src/main/java/br/com/hemolabsys/backend/
    ├── config/           # Configurações do Spring (Security, Swagger, etc)
    ├── controller/       # Controllers REST
    ├── domain/          # Entidades JPA
    ├── dto/             # Objetos de Transferência de Dados
    ├── exception/       # Exceções personalizadas e handler
    ├── mapper/          # Mapeadores entre entidades e DTOs
    ├── repository/      # Repositórios JPA
    ├── security/        # Configurações de segurança
    └── service/         # Camada de serviço

    src/main/resources/
    ├── application.properties  # Configurações da aplicação
    └── db/
        └── migration/         # Scripts Flyway (se necessário)

    src/test/java/br/com/hemolabsys/backend/
    ├── controller/           # Testes dos controllers
    ├── repository/          # Testes dos repositórios
    └── service/             # Testes dos serviços

### 3.2. Nomenclatura

-   **Classes e Interfaces:** `PascalCase` (ex: `UserService`)
-   **Métodos e Variáveis:** `camelCase` (ex: `findUserById`)
-   **Constantes:** `UPPER_SNAKE_CASE` (ex: `MAX_RETRIES`)
-   **DTOs:** Sufixo `DTO` (ex: `UserRequestDTO`)

### 3.3. Padrões e Boas Práticas

-   **Arquitetura:** A comunicação deve seguir o fluxo: `Controller` -> `Service` -> `Repository`.
-   **DTOs:** **Nunca** exponha entidades JPA (`@Entity`) diretamente na API. Use DTOs para desacoplar a API do modelo de dados.
-   **Injeção de Dependência:** Use injeção por construtor.

    ```java
    @Service
    public class ProductService {
        private final ProductRepository productRepository;

        // Injeção via construtor
        public ProductService(ProductRepository productRepository) {
            this.productRepository = productRepository;
        }
    }
    ```
-   **Configuração:** Utilize `application.yml` com perfis do Spring (`dev`, `prod`).
-   **Exceções:** Use `@ControllerAdvice` para um tratamento de exceções global e padronizado.
-   **Lombok:** Use o Lombok para reduzir código boilerplate (`@Data`, `@Getter`, `@Builder`, etc.).

---

## 4. Diretrizes de Frontend (Angular + TypeScript)

### 4.1. Estrutura de Pastas

Organize o código por funcionalidades (features):

    ```
    // Directory tree (3 levels, limited to 200 entries)
    ├── .angular\
    ├── .angulardoc.json
    ├── .editorconfig
    ├── .eslintrc.json
    ├── .gitignore
    ├── .npmrc
    ├── .nvmrc
    ├── .vscode\
    ├── CREDITS
    ├── LICENSE.md
    ├── README.md
    ├── angular.json
    ├── package-lock.json
    ├── package.json
    ├── src\
    │   ├── @fuse\
    │   │   ├── animations\
    │   │   │   ├── defaults.ts
    │   │   │   ├── expand-collapse.ts
    │   │   │   ├── fade.ts
    │   │   │   ├── index.ts
    │   │   │   ├── public-api.ts
    │   │   │   ├── shake.ts
    │   │   │   ├── slide.ts
    │   │   │   └── zoom.ts
    │   │   ├── components\
    │   │   │   ├── alert\
    │   │   │   ├── card\
    │   │   │   ├── drawer\
    │   │   │   ├── fullscreen\
    │   │   │   ├── highlight\
    │   │   │   ├── loading-bar\
    │   │   │   ├── masonry\
    │   │   │   └── navigation\
    │   │   ├── directives\
    │   │   │   ├── scroll-reset\
    │   │   │   └── scrollbar\
    │   │   ├── fuse.provider.ts
    │   │   ├── index.ts
    │   │   ├── lib\
    │   │   │   └── mock-api\
    │   │   ├── pipes\
    │   │   │   └── find-by-key\
    │   │   ├── services\
    │   │   │   ├── config\
    │   │   │   ├── confirmation\
    │   │   │   ├── loading\
    │   │   │   ├── media-watcher\
    │   │   │   ├── platform\
    │   │   │   ├── splash-screen\
    │   │   │   └── utils\
    │   │   ├── styles\
    │   │   │   ├── components\
    │   │   │   ├── main.scss
    │   │   │   ├── overrides\
    │   │   │   ├── tailwind.scss
    │   │   │   ├── themes.scss
    │   │   │   └── user-themes.scss
    │   │   ├── tailwind\
    │   │   │   ├── plugins\
    │   │   │   └── utils\
    │   │   ├── validators\
    │   │   │   ├── index.ts
    │   │   │   ├── public-api.ts
    │   │   │   └── validators.ts
    │   │   └── version\
    │   │       ├── fuse-version.ts
    │   │       ├── index.ts
    │   │       ├── public-api.ts
    │   │       └── version.ts
    │   ├── _redirects
    │   ├── app\
    │   │   ├── app.component.html
    │   │   ├── app.component.scss
    │   │   ├── app.component.ts
    │   │   ├── app.config.ts
    │   │   ├── app.resolvers.ts
    │   │   ├── app.routes.ts
    │   │   ├── core\
    │   │   │   ├── auth\
    │   │   │   ├── icons\
    │   │   │   ├── navigation\
    │   │   │   ├── transloco\
    │   │   │   ├── user\
    │   │   │   └── utils\
    │   │   ├── layout\
    │   │   │   ├── common\
    │   │   │   ├── layout.component.html
    │   │   │   ├── layout.component.scss
    │   │   │   ├── layout.component.ts
    │   │   │   └── layouts\
    │   │   ├── mock-api\
    │   │   │   ├── apps\
    │   │   │   ├── common\
    │   │   │   ├── dashboards\
    │   │   │   ├── index.ts
    │   │   │   ├── pages\
    │   │   │   └── ui\
    │   │   └── modules\
    │   │       ├── admin\
    │   │       ├── auth\
    │   │       ├── landing\
    │   │       ├── mobilization\
    │   │       └── registrations\
    │   ├── assets\
    │   │   ├── .gitkeep
    │   │   ├── fonts\
    │   │   │   └── inter\
    │   │   ├── i18n\
    │   │   │   ├── en.json
    │   │   │   └── pt-br.json
    │   │   ├── icons\
    │   │   │   ├── feather.svg
    │   │   │   ├── heroicons-mini.svg
    │   │   │   ├── heroicons-outline.svg
    │   │   │   ├── heroicons-solid.svg
    │   │   │   ├── material-outline.svg
    │   │   │   ├── material-solid.svg
    │   │   │   └── material-twotone.svg
    │   │   ├── images\
    │   │   │   ├── avatars\
    │   │   │   ├── flags\
    │   │   │   ├── logo\
    │   │   │   └── ui\
    │   │   └── styles\
    │   │       └── splash-screen.css
    │   ├── favicon-16x16.png
    │   ├── favicon-32x32.png
    │   ├── index.html
    │   ├── main.ts
    │   └── styles\
    │       ├── styles.scss
    │   │   ├── tailwind.scss
    │   │   └── vendors.scss
    ├── tailwind.config.js
    ├── transloco.config.js
    ├── tsconfig.app.json
    ├── tsconfig.json
    └── tsconfig.spec.json
    ```

    ### 4.2. Nomenclatura

Siga o Guia de Estilo oficial do Angular:
-   **Arquivos:** `feature.type.ts` (ex: `user-list.component.ts`)
-   **Classes:** Sufixo correspondente ao tipo (ex: `UserListComponent`, `AuthService`)

### 4.3. Padrões e Boas Práticas

-   **Componentes "Smart" vs "Dumb":** Separe componentes que buscam dados (Smart) de componentes que apenas exibem dados (Dumb).
-   **Serviços:** Centralize a lógica de negócio e as chamadas `HttpClient` nos serviços.
-   **TypeScript:** Ative o modo `strict` no `tsconfig.json` e utilize interfaces para tipar os dados.
-   **Angular Fuse Template:** Reutilize ao máximo os componentes, layouts e temas do template para manter a consistência visual.

---

## 5. Diretrizes de Banco de Dados (H2 + PostgreSQL)

-   **Migrations:** Use **Flyway** ou **Liquibase** para versionar as alterações do schema do banco de dados. Os scripts de migração devem ficar no repositório.
-   **H2 vs PostgreSQL:** O H2 deve ser usado **apenas para testes automatizados**. O desenvolvimento local deve ser feito contra uma instância PostgreSQL (via Docker) para evitar surpresas em produção.
-   **Queries:** Prefira JPQL ou Criteria API em vez de queries SQL nativas.

---

## 6. Diretrizes de Testes (JUnit 5 + Mockito)

-   **Foco:** A maior parte dos testes deve ser de **testes unitários** na camada de `Service`.
-   **Testes Unitários:** Use Mockito para simular as dependências (ex: `Repository`).
-   **Testes de Integração:** Use `@SpringBootTest` e o banco de dados H2 em memória para testar a integração entre as camadas (`Controller`, `Service`, `Repository`).
-   **Cobertura:** A meta de cobertura de código é de **80%**.

---

## 7. Diretrizes de Controle de Versão (Git)

-   **Branches:**
    -   `main`: Código de produção. Protegida.
    -   `develop`: Branch de integração.
    -   `feature/TICKET-123-descricao-curta`: Branch para novas funcionalidades.
    -   `fix/TICKET-456-corrige-bug`: Branch para correções de bugs.
-   **Commits:** Use o padrão [Conventional Commits](https://www.conventionalcommits.org/).
    -   `feat:` para novas funcionalidades.
    -   `fix:` para correções de bugs.
    -   `docs:` para alterações na documentação.
    -   `style:`, `refactor:`, `test:`, `chore:`.
-   **Pull Requests (PRs):**
    -   Todo código deve ser mergeado em `develop` através de um PR.
    -   O PR deve ser revisado e aprovado por pelo menos um outro membro da equipe.
    -   Os testes automatizados (CI) devem passar com sucesso.