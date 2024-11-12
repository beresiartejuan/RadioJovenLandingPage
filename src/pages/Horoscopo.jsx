import styled from "styled-components";
import Navbar from "../components/Navbar";
import { useHoroscope } from "../hooks/useHoroscope";

const PUBLIC_URL = "http://localhost:8000/storage";

const Page = styled.section`

    font-family: sans-serif;
    max-width: fit-content;
    margin: 10vh auto;
    text-align: center;

    h1 {
        font-size: 2rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    h3 {
        font-size: 1.3rem;
        font-weight: 600;
        text-transform: capitalize;
    }

    span {
        font-size: 1.1rem;
        color: #707070;
    }

    div[role="card"]{
        margin-top: 5vh;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        max-width: 1000px;
        gap: 3rem;
        justify-content: center;

        div {
            min-width: 300px;
            max-width: 40%;
            text-align: left;

            @media screen and (max-width: 900px) {
                text-align: center;
            }

            img {
                width: 100%;
                border-radius: 10px;
            }
        }
    }
`;

export default function Horoscopo() {
    const { horoscope } = useHoroscope();

    console.log(horoscope);

    return (
        <>
            <Navbar></Navbar>
            <Page>
                <h1>Horoscopo bizarro</h1>
                <div role="card">
                    <div>
                        <img src={`${PUBLIC_URL}/${horoscope.image}`} alt="Foto para el horoscopo de una cabra" />
                    </div>
                    <div>
                        <h3>{horoscope.title}</h3>
                        <span>{horoscope.content}</span>
                    </div>
                </div>
            </Page>
        </>
    )
}