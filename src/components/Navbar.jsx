import style from "../scss/Navbar.module.scss";
import MenuIcon from "../assets/MenuIcon.jsx";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useIsAuthenticated } from "../auth/AuthContext";

export default function Navbar() {

    const [isOpen, setOpen] = useState(false);
    const isAuthenticated = useIsAuthenticated();
    const { signOut } = useAuth();
    const [, navigate] = useLocation();

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    return (
        <nav className={style.navbar}>
            <div>
                <img className="logo" src="/logo.jpeg"></img>
                <MenuIcon onClick={() => setOpen(!isOpen)} />
            </div>
            <div className={`${isOpen ? style.show : ''}`}>
                <Link className="item" href="/">Inicio</Link>
                <Link className="item" href="/horoscopo">Horoscopo</Link>
                <Link className="item" href="/eventos">Eventos</Link>
                {!isAuthenticated && <Link className="item" href="/ingresar">Ingresar</Link>}
                {isAuthenticated && <Link href="/panel">Panel</Link>}
                {isAuthenticated && (
                    <button
                        type="button"
                        className="item"
                        onClick={handleSignOut}
                    >
                        Salir
                    </button>
                )}
            </div>
        </nav>
    )
}