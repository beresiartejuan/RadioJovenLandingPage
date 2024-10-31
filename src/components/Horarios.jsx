import styled from "styled-components"

const Section = styled.section`
    font-family: sans-serif;
    max-width: fit-content;
    margin: 0 auto;
    text-align: center;
    
    h3 {
        font-size: 1.6rem;
        font-weight: 600;
    }

    div {
        display: flex;
        flex-direction: column;
        gap: .2rem;
        padding: 1rem;
    }

    span {
        color: gray;
    }
`;

export default function Horarios() {
    return (
        <Section>
            <h3>PROGRAMACIÓN 2024:</h3>
            <div>
                <span>De lunes a sábados desde las 09:00 a 13:00 – RCS con la conducción de Pablo Gonzalez</span><br></br>
                <span>De lunes a viernes desde las 17:00 a 20:00 – Está En Verde con la conducción de Daiana Navarro</span><br></br>
                <span>De lunes a viernes desde las 20:00 a 24:00 – Galeria 100 con la conducción de Mauricio Jofré</span>
            </div>
        </Section>
    )
}