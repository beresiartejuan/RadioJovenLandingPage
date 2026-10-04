import { useEffect, useState } from "react";
import styled from "styled-components";

const ClockTitle = styled.h4`
  margin-bottom: var(--space-md);
  color: var(--color-text);
  font-weight: 700;
`;

const CityName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
`;

const TimeText = styled.p`
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--color-primary-dark);
  font-family: var(--font-display);
  margin-bottom: var(--space-sm);
  /* Dígitos de ancho fijo: el reloj no "baila" al cambiar cada segundo */
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
`;

const TimezoneHint = styled.span`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
`;

// Se crea una sola vez a nivel de módulo (formateo HH:mm:ss con hora de Cuyo).
const CLOCK_FORMATTER = new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Mendoza",
});

export default function RelojWidget() {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const intervalId = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
            <ClockTitle>🕐 Hora local</ClockTitle>
            <CityName>General Alvear, Argentina</CityName>
            <TimeText>{CLOCK_FORMATTER.format(now)}</TimeText>
            <TimezoneHint>UTC-3 · Hora de Cuyo</TimezoneHint>
        </div>
    );
}