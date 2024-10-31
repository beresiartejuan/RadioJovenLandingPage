export default function RelojWidget() {
    return (
        <div>
            <h3 style={{ fontSize: "1.5rem" }}>
                <span style={{ color: "gray" }}>Hora actual en</span><br />General Alvear, Argentina
            </h3>
            <iframe src="https://www.zeitverschiebung.net/clock-widget-iframe-v2?language=es&size=medium&timezone=America%2FArgentina%2FMendoza" width="100%" height="115" frameBorder="0" seamless></iframe>
        </div>
    )
}