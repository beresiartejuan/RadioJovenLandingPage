import { useIsAuthenticated } from './AuthContext'
import { useLocation } from 'wouter';

export default function Authenticate(props) {
    const isAuthenticated = useIsAuthenticated();
    const [, navigate] = useLocation();

    if (!isAuthenticated) {
        navigate("/ingresar");
        return null;
    }

    // eslint-disable-next-line react/prop-types
    return props.children;
}

