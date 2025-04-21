# To‑Do Or Not‑To‑Do

A full‑stack, per‑user Todo application with optional photo 
attachments, tagging, and user authentication built with Next.js, React, NextAuth, and Prisma. Includes tagging, optional photo attachments, and robust CRUD operations.

Live demo: https://to‑do‑or‑not‑to‑do‑one.vercel.app/

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Demo](#demo)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [License](#license)

---

## Features

1. **User Authentication**  
   - Sign‑Up & Login pages with email/password (NextAuth.js + CredentialsProvider + bcrypt).  
   - JWT sessions protect both pages and API routes.
2. **Todo CRUD**  
   - **Create**: Title, description, status (`PENDING`│`IN_PROGRESS`│`DONE`), priority (1–3), due date, tags, optional photo upload.  
   - **Read**: List, filter, sort, and search todos; SSR on initial load & client‑side refresh.  
   - **Update**: Inline editing of any field; atomic tag updates and photo changes.  
   - **Delete**: Remove todos and clean up tag relations.  
   - Enforced maximum of **50 todos** per user.
3. **Tagging**  
   - Create and reuse free‑form tags per user with composite unique key (`name + userId`).  
   - Filter todos by a single tag.
4. **Photo Attachments (Optional)**  
   - Base64‑encode images in the browser and store in `photoUrl`.  
   - Render thumbnail previews (max width: 100px).

---

## Tech Stack

- **Framework**: Next.js (Pages Router & TypeScript)  
- **UI Library**: React 18 + React‑Bootstrap  
- **Authentication**: NextAuth.js (JWT strategy)  
- **ORM & Database**: Prisma v5 + PostgreSQL

---

## Demo

Live application: https://to‑do‑or‑not‑to‑do‑one.vercel.app/

---

## Getting Started

### Prerequisites

- Node.js v16 or higher  
- PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/colarrbear/to-do-or-not-to-do.git
   cd to-do-or-not-to-do
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Set environment variables**
   Copy `.env.example` to `.env` and fill in values:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
   NEXTAUTH_SECRET="your-very-secure-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4. **Database setup**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser.

---

## Database Schema

See `prisma/schema.prisma` for full details. Key models:

```prisma
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

enum Status { PENDING IN_PROGRESS DONE }
```

---

## Project Structure

```
.
├─ pages/
│  ├─ index.tsx
│  ├─ login.tsx
│  ├─ signup.tsx
│  ├─ todos.tsx
│  └─ api/
│     ├─ auth/[...nextauth].ts
│     ├─ todos/index.ts
│     ├─ todos/[id].ts
│     ├─ tags/index.ts
│     └─ tags/[id].ts
├─ prisma/
│  └─ schema.prisma
├─ src/
│  ├─ components/
│  │  ├─ TodoForm.tsx
│  │  ├─ TodoList.tsx
│  │  └─ TodoItem.tsx
│  └─ lib/
│     ├─ authOptions.ts
│     └─ prisma.ts
├─ .env.example
├─ README.md
└─ package.json
```

---

## Deployment

The app is deployed on Vercel. It automatically runs with environment variables set in the Vercel dashboard.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.