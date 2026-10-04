import { useState } from "react";
import styled from "styled-components";
import { CustomButton, FieldGroup, Form, GreenButton, Input, Label, Section, Title, ErrorMessage, LoadingMessage } from "../styled";
import useSchedule from "../hooks/useSchedule";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-top: var(--space-xl);
`;

const ProgramItem = styled.article`
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

const ProgramTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
  color: var(--color-text);
`;

const ProgramMeta = styled.p`
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
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

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-md);
  align-items: center;
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

const EMPTY_FORM = { id: null, days: "", time: "", title: "", host: "" };

export default function SchedulePanel() {
    const { schedule, loading, error, addItem, editItem, deleteItem } = useSchedule();
    const [form, setForm] = useState(EMPTY_FORM);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            days: form.days,
            time: form.time,
            title: form.title,
            host: form.host,
        };

        const ok = form.id
            ? await editItem(form.id, payload)
            : await addItem(payload);
        if (ok) {
            setForm(EMPTY_FORM);
        }
    };

    const handleEdit = (entry) => {
        setForm({ id: entry.id, days: entry.days, time: entry.time, title: entry.title, host: entry.host });
    };

    if (loading && schedule.length === 0) return <LoadingMessage>Cargando programación...</LoadingMessage>;
    if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;

    return (
        <Section>
            <Title>Programación</Title>

            <Form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Label>Días</Label>
                    <Input
                        type="text"
                        name="days"
                        value={form.days}
                        onChange={handleChange}
                        placeholder="Lunes a viernes"
                        required
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Horario</Label>
                    <Input
                        type="text"
                        name="time"
                        value={form.time}
                        onChange={handleChange}
                        placeholder="09:00 a 13:00"
                        required
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Programa</Label>
                    <Input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Nombre del programa"
                        required
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Conducción</Label>
                    <Input
                        type="text"
                        name="host"
                        value={form.host}
                        onChange={handleChange}
                        placeholder="Nombre del conductor/a"
                        required
                    />
                </FieldGroup>
                <Actions>
                    <GreenButton type="submit" disabled={loading}>
                        {loading ? "Guardando..." : form.id ? "Actualizar programa" : "Agregar programa"}
                    </GreenButton>
                    {form.id && (
                        <CancelButton type="button" onClick={() => setForm(EMPTY_FORM)}>
                            Cancelar edición
                        </CancelButton>
                    )}
                </Actions>
            </Form>

            {schedule.length === 0 ? (
                <EmptyState>No hay programas cargados todavía.</EmptyState>
            ) : (
                <List>
                    {schedule.map((entry) => (
                        <ProgramItem key={entry.id}>
                            <ProgramTitle>{entry.title}</ProgramTitle>
                            <ProgramMeta>{entry.days} · {entry.time}</ProgramMeta>
                            <ProgramMeta>{`Con la conducción de ${entry.host}`}</ProgramMeta>
                            <ButtonContainer>
                                <CustomButton onClick={() => handleEdit(entry)} color="#22c55e">Editar</CustomButton>
                                <CustomButton onClick={() => deleteItem(entry.id)} color="#ef4444">Eliminar</CustomButton>
                            </ButtonContainer>
                        </ProgramItem>
                    ))}
                </List>
            )}
        </Section>
    );
}