import { Section, Title, Textarea, Form, FieldGroup, Label, Input, RowGroup, FileInput, GreenButton } from "../styled";

export default function EventosPanel() {
    return (
        <Section>
            <Title>Eventos</Title>
            <Form>
                <FieldGroup>
                    <Label>Titulo</Label>
                    <Input type="text"></Input>
                </FieldGroup>
                <FieldGroup>
                    <Label>Imagen</Label>
                    <FileInput type="file"></FileInput>
                </FieldGroup>
                <FieldGroup>
                    <Label>Cuerpo</Label>
                    <Textarea></Textarea>
                </FieldGroup>
                <RowGroup>
                    <GreenButton>Publicar</GreenButton>
                </RowGroup>
            </Form>
        </Section>
    )
}