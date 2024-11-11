import createStore from 'react-auth-kit/createStore';
import useSignIn from 'react-auth-kit/hooks/useSignIn';
import { useState } from 'react';
import { useLocation } from 'wouter';

export const AuthStore = createStore({
    authName: '_auth',
    authType: 'localstorage',
    cookieDomain: window.location.hostname,
    cookieSecure: window.location.protocol === 'https:',
});

// eslint-disable-next-line react-refresh/only-export-components
export function useLogin() {
    const signIn = useSignIn();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [, navigate] = useLocation();

    const handleLogin = async (email, password) => {
        setLoading(true);
        setError(null);

        try {

            const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!loginResponse.ok) {
                throw new Error("Credenciales inválidas");
            }

            const loginData = await loginResponse.json();

            const userResponse = await fetch('http://localhost:8000/api/auth/me', {
                method: 'POST',
                headers: {
                    'Authorization': `${loginData.token_type} ${loginData.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!userResponse.ok) {
                throw new Error("Error al obtener los datos del usuario");
            }

            const userData = await userResponse.json();

            // Inicio de sesión en la aplicación
            const signedIn = signIn({
                auth: {
                    token: loginData.access_token,
                    type: loginData.token_type
                },
                userState: userData
            });

            if (!signedIn) {
                throw new Error("Error al iniciar sesión en la aplicación");
            } else {
                navigate("/panel");
            }

        } catch (error) {
            if (error instanceof TypeError) {
                setError("Error al obtener los datos del usuario");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return { handleLogin, error, loading };
}