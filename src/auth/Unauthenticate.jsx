import { useIsAuthenticated } from './AuthContext'
import { useLocation } from 'wouter';

export default function Unauthenticate(props) {
    const isAuthenticated = useIsAuthenticated();
    const [, navigate] = useLocation();

    if (isAuthenticated) {
        navigate("/panel");
        return null;
    }

    // eslint-disable-next-line react/prop-types
    return props.children;
}

