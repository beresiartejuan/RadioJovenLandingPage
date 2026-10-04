import styled from "styled-components";

const Player = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  max-width: var(--container-max);
  margin: var(--space-2xl) auto;
  padding: var(--space-lg) var(--space-xl);
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  color: #fff;

  img {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid var(--color-accent);
    box-shadow: 0 0 0 4px rgba(255, 122, 51, 0.2);
    flex-shrink: 0;
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    flex: 1;
    min-width: 0;

    strong {
      font-size: 1.25rem;
      font-weight: 800;
    }

    span {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  audio {
    flex: 2;
    min-width: 0;
    max-width: 500px;
    width: 100%;
    height: 44px;
    accent-color: var(--color-accent);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    margin: var(--space-xl) auto;
    padding: var(--space-lg);

    img {
      width: 64px;
      height: 64px;
    }

    .info {
      align-items: center;
    }

    audio {
      flex: none;
      max-width: 100%;
      min-width: 260px;
    }
  }
`;

// eslint-disable-next-line react/prop-types
export default function RadioWidget({ streamUrl }) {
    const source = streamUrl || "https://sc.host-live.com/8222/stream";

    return (
        <Player>
            <img
                src="https://radiojovenmendoza.com/wp-content/uploads/2024/09/WhatsApp-Image-2024-08-29-at-11.48.54-AM-fotor-20240912125422-e1726156562129.png"
                alt="Radio Joven Mendoza"
            />
            <div className="info">
                <strong>Escuchanos en vivo</strong>
                <span>Radio Joven Mendoza · General Alvear</span>
            </div>
            <audio id="stream" controls preload="none">
                <source src={source} type="audio/mpeg" />
            </audio>
        </Player>
    );
}
