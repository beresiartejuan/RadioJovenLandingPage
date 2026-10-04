import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
  :root {
    /* Colores principales */
    --color-primary: #0f4c4c;
    --color-primary-light: #156666;
    --color-primary-dark: #093636;
    --color-accent: #ff7a33;
    --color-accent-light: #ff9a66;
    --color-accent-dark: #e05f1f;
    --color-sun: #ffd166;

    /* Neutros */
    --color-bg: #f8f7f4;
    --color-surface: #ffffff;
    --color-surface-elevated: #ffffff;
    --color-text: #1a1a1a;
    --color-text-secondary: #5a5a5a;
    --color-text-muted: #8a8a8a;
    --color-border: #e8e6e1;

    /* Estados */
    --color-success: #22c55e;
    --color-error: #ef4444;
    --color-info: #3b82f6;

    /* Tipografía */
    --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
      "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    --font-display: "Inter", var(--font-sans);

    /* Espaciado */
    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 1.5rem;
    --space-xl: 2rem;
    --space-2xl: 3rem;
    --space-3xl: 5rem;

    /* Radios */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 9999px;

    /* Sombras */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 8px 30px rgba(0, 0, 0, 0.08);
    --shadow-xl: 0 20px 50px rgba(0, 0, 0, 0.1);
    --shadow-accent: 0 8px 24px rgba(255, 122, 51, 0.25);

    /* Transiciones */
    --transition-fast: 150ms ease;
    --transition-base: 250ms ease;
    --transition-slow: 350ms ease;

    /* Layout */
    --container-max: 1200px;
    --navbar-height: 72px;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    margin: 0;
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.6;
    color: var(--color-text);
    background-color: var(--color-bg);
    min-height: 100vh;
  }

  h1, h2, h3, h4, h5, h6, p {
    margin: 0;
  }

  h1, h2, h3 {
    font-family: var(--font-display);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  img {
    max-width: 100%;
    display: block;
  }

  /* Utilidades comunes */
  .container {
    width: 100%;
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 0 var(--space-lg);
  }

  @media (min-width: 768px) {
    .container {
      padding: 0 var(--space-2xl);
    }
  }
`;

export default GlobalStyles;
