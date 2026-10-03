import styled from "styled-components";
import { Section, Title, Textarea, Form, FieldGroup, Label, Input, RowGroup, GreenButton, ErrorMessage } from "../styled";
import { useHoroscope } from "../hooks/useHoroscope";

const Preview = styled.div`
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  background: linear-gradient(135deg, rgba(15, 76, 76, 0.05) 0%, rgba(255, 122, 51, 0.05) 100%);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--color-border);

  h4 {
    font-size: 0.8rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
    margin-bottom: var(--space-md);
  }

  img {
    width: 100%;
    max-height: 220px;
    object-fit: cover;
    border-radius: var(--radius-md);
    margin-bottom: var(--space-md);
  }

  .previewTitle {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: var(--space-xs);
  }

  .previewContent {
    color: var(--color-text-secondary);
    font-size: 0.95rem;
    line-height: 1.5;
    white-space: pre-wrap;
  }
`;

export default function HoroscopoPanel() {
    const { horoscope, handleChangeEvent, updateHoroscope, loading, error } = useHoroscope();

    const handleSubmit = (e) => {
        e.preventDefault();
        updateHoroscope();
    };

    return (
        <Section>
            <Title>Horóscopo</Title>

            <Preview>
                <h4>Vista previa</h4>
                {horoscope.image && <img src={horoscope.image} alt="Vista previa" />}
                <div className="previewTitle">{horoscope.title || "Sin título"}</div>
                <div className="previewContent">{horoscope.content || "Sin contenido"}</div>
            </Preview>

            <Form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Label>Título</Label>
                    <Input
                        value={horoscope.title}
                        onChange={handleChangeEvent}
                        name="title"
                        type="text"
                        placeholder="Cáncer y Capricornio..."
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Cuerpo del horóscopo</Label>
                    <Textarea
                        value={horoscope.content}
                        onChange={handleChangeEvent}
                        name="content"
                        placeholder="Escribe el cuerpo del horóscopo aquí..."
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>URL de la imagen</Label>
                    <Input
                        name="image"
                        type="text"
                        value={horoscope.image}
                        onChange={handleChangeEvent}
                        placeholder="https://... URL de la imagen"
                    />
                </FieldGroup>
                {error && <ErrorMessage>{error}</ErrorMessage>}
                <RowGroup>
                    <GreenButton type="submit" disabled={loading}>
                        {loading ? "Actualizando..." : "Actualizar horóscopo"}
                    </GreenButton>
                </RowGroup>
            </Form>
        </Section>
    );
}
