export default function ClimaWidget() {
    return (
        <div>
            <h4 style={{ marginBottom: "1rem", color: "var(--color-text)", fontWeight: 700 }}>🌤️ Clima en General Alvear</h4>
            <iframe
                src="https://api.wo-cloud.com/content/widget/?geoObjectKey=36528403&language=es&region=AR&timeFormat=HH:mm&windUnit=kmh&systemOfMeasurement=metric&temperatureUnit=celsius"
                name="CW2"
                scrolling="no"
                width="290"
                height="318"
                frameBorder="0"
                style={{ borderRadius: "12px", maxWidth: "100%", width: "100%" }}
            ></iframe>
        </div>
    );
}
