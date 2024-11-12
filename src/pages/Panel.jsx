import Navbar from "../components/Navbar";
import Authenticate from "../auth/Authenticate";
import style from "../scss/Panel.module.scss";
import HoroscopoPanel from "../components/HoroscopoPanel";
import EventosPanel from "../components/EventosPanel";

export default function Panel() {
    return (
        <Authenticate>
            <Navbar></Navbar>
            <div className={style.container}>
                <HoroscopoPanel></HoroscopoPanel>
                <EventosPanel></EventosPanel>
            </div>
        </Authenticate>
    )
}