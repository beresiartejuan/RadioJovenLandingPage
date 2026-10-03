import { useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Authenticate from "../auth/Authenticate";
import HoroscopoPanel from "../components/HoroscopoPanel";
import EventosPanel from "../components/EventosPanel";

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
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    margin-bottom: var(--space-sm);
    color: var(--color-text);
  }

  p {
    color: var(--color-text-secondary);
  }
`;

const Tabs = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-2xl);
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 700;
  border-radius: var(--radius-full);
  border: 2px solid ${({ active }) => (active ? "var(--color-accent)" : "var(--color-border)")};
  background: ${({ active }) => (active ? "var(--color-accent)" : "var(--color-surface)")};
  color: ${({ active }) => (active ? "#fff" : "var(--color-text-secondary)")};
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: ${({ active }) => (active ? "var(--shadow-accent)" : "var(--shadow-sm)")};

  &:hover {
    transform: translateY(-2px);
    border-color: var(--color-accent);
  }
`;

const PanelContainer = styled.div`
  max-width: 760px;
  margin: 0 auto;
  animation: fadeIn 300ms ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default function Panel() {
    const [activeTab, setActiveTab] = useState("horoscopo");

    return (
        <Authenticate>
            <Navbar />
            <Page>
                <Header>
                    <h1>Panel de administración 🛠️</h1>
                    <p>Gestioná el horóscopo y los eventos de Radio Joven.</p>
                </Header>

                <Tabs>
                    <Tab active={activeTab === "horoscopo"} onClick={() => setActiveTab("horoscopo")}>
                        🔮 Horóscopo
                    </Tab>
                    <Tab active={activeTab === "eventos"} onClick={() => setActiveTab("eventos")}>
                        🎉 Eventos
                    </Tab>
                </Tabs>

                <PanelContainer key={activeTab}>
                    {activeTab === "horoscopo" && <HoroscopoPanel />}
                    {activeTab === "eventos" && <EventosPanel />}
                </PanelContainer>
            </Page>
        </Authenticate>
    );
}
