import style from "../scss/Navbar.module.scss";
import MenuIcon from "../assets/MenuIcon.jsx";
import CloseIcon from "../assets/CloseIcon.jsx";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth, useIsAuthenticated } from "../auth/AuthContext";

export default function Navbar() {
    const [isOpen, setOpen] = useState(false);

    const toggleMenu = () => setOpen((prev) => !prev);
    const closeMenu = () => setOpen(false);
    const isAuthenticated = useIsAuthenticated();
    const { signOut } = useAuth();
    const [location, navigate] = useLocation();

    const handleSignOut = () => {
        signOut();
        navigate('/');
    };

    const isActive = (path) => location === path;

    return (
        <nav className={style.navbar}>
            <div className={style.inner}>
                <Link href="/" className={style.brand}>
                    <img src="/logo.jpeg" alt="Radio Joven Mendoza" />
                    <div className={style.brandText}>
                        <strong>Radio Joven</strong>
                        <span>Mendoza</span>
                    </div>
                </Link>
                <button
                    type="button"
                    className={`${style.menuButton} ${isOpen ? style.open : ''}`}
                    aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
                    aria-expanded={isOpen}
                    onClick={toggleMenu}
                >
                    {isOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
                <div className={`${style.links} ${isOpen ? style.show : ''}`}>
                    <Link className={isActive('/') ? style.active : ''} href="/" onClick={closeMenu}>Inicio</Link>
                    <Link className={isActive('/horoscopo') ? style.active : ''} href="/horoscopo" onClick={closeMenu}>Horóscopo</Link>
                    <Link className={isActive('/eventos') ? style.active : ''} href="/eventos" onClick={closeMenu}>Eventos</Link>
                    {!isAuthenticated && (
                        <Link className={isActive('/ingresar') ? style.active : ''} href="/ingresar" onClick={closeMenu}>Ingresar</Link>
                    )}
                    {isAuthenticated && (
                        <Link className={`${style.highlight} ${isActive('/panel') ? style.active : ''}`} href="/panel" onClick={closeMenu}>Panel</Link>
                    )}
                    {isAuthenticated && (
                        <button type="button" onClick={() => { closeMenu(); handleSignOut(); }}>
                            Salir
                        </button>
                    )}
                </div>
            </div>
        </nav>
    )
}
