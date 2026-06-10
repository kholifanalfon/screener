# Screener-Trade

Screener-Trade is a fullstack web application built with a modern TypeScript ecosystem. It uses a monorepo structure separating Frontend, Backend, and Documentation.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://www.docker.com/) & Docker Compose
- [Bun](https://bun.sh/) (JavaScript runtime & package manager)

## Project Structure

- `apps/frontend/` - React frontend powered by Vite, Tailwind CSS, and Shadcn UI.
- `apps/backend/` - Express backend with Bun, Drizzle ORM, and PostgreSQL.
- `apps/docs/` - Docusaurus documentation for architecture and SOP.

## Getting Started

### 1. Environment Setup

Copy the example environment file to `.env` and adjust the values if necessary:

```bash
cp .env.example .env
```

### 2. Running with Docker

The easiest way to run the entire stack (Database, Backend, Frontend, and Docs) is using Docker Compose. This ensures all services are running in an isolated and consistent environment.

```bash
docker-compose up -d --build
```

Once the containers are running, you can access the services at:
- **Frontend:** [http://localhost:80](http://localhost:80)
- **Backend API:** [http://localhost:3000](http://localhost:3000)
- **Documentation:** [http://localhost:8080](http://localhost:8080)
- **PostgreSQL Database:** `localhost:5432`

To stop the services:
```bash
docker-compose down
```

### 3. Running Locally for Development

If you prefer to run the applications locally without Docker (useful for development), follow these steps:

**Install dependencies:**
```bash
bun install
```

**Run local database:**
You will need a PostgreSQL instance running. You can easily start just the database using Docker:
```bash
docker-compose up -d postgres
```

**Start the development servers:**
Run both the frontend and backend concurrently:
```bash
bun run dev
```

Or run individual services:
- `bun run dev:backend` - Starts the backend server
- `bun run dev:frontend` - Starts the frontend application
- `bun run dev:docs` - Starts the Docusaurus documentation server
