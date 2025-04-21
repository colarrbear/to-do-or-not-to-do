import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";
import Head from "next/head";
import Link from "next/link";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = "Todo App" }: LayoutProps) {
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>{title} | To-do-or-not-to-do</title>
        <meta name="description" content="A full-stack todo application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Link href="/" passHref legacyBehavior>
            <Navbar.Brand>To-do-or-not-to-do</Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              {session && (
                <Link href="/todos" passHref legacyBehavior>
                  <Nav.Link>My Todos</Nav.Link>
                </Link>
              )}
            </Nav>
            <Nav>
              {session ? (
                <Button
                  variant="outline-light"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                >
                  Sign Out
                </Button>
              ) : (
                <>
                  <Link href="/login" passHref legacyBehavior>
                    <Nav.Link>Login</Nav.Link>
                  </Link>
                  <Link href="/signup" passHref legacyBehavior>
                    <Nav.Link>Sign Up</Nav.Link>
                  </Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-3">{children}</Container>
    </>
  );
} 