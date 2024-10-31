import Navbar from "../components/Navbar";
import ClimaWidget from "../widgets/ClimaWidget";
import RadioWidget from "../widgets/RadioWidget";
import RelojWidget from "../widgets/RelojWidget";
import WidgetContainer from "../components/WidgetContainer";
import Horarios from "../components/Horarios";
import SocialMedia from "../components/SocialMedia";

export default function Index() {
    return (
        <>
            <Navbar></Navbar>
            <WidgetContainer>
                <ClimaWidget></ClimaWidget>
                <RelojWidget></RelojWidget>
                <div>
                    <img style={{ width: "100%", borderRadius: "8px" }} src="/publi.jpeg" alt="Publicidad" />
                </div>
            </WidgetContainer>
            <Horarios></Horarios>
            <RadioWidget></RadioWidget>
            <SocialMedia></SocialMedia>
        </>
    )
}