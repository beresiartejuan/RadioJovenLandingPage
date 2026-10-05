import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FieldGroup, Form, GreenButton, Input, Label, Section, Textarea, Title, ErrorMessage, LoadingMessage } from "../styled";
import useConfig from "../hooks/useConfig";

const Subtitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-primary-dark);
  margin: var(--space-md) 0 var(--space-xs);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
`;

const SuccessFeedback = styled.p`
  color: var(--color-success);
  font-weight: 600;
  font-size: 0.95rem;
  margin: 0;
  animation: fadeIn 250ms ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-sm);
`;

// Estado local del formulario: shape plano espejo de la config completa.
const EMPTY_FORM = {
    adImageUrl: "",
    adLinkUrl: "",
    adAlt: "",
    streamUrl: "",
    socialX: "",
    socialFacebook: "",
    socialInstagram: "",
    whatsappHref: "",
    whatsappDefaultText: "",
    tagline: "",
    scheduleTitle: "",
};

function configToForm(config) {
    return {
        adImageUrl: config.ad?.imageUrl ?? "",
        adLinkUrl: config.ad?.linkUrl ?? "",
        adAlt: config.ad?.alt ?? "",
        streamUrl: config.streamUrl ?? "",
        socialX: config.socials?.x ?? "",
        socialFacebook: config.socials?.facebook ?? "",
        socialInstagram: config.socials?.instagram ?? "",
        whatsappHref: config.whatsapp?.href ?? "",
        whatsappDefaultText: config.whatsapp?.defaultText ?? "",
        tagline: config.tagline ?? "",
        scheduleTitle: config.scheduleTitle ?? "",
    };
}

// El PUT acepta un body parcial: se envía el shape completo editado.
function formToConfigPatch(form) {
    return {
        ad: {
            imageUrl: form.adImageUrl,
            linkUrl: form.adLinkUrl,
            alt: form.adAlt,
        },
        streamUrl: form.streamUrl,
        socials: {
            x: form.socialX,
            facebook: form.socialFacebook,
            instagram: form.socialInstagram,
        },
        whatsapp: {
            href: form.whatsappHref,
            defaultText: form.whatsappDefaultText,
        },
        tagline: form.tagline,
        scheduleTitle: form.scheduleTitle,
    };
}

export default function ConfigPanel() {
    const { config, loading, saving, error, saveConfig } = useConfig();
    const [form, setForm] = useState(null);
    const [savedFeedback, setSavedFeedback] = useState(false);
    const feedbackTimer = useRef(null);

    useEffect(() => {
        return () => {
            if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
        };
    }, []);

    // Carga inicial: sync del form cuando la config llega de la API.
    if (loading && !config) return <LoadingMessage>Cargando configuración...</LoadingMessage>;
    if (loading === false && !config) return <ErrorMessage>No se pudo cargar la configuración. Reintentá recargando la página.</ErrorMessage>;

    const currentForm = form ?? (config ? configToForm(config) : EMPTY_FORM);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...(prev ?? (config ? configToForm(config) : EMPTY_FORM)),
            [name]: value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const ok = await saveConfig(formToConfigPatch(currentForm));
        if (ok) {
            // El estado global ya quedó actualizado por el hook (respuesta del
            // PUT); se descarta el draft local para volver a sincronizarse.
            setForm(null);
            setSavedFeedback(true);
            if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
            feedbackTimer.current = setTimeout(() => setSavedFeedback(false), 2500);
        }
    };

    return (
        <Section>
            <Title>Configuración del sitio</Title>

            <Form onSubmit={handleSave}>
                <Subtitle>📢 Publicidad</Subtitle>
                <FieldGroup>
                    <Label>URL de la imagen</Label>
                    <Input
                        type="text"
                        name="adImageUrl"
                        value={currentForm.adImageUrl}
                        onChange={handleChange}
                        placeholder="/publi.jpeg o https://..."
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Link (opcional)</Label>
                    <Input
                        type="text"
                        name="adLinkUrl"
                        value={currentForm.adLinkUrl}
                        onChange={handleChange}
                        placeholder="https://sitio-del-anunciante.com"
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Texto alternativo</Label>
                    <Input
                        type="text"
                        name="adAlt"
                        value={currentForm.adAlt}
                        onChange={handleChange}
                        placeholder="Publicidad"
                    />
                </FieldGroup>

                <Subtitle>📻 Radio</Subtitle>
                <FieldGroup>
                    <Label>URL del stream</Label>
                    <Input
                        type="text"
                        name="streamUrl"
                        value={currentForm.streamUrl}
                        onChange={handleChange}
                        placeholder="https://sc.host-live.com/8222/stream"
                        required
                    />
                </FieldGroup>

                <Subtitle>🌐 Redes</Subtitle>
                <FieldGroup>
                    <Label>X (Twitter)</Label>
                    <Input
                        type="text"
                        name="socialX"
                        value={currentForm.socialX}
                        onChange={handleChange}
                        placeholder="https://x.com/radiojovenalv"
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Facebook</Label>
                    <Input
                        type="text"
                        name="socialFacebook"
                        value={currentForm.socialFacebook}
                        onChange={handleChange}
                        placeholder="https://www.facebook.com/radiojovenmendoza"
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Instagram</Label>
                    <Input
                        type="text"
                        name="socialInstagram"
                        value={currentForm.socialInstagram}
                        onChange={handleChange}
                        placeholder="https://www.instagram.com/radiojovenmendoza/"
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>WhatsApp (link base)</Label>
                    <Input
                        type="text"
                        name="whatsappHref"
                        value={currentForm.whatsappHref}
                        onChange={handleChange}
                        placeholder="https://wa.me/2625523555"
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>WhatsApp (mensaje precargado)</Label>
                    <Input
                        type="text"
                        name="whatsappDefaultText"
                        value={currentForm.whatsappDefaultText}
                        onChange={handleChange}
                        placeholder="¡Hola Radio Joven!"
                    />
                </FieldGroup>

                <Subtitle>📝 Textos</Subtitle>
                <FieldGroup>
                    <Label>Tagline del inicio</Label>
                    <Textarea
                        name="tagline"
                        value={currentForm.tagline}
                        onChange={handleChange}
                        placeholder="La radio de General Alvear que te acompaña..."
                    />
                </FieldGroup>
                <FieldGroup>
                    <Label>Título de la programación</Label>
                    <Input
                        type="text"
                        name="scheduleTitle"
                        value={currentForm.scheduleTitle}
                        onChange={handleChange}
                        placeholder="Programación 2026"
                    />
                </FieldGroup>

                {error && <ErrorMessage role="alert">Error: {error}</ErrorMessage>}

                <Actions>
                    <GreenButton type="submit" disabled={saving}>
                        {saving ? "Guardando..." : "Guardar cambios"}
                    </GreenButton>
                    {savedFeedback && <SuccessFeedback>Guardado ✓</SuccessFeedback>}
                </Actions>
            </Form>
        </Section>
    );
}