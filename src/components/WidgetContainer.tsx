import styled from "styled-components";

const WidgetContainer = styled.section`

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    max-width: 85vw;
    margin: 5vh auto;
    gap: 3rem;
    justify-content: center;

    & > div {
        max-width: 400px;
        text-align: center;
        font-family: sans-serif;
        padding: 2rem;
    }

    @media screen and (max-width: 800px){
        gap: 0rem;
    }
`;

export default WidgetContainer;