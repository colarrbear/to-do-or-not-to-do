import { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { status } = useSession();

  // Redirect if already logged in
  if (status === "authenticated") {
    router.push("/todos");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/todos");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login">
      <div className="d-flex justify-content-center">
        <Card style={{ width: "400px" }}>
          <Card.Header>
            <h4 className="mb-0">Login</h4>
          </Card.Header>
          <Card.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </Form>
          </Card.Body>
          <Card.Footer className="text-center">
            Don't have an account?{" "}
            <Link href="/signup" passHref legacyBehavior>
              <a>Sign up</a>
            </Link>
          </Card.Footer>
        </Card>
      </div>
    </Layout>
  );
} 