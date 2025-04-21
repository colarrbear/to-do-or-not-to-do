import { useState, useEffect } from "react";
import { Alert, Row, Col, Form } from "react-bootstrap";
import TodoItem from "./TodoItem";
import { Todo, Tag, Status, TodoWithTags } from "@/types/schema";

interface TodoListProps {
  initialTodos: TodoWithTags[];
}

export default function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<TodoWithTags[]>(initialTodos);
  const [filteredTodos, setFilteredTodos] = useState<TodoWithTags[]>(initialTodos);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("DATE");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Update todos state when initialTodos prop changes
  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = [...todos];

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((todo) => todo.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== "ALL") {
      filtered = filtered.filter(
        (todo) => todo.priority === parseInt(priorityFilter)
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          (todo.description &&
            todo.description.toLowerCase().includes(query)) ||
          todo.tags.some((t) => t.tag.name.toLowerCase().includes(query))
      );
    }

    // Sort todos
    filtered.sort((a, b) => {
      if (sortBy === "PRIORITY_HIGH") {
        // Sort by priority (high to low)
        return b.priority - a.priority;
      } else if (sortBy === "PRIORITY_LOW") {
        // Sort by priority (low to high)
        return a.priority - b.priority;
      } else if (sortBy === "DATE_OLD") {
        // Sort by creation date (oldest first)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        // Default: Sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredTodos(filtered);
  }, [todos, statusFilter, priorityFilter, searchQuery, sortBy]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete todo");
      }

      // Update local state
      setTodos(todos.filter((todo) => todo.id !== id));
      setError("");
    } catch (error) {
      setError("Error deleting todo. Please try again.");
      console.error("Error deleting todo:", error);
    }
  };

  const handleUpdate = async (id: number, data: Partial<Todo>) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update todo");
      }

      const updatedTodo = await response.json();

      // Update local state
      setTodos(
        todos.map((todo) => (todo.id === id ? updatedTodo : todo))
      );
      setError("");
    } catch (error) {
      setError("Error updating todo. Please try again.");
      console.error("Error updating todo:", error);
    }
  };

  return (
    <div>
      {error && <Alert variant="danger">{error}</Alert>}

      <div className="mb-4">
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Filter by Status</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Filter by Priority</Form.Label>
              <Form.Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Sort By</Form.Label>
              <Form.Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="DATE">Newest First</option>
                <option value="DATE_OLD">Oldest First</option>
                <option value="PRIORITY_HIGH">Priority (High to Low)</option>
                <option value="PRIORITY_LOW">Priority (Low to High)</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Search</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search todos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
      </div>

      {!isMounted ? (
        <div>Loading todos...</div>
      ) : filteredTodos.length === 0 ? (
        <Alert variant="info">No todos found.</Alert>
      ) : (
        filteredTodos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))
      )}
    </div>
  );
} 