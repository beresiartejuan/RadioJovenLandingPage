import styled from "styled-components";
import Navbar from "../components/Navbar";

const data = [
    {
        title: "Programación Festival de Viña del Mar 2024",
        description: "El acto que inaugurará el Festival de Viña del Mar 2024 el domingo 25 de febrero será el español Alejandro Sanz, intérprete de temas como «Corazón partío» y «La tortura», noche que compartirá con el colombiano y exponente del género urbano Manuel Turizo. El mundialmente aclamado Andrea Bocelli pisará el escenario de la Quinta Vergara el lunes 26, junto con el dúo argentino Miranda!. Por otro lado, Maná y Men at Work se presentarán el martes 27; Mora y Anitta el miércoles 28; Los Bunkers y Young Cister, —quienes marcarán el regreso de la emblemática «noche chilena»— el jueves 29; y Peso Pluma y María Becerra, que cerrarán el evento, el viernes 1 de marzo.",
        image: "https://radiojovenmendoza.com/wp-content/uploads/2024/10/foto_0000001520231108115410-1024x1024.jpg"
    },
    {
        title: "Shakira se presentará en Latinoamérica",
        description: "El año que viene con su gira mundial Las mujeres ya no lloran. Anunció que se presentará en la Argentina y también en Brasil, Perú, Colombia, Chile y México. “¡Mi gente nos vemos pronto!”, expresó la artista en redes sociales. La cita en Buenos Aires es el 7 de marzo de 2025 en el Campo Argentino de Polo.",
        image: "https://radiojovenmendoza.com/wp-content/uploads/2024/10/1727913154092post-Shakira-254x300.jpg"
    },
    {
        title: "Diego Torres en Argentina",
        description: "Diego Torres anuncia su gira en Argentina: fechas, lugares y cómo sacar las entradas. El cantante llega con “Mejor que ayer Tour” a Rosario, Santa Fe, Buenos Aires y Mendoza.",
        image: "https://radiojovenmendoza.com/wp-content/uploads/2024/10/GYQ1qxEWMAAXXT_-768x768.jpg"
    },
    {
        title: "Los Caligaris",
        description: "Caligaris y toda su alegría en el Arena Maipú. La banda cordobesa aterriza en Mendoza para que cantes y bailes todos sus hits. La banda se presentará el sábado 26 de octubre, en el Arena Maipú. Las entradas ya están a la venta.",
        image: "https://radiojovenmendoza.com/wp-content/uploads/2024/10/slider-1536x626-1-300x122.jpg"
    }
];



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

            img {
                width: 100%;
                max-width: 300px;
                height: auto;
                object-fit: fill; /* Ajusta la imagen dentro del contenedor */
                border-radius: 8px; /* Opcional: redondea bordes */
            }
        }
    }
`;

export default function Eventos() {
    return (
        <>
            <Navbar />
            <Column>
                <h1>Eventos</h1>

                {data.map((evento, index) => (
                    <div key={index}>
                        <div>
                            <img src={evento.image} alt="" />
                        </div>
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
