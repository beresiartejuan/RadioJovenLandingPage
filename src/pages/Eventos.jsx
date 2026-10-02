import styled from "styled-components";
import Navbar from "../components/Navbar";
import useEvents from "../hooks/useEvents";

const Column = styled.section`
    font-family: sans-serif;

    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    text-align: center;

    h1 {
        font-size: 2rem;
        margin: 10vh 0;
        font-weight: 700;
        text-transform: uppercase;
    }

    div {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        max-width: 1000px;
        gap: 2rem;
        margin: 2vh auto;

        div {
            margin: 0 auto;
            gap: 0;
            max-width: 50%;
            text-align: left;

            h3 {
                font-size: 1.5rem;
                max-height: fit-content;
            }

            p {
                font-size: 1.1rem;
            }
        }
    }
`;

export default function Eventos() {
    const { events, loading, error } = useEvents();

    return (
        <>
            <Navbar />
            <Column>
                <h1>Eventos</h1>

                {error && (
                    <p role="alert">No se pudieron cargar los eventos. Intentá de nuevo más tarde.</p>
                )}
                {loading && <p>Cargando eventos...</p>}
                {!loading && !error && events.length === 0 && (
                    <p>No hay eventos publicados por el momento</p>
                )}

                {events.map((evento, index) => (
                    <div key={evento.id ?? index}>
                        <div>
                            <h3>{evento.title}</h3>
                            <p>{evento.description}</p>
                        </div>
                    </div>
                ))}
            </Column>
        </>
    );
}