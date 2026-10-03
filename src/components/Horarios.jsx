import styled from "styled-components";

const Section = styled.section`
  max-width: var(--container-max);
  margin: var(--space-3xl) auto;
  padding: 0 var(--space-lg);
  text-align: center;

  .header {
    margin-bottom: var(--space-xl);

    h2 {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      color: var(--color-text);
      margin-bottom: var(--space-sm);
    }

    p {
      color: var(--color-text-secondary);
      font-size: 1.1rem;
    }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: var(--space-lg);
  }

  @media (min-width: 768px) {
    padding: 0 var(--space-2xl);
  }
`;

const Card = styled.article`
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  text-align: left;
  transition: transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .time {
    display: inline-block;
    padding: 0.35rem 0.85rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    border-radius: var(--radius-full);
    background-color: rgba(255, 122, 51, 0.12);
    color: var(--color-accent-dark);
    margin-bottom: var(--space-md);
  }

  @media (min-width: 768px) {
    .time {
      font-size: 0.8rem;
    }
  }

  h3 {
    font-size: 1.25rem;
    margin-bottom: var(--space-sm);
    color: var(--color-text);
  }

  p {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .host {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: var(--space-md);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-primary);
  }
`;

const programas = [
    {
        dias: "Lunes a sábados",
        hora: "09:00 a 13:00",
        titulo: "RCS",
        host: "Pablo Gonzalez",
    },
    {
        dias: "Lunes a viernes",
        hora: "17:00 a 20:00",
        titulo: "Está En Verde",
        host: "Daiana Navarro",
    },
    {
        dias: "Lunes a viernes",
        hora: "20:00 a 24:00",
        titulo: "Galeria 100",
        host: "Mauricio Jofré",
    },
];

export default function Horarios() {
    return (
        <Section>
            <div className="header">
                <h2>Programación 2025</h2>
                <p>Todos los días con la mejor música y compañía</p>
            </div>
            <div className="grid">
                {programas.map((p) => (
                    <Card key={p.titulo}>
                        <span className="time">{p.dias} · {p.hora}</span>
                        <h3>{p.titulo}</h3>
                        <p>{`Con la conducción de ${p.host}`}</p>
                        <span className="host">🎙️ {p.host}</span>
                    </Card>
                ))}
            </div>
        </Section>
    );
}
