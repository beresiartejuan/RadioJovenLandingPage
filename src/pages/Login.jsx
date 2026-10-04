import Navbar from "../components/Navbar";
import styled from "styled-components";
import { useLogin } from "../auth/Auth";
import Unauthenticate from "../auth/Unauthenticate";
import { ErrorMessage, LoadingMessage } from "../styled";

const Page = styled.main`
  min-height: calc(100vh - var(--navbar-height));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl) var(--space-lg);
  background: linear-gradient(135deg, var(--color-bg) 0%, #fff 100%);
`;

const Card = styled.div`
  width: 100%;
  max-width: 420px;
  padding: var(--space-2xl);
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  border: 1px solid var(--color-border);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: var(--space-xl);

  img {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--color-accent);
    margin: 0 auto var(--space-md);
  }

  h1 {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-text);
  }

  p {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

const Input = styled.input`
  padding: 0.9rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  background-color: var(--color-bg);
  color: var(--color-text);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

  &:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(255, 122, 51, 0.15);
    background-color: var(--color-surface);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

const Button = styled.button`
  padding: 0.9rem;
  background-color: var(--color-accent);
  color: white;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-accent);

  &:hover:not(:disabled) {
    background-color: var(--color-accent-dark);
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(255, 122, 51, 0.35);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function Login() {
  const { error, loading, handleLogin: login } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    login(form.get('email'), form.get('password'));
  };

  return (
    <Unauthenticate>
      <Navbar />
      <Page>
        <Card>
          <Header>
            <img src="/logo.jpeg" alt="Radio Joven Mendoza" />
            <h1>Bienvenido de vuelta</h1>
            <p>Acceso exclusivo para administradores.</p>
          </Header>
          <Form onSubmit={handleLogin}>
            <Input name="email" type="email" placeholder="Correo electrónico" required />
            <Input name="password" type="password" placeholder="Contraseña" required />
            <Button type="submit" disabled={loading}>
              {loading ? "Ingresando..." : "Ingresar al panel"}
            </Button>
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {loading && !error && <LoadingMessage>Cargando...</LoadingMessage>}
          </Form>
        </Card>
      </Page>
    </Unauthenticate>
  );
}
