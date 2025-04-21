# To‑Do Or Not‑To‑Do  

A full‑stack, per‑user Todo application with optional photo attachments, tagging, and user authentication.  
Live demo: https://to‑do‑or‑not‑to‑do‑one.vercel.app/

---

## Table of Contents

1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Getting Started](#getting-started)  
4. [Database Schema](#database-schema)  
5. [Code & Architecture](#code--architecture)  
6. [Deployment](#deployment)  
7. [Design Decisions & Trade‑Offs](#design-decisions--trade‑offs)
9. [License](#license)  

---

## Features

- **User Authentication**  
  - Sign up & log in with email/password (NextAuth.js + CredentialsProvider + bcrypt).  
  - Session stored in HTTP‑only JWT cookie, extended to include `session.user.id`.  
  - Protected `/todos` pages & all API routes.

- **Todo Management (CRUD)**  
  - **Create**: title, description, status (`PENDING`│`IN_PROGRESS`│`DONE`), priority (1–3), due date, optional photo.  
  - **Read**: list all your todos with tags & thumbnails; server‑rendered on initial load, client‑refresh via “↻ Refresh.”  
  - **Update**: inline edit any field; tags are rewritten atomically.  
  - **Delete**: removes a todo and its tag relations.  
  - Limit of **50 todos** per user.

- **Tagging**  
  - Create and reuse free‑form tags scoped per user.  
  - Attach multiple tags to each todo via a join table.

- **Photo Attachments**  
  - File input in form → Base64 string stored in `todo.photoUrl`.  
  - Thumbnail (100 px wide) shown in todo list.

---

## Tech Stack

- **Next.js** (Pages Router + TypeScript)  
- **React 18**  
- **NextAuth.js** for auth  
- **Prisma v5** ORM + PostgreSQL  
- **React‑Bootstrap** for styling & layout  

---

## Getting Started

### Prerequisites

- Node.js v16+  
- PostgreSQL instance  
- Git  

### Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your‑username/to‑do‑or‑not‑to‑do.git
   cd to‑do‑or‑not‑to‑do
   ```

2. **Install dependencies**  
   ```bash
   npm install
   ```

3. **Environment variables**  
   Copy `.env.example` → `.env.local` and set:
   ```
   DATABASE_URL="postgresql://user:password@host:port/dbname"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="a‑very‑secure‑random‑string"
   ```

4. **Migrate & generate Prisma client**  
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the app**  
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

---

## Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  email        String   @unique
  createdAt    DateTime @default(now())
  passwordHash String
  id           Int      @id @default(autoincrement())
  tags         Tag[]
  todos        Todo[]
}

model Todo {
  title       String
  description String?
  status      Status    @default(PENDING)
  priority    Int       @default(1)
  dueDate     DateTime?
  photoUrl    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  id          Int       @id @default(autoincrement())
  userId      Int
  user        User      @relation(fields: [userId], references: [id])
  tags        TodoTag[]
}

model Tag {
  name      String
  createdAt DateTime  @default(now())
  id        Int       @id @default(autoincrement())
  userId    Int
  user      User      @relation(fields: [userId], references: [id])
  todos     TodoTag[]

  @@unique([name, userId], name: "name_userId")
}

model TodoTag {
  todoId Int
  tagId  Int
  tag    Tag  @relation(fields: [tagId], references: [id])
  todo   Todo @relation(fields: [todoId], references: [id])

  @@id([todoId, tagId])
}

enum Status {
  PENDING
  IN_PROGRESS
  DONE
}

```

---

## Code & Architecture

```TO-DO-OR-NOT-TO-DO
|_ .next/
|_ node_modules/
|_ pages/
|_ prisma/
|  |_ migrations/
|  |_ schema.prisma
|_ public/
|_ src/
|  |_ app/
|  |_ components/
|  |_ lib/
|  |  |_ auth.ts
|  |  |_ authOptions.ts
|  |  |_ prisma.ts
|  |_ styles/
|  |_ types/
|  |_ middleware.ts
|_ types/
|_ .env
|_ .env.example
|_ .gitignore
|_ eslint.config.mjs
|_ LICENSE
|_ next-env.d.ts
|_ next.config.ts
|_ package-lock.json
|_ package.json
|_ postcss.config.mjs
|_ README.md
|_ tsconfig.json
```

### `src/lib/prisma.ts`  
Exports a singleton `PrismaClient` to avoid multiple instances in development.

### `src/lib/authOptions.ts`  
Central NextAuth config:
- CredentialsProvider + bcrypt authorize  
- JWT & session callbacks to store `user.id`  
- Type augmentation for `Session` & `JWT`

### API Routes (`pages/api/...`)  
- Each handler starts with:
  ```ts
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const userId = parseInt(session.user.id);
  ```
- **`/api/todos`**: GET, POST (with 50‑todo limit), PUT, DELETE  
- **`/api/tags`**: GET, POST (user‑scoped tags)

### Pages

- **`/pages/login.tsx` & `/pages/signup.tsx`**: auth forms  
- **`/pages/todos.tsx`**:  
  - `getServerSideProps` for auth guard + initial todos fetch  
  - Client uses `useState` + “Refresh” to re‑fetch  

### Components

- **`TodoForm`**: controlled inputs, tag selector, photo preview  
- **`TodoList`** & **`TodoItem`**: list UI, inline edits, badges, delete button  

---

## Deployment

This app is live on Vercel:  
https://to‑do‑or‑not‑to‑do‑one.vercel.app/

**Deploying your own copy:**

1. Push to GitHub.  
2. On Vercel, import the repo.  
3. Add the same environment variables in Vercel dashboard.  
4. Deploy.

---

## Design Decisions & Trade‑Offs

- **SSR + Client Fetch**: SSR for auth + SEO; client fetch for dynamic updates.  
- **Base64 Photo Storage**: simplifies hosting, but increases payload sizes.  
- **Composite Unique Constraint** on `(name, userId)` enforces per‑user tag isolation.  
- **React‑Bootstrap** enables rapid, responsive UI without custom CSS.

---

## License

MIT © Your Name / Organization