import styled from 'styled-components';
import { CustomButton, Badge } from '../styled';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-xl);
`;

const EventItem = styled.article`
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  transition: box-shadow var(--transition-base);

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const EventTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
  color: var(--color-text);
`;

const EventDescription = styled.p`
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
`;

const EmptyState = styled.p`
  text-align: center;
  color: var(--color-text-muted);
  padding: var(--space-xl) 0;
`;

// eslint-disable-next-line react/prop-types
const EventsList = ({ events, onEdit, onDelete }) => {
  const truncateDescription = (text, maxWords) => {
    const words = text.split(' ');
    return words.length > maxWords
      ? words.slice(0, maxWords).join(' ') + '...'
      : text;
  };

  // eslint-disable-next-line react/prop-types
  if (events.length === 0) {
    return <EmptyState>No hay eventos cargados todavía.</EmptyState>;
  }

  return (
    <List>
      {/* eslint-disable-next-line react/prop-types */}
      {events.map((event) => (
        <EventItem key={event.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <EventTitle>{event.title}</EventTitle>
            <Badge variant={event.published ? "success" : "warning"}>
              {event.published ? "Publicado" : "Borrador"}
            </Badge>
          </div>
          <EventDescription>{truncateDescription(event.description, 35)}</EventDescription>
          <ButtonContainer>
            <CustomButton onClick={() => onEdit(event)} color='#22c55e'>Editar</CustomButton>
            <CustomButton onClick={() => onDelete(event.id)} color='#ef4444'>Eliminar</CustomButton>
          </ButtonContainer>
        </EventItem>
      ))}
    </List>
  );
};

export default EventsList;
