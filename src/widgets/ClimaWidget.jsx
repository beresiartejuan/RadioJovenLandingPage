import { useEffect, useState } from "react";
import styled from "styled-components";

const Title = styled.h4`
  margin-bottom: var(--space-md);
  color: var(--color-text);
  font-weight: 700;
`;

const Frame = styled.iframe`
  width: 100%;
  height: 318px;
  max-width: 290px;
  border: none;
  border-radius: var(--radius-md);
`;

const WEATHER_IFRAME_SRC = "https://api.wo-cloud.com/content/widget/?geoObjectKey=36528403&language=es&region=AR&timeFormat=HH:mm&windUnit=kmh&systemOfMeasurement=metric&temperatureUnit=celsius";

// Montaje diferido del iframe: se elige requestIdleCallback (con fallback a
// setTimeout de 1500ms en navegadores sin soporte) en lugar de
// IntersectionObserver porque este widget ya es visible en el viewport del
// home al cargar; lo que buscamos es no competir por red/ancho de banda con
// el render inicial (LCP), algo que el idle callback resuelve directo.
function scheduleWhenIdle(callback) {
    if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(callback);
        return () => window.cancelIdleCallback(id);
    }
    const timeoutId = setTimeout(callback, 1500);
    return () => clearTimeout(timeoutId);
}

export default function ClimaWidget() {
    const [iframeMounted, setIframeMounted] = useState(false);

    useEffect(() => {
        return scheduleWhenIdle(() => setIframeMounted(true));
    }, []);

    return (
        <div>
            <Title>🌤️ Clima en General Alvear</Title>
            {iframeMounted && (
                <Frame
                    src={WEATHER_IFRAME_SRC}
                    loading="lazy"
                    title="Clima en General Alvear"
                    name="CW2"
                    scrolling="no"
                />
            )}
        </div>
    );
}