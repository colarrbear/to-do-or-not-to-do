# To-Do-Or-Not-To-Do

A full-stack Todo application built with Next.js, Next-Auth, and PostgreSQL via Prisma.

## Features

- User authentication with email/password
- Create, read, update, and delete todos
- Filter todos by status, priority, or search term
- Tag system for organizing todos
- Responsive design using Bootstrap

## Technology Stack

- **Frontend & Backend**: Next.js (React + API routes)
- **Authentication**: next-auth with Credentials Provider
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Bootstrap via react-bootstrap

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/colarrbear/to-do-or-not-to-do.git
   cd to-do-or-not-to-do
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="your-postgresql-connection-string"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-random-secret-key"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application can be easily deployed to Vercel:

1. Create a Vercel account and connect your GitHub repository
2. Set up the same environment variables in the Vercel dashboard
3. Deploy the application

## Database Schema

```prisma
model User {
  id           Int      @id @default(autoincrement())
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  todos        Todo[]
}

model Todo {
  id          Int       @id @default(autoincrement())
  user        User      @relation(fields: [userId], references: [id])
  userId      Int
  title       String
  description String?
  status      Status    @default(PENDING)
  priority    Int       @default(1)
  dueDate     DateTime?
  photoUrl    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  tags        TodoTag[]
}

model Tag {
  id        Int       @id @default(autoincrement())
  name      String    @unique
  createdAt DateTime  @default(now())
  todos     TodoTag[]
}

model TodoTag {
  todo   Todo @relation(fields: [todoId], references: [id])
  todoId Int
  tag    Tag  @relation(fields: [tagId], references: [id])
  tagId  Int
  @@id([todoId, tagId])
}

enum Status {
  PENDING
  IN_PROGRESS
  DONE
}
```

## License

This project is licensed under the MIT License.
