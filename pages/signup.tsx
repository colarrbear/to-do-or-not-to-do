import { useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { status } = useSession();

  // Redirect if already logged in
  if (status === "authenticated") {
    router.push("/todos");
    return null;
  }

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Register the user
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error creating account");
      }

      // Login automatically after successful registration
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(
          "Your account was created, but we couldn't log you in automatically. Please log in."
        );
        router.push("/login");
      } else {
        router.push("/todos");
      }
    } catch (error: any) {
      setError(error.message || "Failed to create account");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Sign Up">
      <div className="d-flex justify-content-center">
        <Card style={{ width: "400px" }}>
          <Card.Header>
            <h4 className="mb-0">Create an Account</h4>
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
                <Form.Text className="text-muted">
                  Password must be at least 8 characters long.
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your password"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </Form>
          </Card.Body>
          <Card.Footer className="text-center">
            Already have an account?{" "}
            <Link href="/login" passHref legacyBehavior>
              <a>Login</a>
            </Link>
          </Card.Footer>
        </Card>
      </div>
    </Layout>
  );
} 