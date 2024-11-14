import { Section, Title, Textarea, Form, FieldGroup, Label, Input, RowGroup, FileInput, GreenButton } from "../styled";
import EventsList from "./EventsList";

function EventForm() {
    return (
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
    )
}

export default function EventosPanel() {

    const newsItems = [
        { id: 1, title: 'Programación Festival de Viña del Mar 2024', description: 'El acto que inaugurará el Festival de Viña del Mar 2024 el domingo 25 de febrero será el español Alejandro Sanz, intérprete de temas como «Corazón partío» y «La tortura», noche que compartirá con el colombiano y exponente del género urbano Manuel Turizo. El mundialmente aclamado Andrea Bocelli pisará el escenario de la Quinta Vergara el lunes 26, junto con el dúo argentino Miranda!. Por otro lado, Maná y Men at Work se presentarán el martes 27; Mora y Anitta el miércoles 28; Los Bunkers y Young Cister, —quienes marcarán el regreso de la emblemática «noche chilena»— el jueves 29; y Peso Pluma y María Becerra, que cerrarán el evento, el viernes 1 de marzo.', published: true },
        { id: 2, title: 'Feria del Libro', description: 'Disfruta de los mejores libros...', published: false },
    ];

    return (
        <Section>
            <Title>Eventos</Title>
            <EventsList events={newsItems}></EventsList>
        </Section>
    )
}