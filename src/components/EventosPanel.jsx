import { useState } from "react";
import styled from "styled-components";
import { FieldGroup, Form, GreenButton, Input, Label, Section, Textarea, Title, ErrorMessage, LoadingMessage } from "../styled";
import EventsList from "./EventsList";
import useEvents from "../hooks/useEvents";

const ToggleRow = styled.label`
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0.6rem 0;
  cursor: pointer;
  font-weight: 600;
  color: var(--color-text-secondary);

  input {
    width: 20px;
    height: 20px;
    accent-color: var(--color-accent);
    cursor: pointer;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 600;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover {
    border-color: var(--color-error);
    color: var(--color-error);
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
`;

export default function EventosPanel() {
    const { events, loading, error, deleteEvent, editEvent, addEvent } = useEvents();
    const [form, setForm] = useState({ id: null, title: "", description: "", published: false });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            title: form.title,
            description: form.description,
            published: form.published,
        };

        const ok = form.id
            ? await editEvent(form.id, payload)
            : await addEvent(payload);
        if (ok) {
            setForm({ id: null, title: "", description: "", published: false });
        }
    };

    const handleEdit = (event) => {
        setForm(event);
    };

    if (loading && events.length === 0) return <LoadingMessage>Cargando eventos...</LoadingMessage>;
    if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

    return (
        <Section>
            <Title>Eventos</Title>

            <Form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Label>Título</Label>
                    <Input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Nombre del evento"
                        required
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Descripción</Label>
                    <Textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Contanos de qué se trata..."
                        required
                    />
                </FieldGroup>
                <ToggleRow>
                    <input
                        type="checkbox"
                        name="published"
                        checked={form.published}
                        onChange={handleChange}
                    />
                    Publicar evento (visible en la web)
                </ToggleRow>
                <Actions>
                    <GreenButton type="submit" disabled={loading}>
                        {loading ? "Guardando..." : form.id ? "Actualizar Evento" : "Crear Evento"}
                    </GreenButton>
                    {form.id && (
                        <CancelButton type="button" onClick={() => setForm({ id: null, title: "", description: "", published: false })}>
                            Cancelar edición
                        </CancelButton>
                    )}
                </Actions>
            </Form>

            <EventsList
                events={events}
                onDelete={deleteEvent}
                onEdit={handleEdit}
            />
        </Section>
    );
}
