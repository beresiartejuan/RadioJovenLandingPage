import { useState } from "react";
import { FieldGroup, Form, GreenButton, Input, Label, Section, Textarea, Title } from "../styled";
import EventsList from "./EventsList";
import useEvents from "../hooks/useEvents";
import { } from "../styled";

export default function EventosPanel() {
    const { events, loading, error, deleteEvent, editEvent, addEvent } = useEvents();
    const [form, setForm] = useState({ id: null, title: "", description: "", published: false });

    // Manejar cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.id) {
            // Editar evento
            await editEvent(form.id, {
                title: form.title,
                description: form.description,
                published: form.published,
            });
        } else {
            // Crear evento
            await addEvent({
                title: form.title,
                description: form.description,
                published: form.published,
            });
        }
        setForm({ id: null, title: "", description: "", published: false });
    };

    // Manejar edición desde la lista
    const handleEdit = (event) => {
        setForm(event);
    };

    if (loading) return <p>Cargando eventos...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <Section>
            <Title>Eventos</Title>

            {/* Formulario */}
            <Form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Label>Título: </Label>
                    <Input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Descripción:</Label>
                    <Textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        required
                    />
                </FieldGroup>
                <input
                    type="checkbox"
                    name="published"
                    checked={form.published}
                    onChange={handleChange}
                    value={true}
                    style={{ display: 'none' }}
                />
                <GreenButton type="submit">{form.id ? "Actualizar Evento" : "Crear Evento"}</GreenButton>
                {form.id && (
                    <button type="button" onClick={() => setForm({ id: null, title: "", description: "", published: false })}>
                        Cancelar Edición
                    </button>
                )}
            </Form>

            {/* Lista de eventos */}
            <EventsList
                events={events}
                onDelete={deleteEvent}
                onEdit={handleEdit}
            />
        </Section>
    );
}
