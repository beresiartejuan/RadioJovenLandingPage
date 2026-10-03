import { Redirect } from 'wouter';
import { useIsAuthenticated } from './AuthContext'

export default function Unauthenticate(props) {
    const isAuthenticated = useIsAuthenticated();

    if (isAuthenticated) {
        return <Redirect href="/panel" />;
    }

    // eslint-disable-next-line react/prop-types
    return props.children;
}