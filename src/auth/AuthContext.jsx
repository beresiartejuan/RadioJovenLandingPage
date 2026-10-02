import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const AUTH_KEY = '_auth';

function getUnauthenticatedState() {
    return { token: null, tokenType: null, user: null };
}

function getStoredAuthState() {
    try {
        const stored = localStorage.getItem(AUTH_KEY);
        if (!stored) return getUnauthenticatedState();

        const parsed = JSON.parse(stored);

        // Formato legacy de react-auth-kit: { auth: { token: { value, type } }, userState: {...} }
        // Formato simple: { token: { value, type }, user: {...} }
        let token = null;
        let user = null;

        if (parsed?.auth?.token) {
            token = parsed.auth.token;
            user = parsed.userState ?? null;
        } else if (parsed?.token) {
            token = parsed.token;
            user = parsed.user ?? null;
        }

        if (!token) return getUnauthenticatedState();

        return {
            token,
            tokenType: token.type ?? null,
            user,
        };
    } catch {
        return getUnauthenticatedState();
    }
}

export function AuthProvider(props) {
    const [state, setState] = useState(getStoredAuthState);

    const signIn = useCallback(({ token, tokenType, user }) => {
        const stored = {
            token: { value: token, type: tokenType },
            user,
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(stored));
        setState({ token: stored.token, tokenType: tokenType ?? null, user: user ?? null });
        return true;
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem(AUTH_KEY);
        setState(getUnauthenticatedState());
    }, []);

    const hasToken = Boolean(state.token);
    const isAuthenticated = hasToken && Boolean(state.token?.value ?? state.token);

    const value = useMemo(() => ({
        isAuthenticated,
        user: state.user,
        token: state.token,
        tokenType: state.tokenType,
        signIn,
        signOut,
    }), [isAuthenticated, state.user, state.token, state.tokenType, signIn, signOut]);

    return (
        <AuthContext.Provider value={value}>
            {/* eslint-disable-next-line react/prop-types */}
            {props.children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
    }
    return context;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useIsAuthenticated() {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
}