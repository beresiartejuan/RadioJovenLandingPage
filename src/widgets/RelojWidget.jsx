export default function RelojWidget() {
    return (
        <div>
            <h4 style={{ marginBottom: "1rem", color: "var(--color-text)", fontWeight: 700 }}>
                🕐 Hora local
            </h4>
            <h3 style={{ fontSize: "1.1rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
                General Alvear, Argentina
            </h3>
            <iframe
                src="https://www.zeitverschiebung.net/clock-widget-iframe-v2?language=es&size=medium&timezone=America%2FArgentina%2FMendoza"
                width="100%"
                height="115"
                frameBorder="0"
                seamless
                style={{ borderRadius: "12px", maxWidth: "100%", display: "block" }}
            ></iframe>
        </div>
    );
}
