# Project Setup & Architecture Plan: Screener-Trade

## Goal Description

Membangun aplikasi fullstack `screener-trade` dengan menggunakan arsitektur pemisahan antara Frontend dan Backend. Aplikasi ini menggunakan ekosistem TypeScript dari ujung ke ujung (end-to-end type safety) untuk memastikan performa tinggi, keamanan data yang baik, dan kemudahan skalabilitas dengan praktik _Advanced Software Engineering_.

### Core Tech Stack:

**Frontend:** React + TypeScript (Vite), Tailwind CSS & Shadcn UI, React Router, React Hook Form + Zod, Zustand, TanStack Query.
**Backend:** Express + Bun, Drizzle ORM, Zod, Jose, Pino, Dotenv.
**Database:** PostgreSQL (with Enterprise Connection Pooling).
**Documentation:** Docusaurus (Architecture & SOP), Scalar (Interactive API Reference via `@scalar/express-api-reference`).

---

## Advanced Software Engineering Guidelines

Kami menerapkan standar industri tinggi untuk memastikan _maintainability_ dan _scalability_ dengan guidelines khusus untuk Frontend dan Backend:

### General Guidelines

- **Environment Configuration:** Menggunakan 1 file `.env` terpusat di root monorepo untuk seluruh aplikasi. Variabel environment wajib dikelompokkan dengan prefix spesifik: `BE_` untuk Backend, `FE_` untuk Frontend, dan `DOCS_` untuk Dokumentasi (contoh: `BE_PORT=3000`, `FE_API_URL=http://localhost:3000`).
- **Git Workflow & Branching Strategy:** Scaled Trunk-Based (2-Branch System):
  - **development Branch:** Bertindak sebagai trunk aktif. Developer membuat Short-Lived Feature Branches dari cabang ini dan wajib melakukan merge kembali maksimal dalam 1-2 hari via Pull Request setelah lolos uji lokal.
  - **main Branch:** Cabang khusus production. Kode dari development didorong ke main melalui rilis berkala yang terjadwal setelah dinyatakan lolos uji di lingkungan Staging/UAT.
- **CI/CD & Automated Deployment:**
  - **GitHub Actions Pipeline:** Mengotomatiskan proses pengujian kode (bun test) dan validasi formatting (Biome/ESLint) setiap kali ada aktivitas Pull Request ke cabang development atau main.
  - **Docker & GHCR (GitHub Packages):** Hasil build aplikasi yang sukses akan dibungkus menjadi production-ready Docker image (berbasis oven/bun:alpine) dan didorong langsung ke GitHub Container Registry (GHCR) sebagai repositori image privat perusahaan. Server target tinggal menarik image terverifikasi tersebut untuk proses pembaruan instan.

### Frontend Guidelines

**Architecture**

- **Pendekatan:** Feature-Driven / Co-Located Architecture. Semua kode yang terikat pada satu domain bisnis dikelompokkan dalam satu folder fitur. Jika fitur memiliki lebih dari satu halaman (misal: halaman daftar dan halaman rincian), file-file halaman tersebut diisolasi ke dalam sub-folder `pages/` di dalam folder fitur tersebut.
- **Struktur Folder:** Folder `shared/` hanya menyimpan infrastruktur global/primitif (seperti Shadcn UI). Sisa kode dibungkus per fitur dengan format penamaan file kebab-case + suffix layer:
  ```text
  src/features/order-management/
  ├── pages/                      # Wajib dibuat jika fitur memiliki > 1 halaman
  │   ├── order-management-list.page.tsx    # Halaman Utama (Index/Table)
  │   └── order-management-detail.page.tsx  # Halaman Rincian tunggal (Gunakan kata benda tunggal 'detail')
  ├── components/                 # Komponen UI (Presenter) yang dipakai oleh halaman-halaman di atas
  │   ├── order-table.tsx
  │   └── order-invoice-card.tsx
  ├── hooks/                      # Custom hooks TanStack Query
  │   ├── use-create-order.ts
  │   └── use-get-orders.ts
  ├── services/                   # Fungsi komunikasi API / Axios client
  │   └── order-management.api.ts
  ├── types/                      # Type & Interface TypeScript spesifik domain
  │   └── order-management.types.ts
  └── order-management.schema.ts  # Skema validasi formulir (Zod)
  ```

**Code Style & Casing Rules**

