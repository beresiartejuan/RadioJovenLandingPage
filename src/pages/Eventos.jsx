import styled from "styled-components";
import Navbar from "../components/Navbar";
import useEvents from "../hooks/useEvents";
import { LoadingMessage, ErrorMessage, Badge } from "../styled";

const Page = styled.main`
  min-height: calc(100vh - var(--navbar-height));
  padding: var(--space-2xl) var(--space-lg) var(--space-3xl);
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

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-xl);
  max-width: var(--container-max);
  margin: 0 auto;
`;

const EventCard = styled.article`
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  padding: var(--space-xl);
  text-align: left;
  transition: transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }

  .date {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: var(--space-md);
  }

  h3 {
    font-size: 1.35rem;
    margin-bottom: var(--space-sm);
    color: var(--color-text);
  }

  p {
    color: var(--color-text-secondary);
    line-height: 1.6;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--space-3xl) var(--space-lg);
  color: var(--color-text-secondary);

  .emoji {
    font-size: 3rem;
    margin-bottom: var(--space-md);
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: var(--space-sm);
    color: var(--color-text);
  }
`;

export default function Eventos() {
    const { events, loading, error } = useEvents();

    return (
        <>
            <Navbar />
            <Page>
                <Header>
                    <h1>Próximos eventos 🎉</h1>
                    <p>Enterate de todo lo que se viene en Radio Joven Mendoza.</p>
                </Header>

                {error && <ErrorMessage role="alert">No se pudieron cargar los eventos. Intentá de nuevo más tarde.</ErrorMessage>}
                {loading && <LoadingMessage>Cargando eventos...</LoadingMessage>}

                {!loading && !error && events.length === 0 && (
                    <EmptyState>
                        <div className="emoji">🎤</div>
                        <h3>No hay eventos publicados</h3>
                        <p>Por el momento no tenemos eventos activos. Volvé pronto para enterarte de las novedades.</p>
                    </EmptyState>
                )}

                {!loading && !error && events.length > 0 && (
                    <Grid>
                        {events.map((evento, index) => (
                            <EventCard key={evento.id ?? index}>
                                <div className="date">
                                    <Badge>📅 Próximamente</Badge>
                                </div>
                                <h3>{evento.title}</h3>
                                <p>{evento.description}</p>
                            </EventCard>
                        ))}
                    </Grid>
                )}
            </Page>
        </>
    );
}
