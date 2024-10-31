export default function RadioWidget() {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: "0 1.5rem", maxWidth: "1000px", margin: "5vh auto" }}>
            <img
                style={{ width: '70px' }}
                src="https://radiojovenmendoza.com/wp-content/uploads/2024/09/WhatsApp-Image-2024-08-29-at-11.48.54-AM-fotor-20240912125422-e1726156562129.png"
                alt=""
            />
            <audio id="stream" controls style={{ width: '80%', marginLeft: '20px' }}>
                <source src="https://sc.host-live.com/8222/stream" type="audio/mpeg" />
            </audio>
        </div>

    )
}