import styled from "styled-components";

export const RowGroup = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  gap: 1rem;
`;

export const GreenButton = styled.button`
  background-color: var(--color-primary);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    background-color: var(--color-primary-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active:not(:disabled) {
    background-color: var(--color-primary-dark);
    transform: translateY(0);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(15, 76, 76, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CustomButton = styled.button`
  background-color: ${({ color }) => (color ? color : "var(--color-primary)")};
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.15);
  }
`;

export const PublishedButton = styled.button`
  background-color: ${({ isPrimary }) => (isPrimary ? "var(--color-accent)" : "#6b7280")};
  color: #fff;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-base);

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${({ isPrimary }) => (isPrimary ? "rgba(255, 122, 51, 0.3)" : "rgba(107, 114, 128, 0.3)")};
  }
`;

export const Section = styled.section`
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: var(--space-xl);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
`;

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-sm);
  border-bottom: 2px solid var(--color-accent);
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
`;

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
`;

export const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-secondary);
`;

export const Input = styled.input`
  padding: 0.85rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  background-color: var(--color-surface);
  color: var(--color-text);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

  &:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(255, 122, 51, 0.15);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

export const Textarea = styled.textarea`
  padding: 0.85rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  background-color: var(--color-surface);
  color: var(--color-text);
  resize: vertical;
  min-height: 120px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

  &:focus {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(255, 122, 51, 0.15);
  }

  &::placeholder {
    color: var(--color-text-muted);
  }
`;

export const FileInput = styled.input`
  font-size: 1rem;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  cursor: pointer;
  transition: border-color var(--transition-fast);

  &:focus {
    border-color: var(--color-accent);
  }
`;

export const ErrorMessage = styled.div`
  display: block;
  color: #991b1b;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  text-align: center;
  margin-top: var(--space-sm);
`;

export const LoadingMessage = styled.div`
  display: block;
  color: #155e75;
  background-color: #e0f2fe;
  border: 1px solid #bae6fd;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border-radius: var(--radius-md);
  text-align: center;
  margin-top: var(--space-sm);
`;

/* Componentes de layout reutilizables */

export const PageContainer = styled.main`
  min-height: calc(100vh - var(--navbar-height));
  padding: var(--space-xl) 0 var(--space-3xl);
`;

export const Card = styled.article`
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: transform var(--transition-base), box-shadow var(--transition-base);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
`;

export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  border-radius: var(--radius-full);
  background-color: ${({ variant }) => {
    switch (variant) {
      case "success":
        return "rgba(34, 197, 94, 0.12)";
      case "error":
        return "rgba(239, 68, 68, 0.12)";
      case "warning":
        return "rgba(255, 209, 102, 0.25)";
      default:
        return "rgba(15, 76, 76, 0.1)";
    }
  }};
  color: ${({ variant }) => {
    switch (variant) {
      case "success":
        return "#166534";
      case "error":
        return "#991b1b";
      case "warning":
        return "#92400e";
      default:
        return "var(--color-primary)";
    }
  }};
`;
