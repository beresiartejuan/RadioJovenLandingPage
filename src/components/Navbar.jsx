import style from "../scss/Navbar.module.scss";
import MenuIcon from "../assets/MenuIcon.jsx";
import { useState } from "react";

export default function Navbar() {

    const [isOpen, setOpen] = useState(false);

    return (
        <nav className={style.navbar}>
            <div>
                <img className="logo" src="/logo.jpeg"></img>
                <MenuIcon onClick={() => setOpen(!isOpen)} />
            </div>
            <div className={`${isOpen ? style.show : ''}`}>
                <a className="item" href="/">Inicio</a>
                <a className="item" href="/horoscopo">Horoscopo</a>
                <a className="item" href="/eventos">Eventos</a>
            </div>
        </nav>
    )
}