- **Aturan Suffix & Ekstensi:** Wajib memisahkan komponen visual dengan logika. Komponen UI menggunakan `.tsx` dengan PascalCase (`OrderTable.tsx`), sedangkan logika/hooks menggunakan `.ts` dengan camelCase dan awalan `use` (`useGetOrders.ts`). Semua file halaman wajib menggunakan suffix `-[konteks].page.tsx`.
- **camelCase:** Digunakan untuk penamaan fungsi API, custom hooks, properti objek, variabel lokal, dan deklarasi state di dalam Zustand store. Contoh: `const { data: orderList } = useGetOrders();`.
- **snake_case:** Hanya digunakan jika payload JSON dari API backend menggunakan format `snake_case`. Data ini langsung ditransformasikan atau divalidasi menggunakan Zod `.camelCase()` sebelum dikonsumsi oleh komponen React.
- **PascalCase:** Wajib untuk komponen React, Tipe/Interface TypeScript, dan instansiasi skema validasi Zod. Contoh: `export function OrderForm() {}`, `interface OrderPayload`, `const CreateOrderSchema`.
- **kebab-case:** Wajib untuk seluruh nama folder, nama file fisik sistem, dan segmen rute URL pada React Router untuk menghindari isu case-sensitivity di lingkungan server produksi (Linux/Docker). Contoh: `/order-management` atau `/order-management/:id`.

**Design Pattern**

- **Container-Presenter Pattern (Penempatan Response & Logika):** File di dalam folder `pages/` (`.page.tsx`) bertindak sebagai Container tunggal yang mengelola side-effects, membaca Zustand store, menangani parameter URL (seperti ID detail), dan memanggil TanStack Query. Komponen di dalam folder `components/` harus berupa Presenter (dumb components) murni yang hanya menerima data dan event handler melalui props.
- **Custom Hooks Facade Pattern (Penempatan Query):** Komponen UI dilarang keras memanggil `useQuery` atau `useMutation` secara langsung dari TanStack Query. Semua pemanggilan API wajib dibungkus ke dalam custom hooks lokal fitur (`hooks/`) sebagai fasad untuk menyembunyikan detail konfigurasi query key dan fetcher.
- **Schema-Driven Forms:** Proses pembuatan formulir wajib mengintegrasikan React Hook Form dengan skema Zod melalui `@hookform/resolvers/zod`. Aturan validasi dipusatkan di file `.schema.ts` dan dieksekusi di sisi klien sebelum mutasi TanStack Query dijalankan.
- **Alur Eksekusi Data:** Alur data selalu mengikuti jalur satu arah: User Action -> Form Validation (Zod) -> Page Container -> Custom Hook Facade (TanStack Query) -> Service API -> Server -> Update Cache/Zustand Store -> Re-render Presenter via Props.

**Testing Strategy & Quality Assurance**

- **Fokus Pengujian:** Menitikberatkan pada Component & Integration Testing menggunakan gabungan Vitest (sebagai test runner bawaan Vite) dan React Testing Library (RTL) untuk menguji perilaku interaksi pengguna pada level fitur.
- **Network Mocking (MSW):** Wajib menggunakan Mock Service Worker (MSW) untuk melakukan mocking pada level jaringan (network layer). Ini memastikan TanStack Query dan alur data komponen dapat diuji secara utuh dalam kondisi mirip nyata tanpa perlu melakukan hit shortcut ke server API backend asli.
- **Linting & Disiplin QA:** Menerapkan aturan ESLint TypeScript strict mode, penataan kode otomatis via Prettier, serta pemeriksaan otomatis menggunakan lint-staged dan Husky sebelum kode diizinkan masuk ke proses commit Git.

### Backend Guidelines

**Architecture**

- **Pendekatan:** Modular/Feature-Driven Architecture dengan isolasi domain yang ketat. Kode dikelompokkan berdasarkan fitur bisnis (misal: auth, user, order-management), bukan berdasarkan jenis file teknis.
- **Struktur Folder:** Setiap modul bersifat mandiri dan memiliki ekosistem layernya sendiri dengan format penamaan file kebab-case + suffix layer:
  ```text
  src/modules/order-management/
  ├── order-management.controller.ts  # Layer HTTP (Express Router & Handler)
  ├── order-management.service.ts     # Layer Bisnis & Aturan Validasi
  ├── order-management.repository.ts  # Layer Data Access (Drizzle)
  └── order-management.schema.ts      # Layer Validasi Input (Zod)
  ```

**Code Style & Casing Rules**

