import { Redirect } from 'wouter';
import { useIsAuthenticated } from './AuthContext'

export default function Authenticate(props) {
    const isAuthenticated = useIsAuthenticated();

    if (!isAuthenticated) {
        return <Redirect href="/ingresar" />;
    }

    // eslint-disable-next-line react/prop-types
    return props.children;
}