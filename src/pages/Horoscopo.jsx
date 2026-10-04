import styled from "styled-components";
import Navbar from "../components/Navbar";
import { useHoroscope } from "../hooks/useHoroscope";
import { ErrorMessage } from "../styled";

const Page = styled.main`
  min-height: calc(100vh - var(--navbar-height));
  padding: var(--space-2xl) var(--space-lg) var(--space-3xl);
  background: linear-gradient(180deg, var(--color-bg) 0%, #fff 100%);
`;

const Header = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto var(--space-2xl);

  h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    margin-bottom: var(--space-sm);
    color: var(--color-text);
  }

  p {
    color: var(--color-text-secondary);
    font-size: 1.1rem;
  }
`;

const Card = styled.article`
  display: grid;
  grid-template-columns: 1fr;
  max-width: 900px;
  margin: 0 auto;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  border: 1px solid var(--color-border);

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ImageSide = styled.div`
  position: relative;
  min-height: 300px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .fallback {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 6rem;
  }
`;

const ContentSide = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-2xl);
  text-align: left;

  @media (max-width: 767px) {
    text-align: center;
  }

  .badge {
    display: inline-flex;
    align-self: flex-start;
    margin-bottom: var(--space-md);
    padding: 0.35rem 0.9rem;
    font-size: 0.75rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border-radius: var(--radius-full);
    background: rgba(255, 122, 51, 0.12);
    color: var(--color-accent-dark);

    @media (max-width: 767px) {
      align-self: center;
    }
  }

  h2 {
    font-size: clamp(1.5rem, 3vw, 2rem);
    margin-bottom: var(--space-md);
    color: var(--color-text);
  }

  p {
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--color-text-secondary);
    white-space: pre-wrap;
  }
`;

export default function Horoscopo() {
    const { horoscope, error } = useHoroscope();

    return (
        <>
            <Navbar />
            <Page>
                <Header>
                    <h1>Horóscopo bizarro 🔮</h1>
                    <p>El horóscopo más irreverente de General Alvear.</p>
                </Header>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                <Card>
                    <ImageSide>
                        {horoscope.image ? (
                            <img src={horoscope.image} alt="Horóscopo bizarro" />
                        ) : (
                            <div className="fallback">🐐</div>
                        )}
                    </ImageSide>
                    <ContentSide>
                        <span className="badge">Para hoy</span>
                        <h2>{horoscope.title || "Cargando horóscopo..."}</h2>
                        <p>{horoscope.content || "El universo está cargando tu destino..."}</p>
                    </ContentSide>
                </Card>
            </Page>
        </>
    );
}
