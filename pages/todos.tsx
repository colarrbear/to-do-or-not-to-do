import { useState } from "react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth/next";
import { Row, Col, Alert } from "react-bootstrap";
import Layout from "@/components/Layout";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import prisma from "@/lib/prisma";
import { authOptions } from "./api/auth/[...nextauth]";
import { Status, Todo, TodoWithTags } from "@/types/schema";

interface TodosPageProps {
  initialTodos: TodoWithTags[];
}

export default function TodosPage({ initialTodos }: TodosPageProps) {
  const [todos, setTodos] = useState<TodoWithTags[]>(initialTodos);
  const [error, setError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshTodos = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const updatedTodos = await response.json();
      setTodos(updatedTodos);
    } catch (error) {
      console.error("Error refreshing todos:", error);
      setError("Failed to refresh todos. Please reload the page.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddTodo = async (data: {
    title: string;
    description: string;
    status: Status;
    priority: number;
    dueDate: Date | null;
    tags: string[];
  }) => {
    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create todo");
      }

      // Refresh todos from server
      await refreshTodos();
      setError("");
    } catch (error: any) {
      setError(error.message || "An error occurred");
      console.error("Add todo error:", error);
    }
  };

  return (
    <Layout title="My Todos">
      <h1 className="mb-4">My Todo List</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={4}>
          <TodoForm onSubmit={handleAddTodo} />
        </Col>
        <Col lg={8}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="mb-0">My Tasks</h2>
            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={refreshTodos}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>
          <TodoList initialTodos={todos} />
        </Col>
      </Row>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session || !session.user?.id) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const userId = parseInt(session.user.id);
  
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      props: {
        initialTodos: JSON.parse(JSON.stringify(todos)),
      },
    };
  } catch (error) {
    console.error("Error fetching todos:", error);
    return {
      props: {
        initialTodos: [],
      },
    };
  }
}; 