import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { ErrorMessage, LoadingMessage } from "../styled";
import useConfig from "../hooks/useConfig";

const SCHEDULE_API_URL = "/api/schedule";

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

const EmptyState = styled.div`
  padding: var(--space-2xl) 0;
  color: var(--color-text-secondary);

  .emoji {
    font-size: 2.5rem;
    margin-bottom: var(--space-sm);
  }

  h3 {
    font-size: 1.35rem;
    margin-bottom: var(--space-xs);
    color: var(--color-text);
  }
`;

export default function Horarios() {
    const { config } = useConfig();
    const [programas, setProgramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProgramas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(SCHEDULE_API_URL);
            if (!response.ok) {
                throw new Error("Error al obtener la programación");
            }
            const data = await response.json();
            setProgramas(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProgramas();
    }, [fetchProgramas]);

    const scheduleTitle = config?.scheduleTitle || "Programación";

    return (
        <Section>
            <div className="header">
                <h2>{scheduleTitle}</h2>
                <p>Todos los días con la mejor música y compañía</p>
            </div>

            {loading && <LoadingMessage>Cargando programación...</LoadingMessage>}
            {error && <ErrorMessage role="alert">No se pudo cargar la programación. Intentá de nuevo más tarde.</ErrorMessage>}

            {!loading && !error && programas.length === 0 && (
                <EmptyState>
                    <div className="emoji">📻</div>
                    <h3>Programación a confirmar</h3>
                    <p>Estamos preparando la grilla. Volvé pronto para ver los horarios actualizados.</p>
                </EmptyState>
            )}

            {!loading && !error && programas.length > 0 && (
                <div className="grid">
                    {programas.map((p) => (
                        <Card key={p.id}>
                            <span className="time">{p.days} · {p.time}</span>
                            <h3>{p.title}</h3>
                            <p>{`Con la conducción de ${p.host}`}</p>
                            <span className="host">🎙️ {p.host}</span>
                        </Card>
                    ))}
                </div>
            )}
        </Section>
    );
}