- **Aturan Suffix (Akhiran):** Wajib menggunakan suffix lowercase pada nama file, dan PascalCase pada nama Class/Fungsi untuk menjaga context awareness saat pencarian file atau pembacaan log (`OrderService`, `OrderRepository`).
- **camelCase:** Digunakan untuk entitas internal kode (nama variabel, properti objek, fungsi/metode, dan instance kelas). Contoh: `const currentOrder = await orderRepository.getById(orderId);`.
- **snake_case:** Digunakan khusus untuk skema kolom database pada Drizzle ORM agar sesuai dengan standar SQL, serta untuk format I/O payload API jika perusahaan mengadopsi standar JSON snake_case. Contoh: `created_at: timestamp('created_at')`.
- **PascalCase:** Wajib untuk komponen dengan struktur tinggi: Nama Kelas, Interface, Tipe TypeScript, dan Skema Zod. Contoh: `class OrderController`, `type UserPayload`, `const CreateOrderSchema`.
- **kebab-case:** Wajib untuk seluruh nama file, folder sistem, dan segmen rute URL endpoint Express untuk menghindari isu case-sensitivity di lingkungan server produksi (Linux/Docker). Contoh: `/api/v1/order-management`.

**Design Pattern**

- **Repository Pattern (Penempatan Query):** Semua interaksi database dan sintaksis query dari Drizzle ORM wajib ditempatkan secara terisolasi di dalam kelas Layer Repository (`[Nama]Repository`). Layer Service tidak boleh mengetahui cara kerja internal query SQL atau detail koneksi database.
- **Middleware Chain & Schema-Driven (Penempatan Response):** Validasi input skema Zod dipasang sebagai middleware Express di layer Controller sebelum masuk ke Service. Tanggung jawab pengiriman response HTTP JSON (`res.status().json()`) sepenuhnya dipegang oleh Layer Controller.
- **Alur Eksekusi Request:** Alur data selalu mengikuti jalur satu arah: Route -> Auth Middleware (Jose) -> Validation Middleware (Zod) -> Controller (Kirim HTTP Response) -> Service (Business Logic / Transaction) -> Repository (Query Drizzle) -> Database.

**Testing Strategy & Quality Assurance**

- **Fokus Pengujian:** Menitikberatkan pada Integration Testing dan End-to-End (E2E) Testing per modul menggunakan built-in test runner dari Bun (`bun test`).
- **Implementasi QA:** Menggunakan database instan (seperti SQLite in-memory atau Docker Postgres terisolasi) untuk menguji alur lengkap dari Controller hingga Repository tanpa mocking berlebihan.
- **Logging Context:** Pino Logger dikonfigurasi secara global untuk menangkap stack trace yang otomatis mencantumkan nama layer (misal: `Error caught in OrderManagementService`) guna mempercepat proses debugging di lingkungan staging dan produksi.

---

## Proposed Project Structure (Monorepo)

### `ROOT /`

- `.github/workflows/` (CI/CD Pipelines)
- `package.json`, `bunfig.toml`, `PLAN.md`
- `docker-compose.yml` (Konfigurasi untuk menjalankan semua service via Docker)
- `docker/` (Konfigurasi Docker terpusat)
  - `backend/` (Dockerfile, entrypoint.sh untuk backend)
  - `frontend/` (Dockerfile, nginx.conf untuk frontend)
  - `docs/` (Dockerfile untuk dokumentasi Docusaurus)

### `apps/docs/`

- Dokumentasi Docusaurus untuk arsitektur dan SOP.

### `apps/backend/`

Penerapan arsitektur baru (Modular/Feature-Driven):

- `src/core/` (Logger, Error Handler, Config, Middleware Global)
- `src/db/` (Drizzle ORM Connection Setup & Migrations)
- `src/modules/`
  - `[feature-name]/` (Contoh: `auth/`, `order-management/`)
    - `[feature-name].controller.ts` # Layer HTTP (Express Router & Handler)
    - `[feature-name].service.ts` # Layer Bisnis & Aturan Validasi
    - `[feature-name].repository.ts` # Layer Data Access (Drizzle)
    - `[feature-name].schema.ts` # Layer Validasi Input (Zod)
    - `[feature-name].routes.ts` # Registrasi Rute Spesifik Modul
- `src/docs/` (Swagger/Scalar API setup via zod-openapi)
- `tests/` (Bun Test scripts)

### `apps/frontend/`

Penerapan arsitektur baru (Feature-Driven / Co-Located Architecture):

- `src/features/`
  - `[feature-name]/` (Contoh: `order-management/`)
    - `pages/` # Halaman Utama/Detail (e.g., `[feature]-list.page.tsx`)
    - `components/` # Komponen UI Presenter Spesifik Fitur
    - `hooks/` # Fasad TanStack Query (e.g., `use-get-[feature].ts`)
    - `services/` # Klien Axios/API (e.g., `[feature].api.ts`)
    - `types/` # Type & Interface Spesifik Fitur
    - `[feature-name].schema.ts` # Skema Validasi Zod
- `src/shared/` # Infrastruktur Global (Shadcn UI, Utils, Libs)
- `tests/e2e/` # Pengujian End-to-End dengan Playwright
- `tests/components/` # Pengujian Komponen dengan Vitest & RTL

---
