import styled from 'styled-components';
import { CustomButton } from '../styled';


// Estilos de los componentes usando styled-components
const EventContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 4vh 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
`;

const EventItem = styled.div`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const EventTitle = styled.h3`
  font-size: 1.5rem;
  margin: 0;
  color: #333;
`;

const EventDescription = styled.p`
  font-size: 1rem;
  color: #666;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

// eslint-disable-next-line react/prop-types
const EventList = ({ events, onEdit, onToggleVisibility, onDelete }) => {
    // Función para truncar el texto de la descripción
    const truncateDescription = (text, maxWords) => {
        const words = text.split(' ');
        return words.length > maxWords
            ? words.slice(0, maxWords).join(' ') + '...'
            : text;
    };

    return (
        <EventContainer>
            {events.map((event) => (
                <EventItem key={event.id}>
                    <EventTitle>{event.title}</EventTitle>
                    <EventDescription>{truncateDescription(event.description, 35)}</EventDescription>
                    <ButtonContainer>
                        <CustomButton color='#4CAF50'>Editar</CustomButton>
                        <CustomButton color='#FF9800'>Publicar</CustomButton>
                        <CustomButton color='#F44336'>Eliminar</CustomButton>
                    </ButtonContainer>
                </EventItem>
            ))}
        </EventContainer>
    );
};

export default EventList;
