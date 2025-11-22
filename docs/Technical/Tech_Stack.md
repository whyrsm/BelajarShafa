## 6. Technical Stack

### 6.1 Frontend
- **Framework:** React.js with Next.js 14+ (App Router)
  - SSR/SSG untuk SEO dan performance
  - React Server Components
- **Language:** TypeScript
- **Styling:**
  - TailwindCSS
  - shadcn/ui component library
- **State Management:**
  - Zustand (lightweight, simple API)
  - React Query untuk server state
- **Form Handling:** React Hook Form + Zod validation
- **Rich Text Editor:** Tiptap (extensible, headless editor)
- **Video Player:** React Player (YouTube embed)
- **Charts:** Recharts (React-native, composable)
- **Real-time:** Socket.io client (better compatibility)

### 6.2 Backend
- **Framework:** Node.js with NestJS (TypeScript)
  - Modular architecture dengan dependency injection
  - Built-in support untuk Guards, Interceptors, Pipes
  - Microservices-ready untuk future scaling
- **API Style:** RESTful API
  - Swagger/OpenAPI documentation (auto-generated)
  - Versioning support (v1, v2, etc.)
- **Authentication & Authorization:**
  - JWT (access + refresh token)
  - Passport.js strategies (local, JWT)
  - Role-based access control (RBAC) dengan Guards
  - @nestjs/passport dan @nestjs/jwt
- **Validation:**
  - class-validator untuk DTO validation
  - class-transformer untuk data transformation
  - Zod untuk runtime type checking (optional)
- **File Upload:**
  - Multer dengan stream handling
  - File type validation dan size limits
  - Direct upload ke S3 dengan presigned URLs
- **Real-time Communication:**
  - @nestjs/websockets dengan Socket.io
  - Room-based messaging untuk class isolation
  - Event-driven architecture
- **Background Jobs:**
  - pg-boss (PostgreSQL-based queue)
  - Cron jobs dengan @nestjs/schedule
  - Use cases: email sending, notifications, report generation
- **Email Service:**
  - Resend (modern email API)
  - React Email untuk templates
  - Queue-based sending dengan pg-boss
- **Logging & Monitoring:**
  - Pino (fastest JSON logger)
  - Request/response logging dengan interceptors


### 6.3 Database
- **Primary:** PostgreSQL 14+
  - Relational data
  - JSONB untuk flexible data
- **Indexes:** Foreign keys dan frequently queried fields
- **ORM:** Prisma (type-safe, modern DX)
- **Migrations:** Prisma Migrate

### 6.4 Storage
- **File Storage:** Cloudflare R2
  - S3-compatible API (easy migration)
  - Zero egress fees (unlimited downloads)
  - Buckets: profile-pictures, course-materials, attachments
  - Direct integration with Cloudflare CDN
  - Presigned URLs untuk secure uploads
- **CDN:** Cloudflare CDN
  - Automatic caching untuk R2 assets
  - Global edge network
  - Image optimization dengan Cloudflare Images (optional)
