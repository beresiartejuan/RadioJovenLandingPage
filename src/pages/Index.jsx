import styled from "styled-components";
import Navbar from "../components/Navbar";
import ClimaWidget from "../widgets/ClimaWidget";
import RadioWidget from "../widgets/RadioWidget";
import RelojWidget from "../widgets/RelojWidget";
import WidgetContainer from "../components/WidgetContainer";
import Horarios from "../components/Horarios";
import SocialMedia from "../components/SocialMedia";
import PlayIcon from "../assets/PlayIcon.jsx";

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary) 0%, #0d3a3a 50%, var(--color-primary-dark) 100%);
  color: #fff;
  padding: var(--space-3xl) var(--space-lg);
  text-align: center;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 50% 40%, rgba(255, 122, 51, 0.22) 0%, transparent 45%),
      radial-gradient(circle at 20% 80%, rgba(255, 209, 102, 0.12) 0%, transparent 35%),
      radial-gradient(circle at 80% 20%, rgba(255, 122, 51, 0.1) 0%, transparent 30%);
    pointer-events: none;
  }

  .heroContent {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
  }

  .logo {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid var(--color-accent);
    box-shadow: 0 0 0 8px rgba(255, 122, 51, 0.15), var(--shadow-xl);
    margin: 0 auto var(--space-xl);
  }

  .logoGlow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -55%);
    width: 160px;
    height: 160px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255, 122, 51, 0.35) 0%, transparent 70%);
    filter: blur(20px);
    pointer-events: none;
    z-index: 0;
  }

  h1 {
    font-size: clamp(2.2rem, 6vw, 4rem);
    font-weight: 900;
    margin-bottom: var(--space-md);
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .tagline {
    font-size: clamp(1.1rem, 2.5vw, 1.5rem);
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: var(--space-xl);
    max-width: 620px;
    margin-left: auto;
    margin-right: auto;
  }

  .cta {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.95rem 2rem;
    background: var(--color-accent);
    color: #fff;
    font-weight: 800;
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-accent);
    transition: transform var(--transition-base), box-shadow var(--transition-base);

    svg {
      width: 1.1em;
      height: 1.1em;
      flex-shrink: 0;
    }

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(255, 122, 51, 0.35);
    }
  }

  @media (min-width: 768px) {
    padding: calc(var(--space-3xl) * 1.5) var(--space-2xl);

    .logo {
      width: 140px;
      height: 140px;
    }

    .logoGlow {
      width: 190px;
      height: 190px;
    }
  }
`;

const WidgetsSection = styled.section`
  padding: var(--space-3xl) 0;
`;

const AdCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 260px;
`;

export default function Index() {
    return (
        <>
            <Navbar />
            <Hero>
                <div className="heroContent">
                    <div className="logoGlow" aria-hidden="true" />
                    <img className="logo" src="/logo.jpeg" alt="Radio Joven Mendoza" />
                    <h1>Radio Joven Mendoza</h1>
                    <p className="tagline">La radio de General Alvear que te acompaña con música, buena onda y la mejor programación.</p>
                    <a className="cta" href="#player">
                        <PlayIcon />
                        Escuchar en vivo
                    </a>
                </div>
            </Hero>

            <WidgetsSection>
                <WidgetContainer>
                    <ClimaWidget />
                    <RelojWidget />
                    <AdCard className="ad">
                        <img src="/publi.jpeg" alt="Publicidad" />
                    </AdCard>
                </WidgetContainer>
            </WidgetsSection>

            <div id="player" style={{ scrollMarginTop: "calc(var(--navbar-height) + 1rem)" }}>
                <RadioWidget />
            </div>

            <Horarios />
            <SocialMedia />
        </>
    );
}
