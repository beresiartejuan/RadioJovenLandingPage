import styled from "styled-components";

const WidgetContainer = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: stretch;
  gap: var(--space-xl);
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-lg);

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    border: 1px solid var(--color-border);
    padding: var(--space-lg);
    text-align: center;
    overflow: hidden;
    transition: transform var(--transition-base), box-shadow var(--transition-base);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    iframe {
      border-radius: var(--radius-md);
      max-width: 100%;
      width: 100%;
    }

    img {
      border-radius: var(--radius-md);
      width: 100%;
      max-height: 320px;
      object-fit: contain;
    }

    &.ad {
      padding: 0;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        max-height: none;
        object-fit: cover;
        border-radius: var(--radius-lg);
      }
    }
  }

  @media (min-width: 768px) {
    padding: 0 var(--space-2xl);
    gap: var(--space-2xl);
  }
`;

export default WidgetContainer;
