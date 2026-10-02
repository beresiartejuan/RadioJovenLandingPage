import { Section, Title, Textarea, Form, FieldGroup, Label, Input, RowGroup, GreenButton, ErrorMessage } from "../styled";
import { useHoroscope } from "../hooks/useHoroscope";

export default function HoroscopoPanel() {
    const { horoscope, handleChangeEvent, updateHoroscope, loading, error } = useHoroscope();

    const handleSubmit = (e) => {
        e.preventDefault();
        updateHoroscope();
    };

    return (
        <Section>
            <Title>Horoscopo</Title>
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
                        {loading ? "Actualizando..." : "Actualizar"}
                    </GreenButton>
                </RowGroup>
            </Form>
        </Section>
    );
}
