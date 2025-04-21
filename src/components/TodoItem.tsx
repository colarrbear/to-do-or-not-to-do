import { useState, useEffect } from "react";
import { Card, Badge, Button, Form, Row, Col } from "react-bootstrap";
import { Todo, Tag, Status } from "@/types/schema";

interface TodoItemProps {
  todo: Todo & {
    tags: {
      tag: Tag;
    }[];
  };
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<Todo>) => void;
}

export default function TodoItem({ todo, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [status, setStatus] = useState<Status>(todo.status);
  const [priority, setPriority] = useState(todo.priority);
  const [dueDate, setDueDate] = useState(
    todo.dueDate ? new Date(todo.dueDate).toISOString().split("T")[0] : ""
  );
  // State for client-side rendered content
  const [isMounted, setIsMounted] = useState(false);

  // Only render date on client side to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(todo.id, {
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    });
    setIsEditing(false);
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "PENDING":
        return <Badge bg="secondary">Pending</Badge>;
      case "IN_PROGRESS":
        return <Badge bg="primary">In Progress</Badge>;
      case "DONE":
        return <Badge bg="success">Done</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "No due date";
    // Ensure consistent date formatting on both server and client
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriorityClass = (priority: number) => {
    return `todo-priority-${priority}`;
  };

  return (
    <Card className={`todo-card ${getPriorityClass(todo.priority)}`}>
      <Card.Body>
        {!isEditing && todo.photoUrl && (
          <Card.Img
            variant="top"
            src={todo.photoUrl}
            alt="Attached photo"
            style={{ maxWidth: '100px', objectFit: 'cover' }}
            className="mb-3"
          />
        )}
        {isEditing ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Status)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                  >
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </div>
          </Form>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0">{todo.title}</h5>
              <div>
                {getStatusBadge(todo.status)}
                <Badge bg="info" className="ms-2">
                  Priority: {todo.priority}
                </Badge>
              </div>
            </div>
            <Card.Text>{todo.description}</Card.Text>
            <div className="mb-2">
              {todo.tags.map(({ tag }) => (
                <Badge key={tag.id} bg="secondary" className="tag-badge">
                  {tag.name}
                </Badge>
              ))}
            </div>
            <div className="d-flex justify-content-between align-items-center">
              {/* Only render date on client side to prevent hydration errors */}
              <div>
                {isMounted ? (
                  <small className="text-muted">
                    Due: {formatDate(todo.dueDate)}
                  </small>
                ) : (
                  <small className="text-muted">Loading date...</small>
                )}
              </div>
              <div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(todo.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
} 