import { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col } from "react-bootstrap";
import { Status, Tag } from "@/types/schema";

interface TodoFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    status: Status;
    priority: number;
    dueDate: Date | null;
    tags: string[];
  }) => void;
}

export default function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>("PENDING");
  const [priority, setPriority] = useState(1);
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    // Fetch available tags
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        const data = await res.json();
        setAvailableTags(data);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setStatus("PENDING");
    setPriority(1);
    setDueDate("");
    setTags([]);
    setNewTag("");
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSelectTag = (tagName: string) => {
    if (!tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4>Add New Todo</h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter todo title"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description (optional)"
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

          <Form.Group className="mb-3">
            <Form.Label>Tags</Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                className="me-2"
              />
              <Button type="button" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {availableTags.length > 0 && (
              <div className="mt-2">
                <small className="text-muted">Available tags:</small>
                <div>
                  {availableTags.map((tag) => (
                    <Button
                      key={tag.id}
                      variant="outline-secondary"
                      size="sm"
                      className="me-1 mt-1"
                      onClick={() => handleSelectTag(tag.name)}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {tags.length > 0 && (
              <div className="mt-2">
                <small className="text-muted">Selected tags:</small>
                <div>
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      variant="secondary"
                      size="sm"
                      className="me-1 mt-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} &times;
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </Form.Group>

          <Button variant="primary" type="submit">
            Add Todo
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
} 