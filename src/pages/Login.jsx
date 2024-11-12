import Navbar from "../components/Navbar";
import styled from "styled-components";
import { useLogin } from "../auth/Auth";
import Unauthenticate from "../auth/Unauthenticate";
import { ErrorMessage, LoadingMessage } from "../styled";

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  font-family: sans-serif;
  margin: 10vh auto;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  padding: 2rem;
  background-color: #ffffff;
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.521);
  border-bottom: #EB7E1F solid 5px;
  width: 70%;
  max-width: 300px;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1.1rem;
  &:focus {
    outline: none;
    border-color: #888;
  }
`;

const Button = styled.button`
  padding: 0.8rem;
  background-color: #4CAF50;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #45a049;
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
      <Navbar></Navbar>
      <LoginContainer>
        <LoginForm onSubmit={handleLogin}>
          <Title>Iniciar Sesión</Title>
          <Input name="email" type="email" placeholder="Correo electrónico" required />
          <Input name="password" type="password" placeholder="Contraseña" required />
          <Button type="submit">Ingresar</Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {loading && <LoadingMessage>Cargando...</LoadingMessage>}
        </LoginForm>
      </LoginContainer>
    </Unauthenticate>
  )
}