# 📦 Product Stock

Sistema de controle de estoque para indústria que produz produtos diversos, permitindo gerenciar matérias-primas, produtos e visualizar a capacidade de produção baseada no estoque disponível.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)

## 🎯 Funcionalidades

### Dashboard
- Visualização de produtos com capacidade de produção
- Filtros: todos, produzíveis, não produzíveis
- Cards colapsáveis mostrando matérias-primas necessárias
- Indicadores visuais de estoque (verde/vermelho)

### Produtos
- CRUD completo de produtos
- Associação com múltiplas matérias-primas
- Controle de quantidade necessária por insumo
- Busca e paginação

### Matérias-Primas
- CRUD completo de matérias-primas
- Controle de estoque
- Busca e paginação

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Fastify
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Validation**: Zod

### Frontend
- **Framework**: React 19
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Forms**: TanStack Form
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Build Tool**: Vite

## 📁 Estrutura do Projeto

```
product-stock/
├── server/                 # Backend API
│   ├── src/
│   │   ├── api/           # Rotas e configuração do servidor
│   │   │   ├── routes/    # Definição de endpoints
│   │   │   └── server.ts  # Configuração Fastify
│   │   ├── db/            # Configuração do banco
│   │   │   ├── schema.ts  # Schema Drizzle
│   │   │   └── seed.ts    # Dados de teste
│   │   └── services/      # Lógica de negócio
│   │       ├── product/
│   │       └── raw-material/
│   └── package.json
├── web/                    # Frontend
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   └── ui/        # Componentes shadcn/ui
│   │   ├── lib/           # API clients e hooks
│   │   └── pages/         # Páginas (file-based routing)
│   │       └── _app/
│   │           ├── index.tsx      # Dashboard
│   │           ├── product/       # Página de produtos
│   │           └── raw/           # Página de matérias-primas
│   ├── cypress/           # Testes E2E
│   └── package.json
├── docker-compose.yml
└── package.json           # Workspace root
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- PostgreSQL 16+ (ou Docker)
- npm 9+

### Configuração

1. **Clone o repositório**
```bash
git clone https://github.com/abnerjs/product-stock.git
cd product-stock
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie o arquivo `.env` na raiz:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/product_stock
```

E em `server/.env`:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/product_stock
```

4. **Inicie o banco de dados** (com Docker)
```bash
docker compose up -d db
```

5. **Execute as migrations e seed**
```bash
cd server
npm run db:push
npm run db:seed
```

6. **Inicie a aplicação**

Em terminais separados:
```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:web
```

### URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3333

## 📝 Scripts Disponíveis

### Root (workspace)
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o frontend |
| `npm run dev:server` | Inicia o backend |
| `npm run dev:web` | Inicia o frontend |
| `npm run build` | Build do frontend |
| `npm run lint` | Lint em todos os workspaces |

### Server
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento |
| `npm run build` | Compila TypeScript |
| `npm run db:push` | Aplica schema no banco |
| `npm run db:seed` | Popula banco com dados de teste |
| `npm run db:studio` | Abre Drizzle Studio |

### Web
| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia Vite dev server |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |
| `npm run cypress` | Abre Cypress |
| `npm run cypress:run` | Executa testes headless |

## 🐳 Docker

### Desenvolvimento
```bash
docker compose up -d
```

Isso irá iniciar:
- PostgreSQL na porta 5433
- Backend na porta 3333
- Frontend na porta 5173

### Produção
```bash
docker compose -f docker-compose.yml up -d --build
```

## 📊 API Endpoints

### Matérias-Primas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/raw-material` | Lista com paginação |
| GET | `/raw-material/:id` | Busca por ID |
| POST | `/raw-material` | Cria nova |
| PUT | `/raw-material/:id` | Atualiza |
| DELETE | `/raw-material/:id` | Remove |

### Produtos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/product` | Lista com paginação |
| GET | `/product/summary` | Resumo de produção |
| GET | `/product/:id` | Busca por ID |
| POST | `/product` | Cria novo |
| PUT | `/product/:id` | Atualiza |
| DELETE | `/product/:id` | Remove |

### Parâmetros de Query
- `search` - Filtro por nome
- `page` - Número da página (default: 1)
- `limit` - Itens por página (default: 10)
- `filter` - Filtro de produzibilidade (summary): `all`, `producible`, `not-producible`

## 🧪 Testes

### Executar testes E2E
```bash
cd web
npm run cypress        # Modo interativo
npm run cypress:run    # Modo headless
```

## 📄 Licença

Este projeto está sob a licença ISC.

## 👤 Autor

**Abner JS**
- GitHub: [@abnerjs](https://github.com/abnerjs)
