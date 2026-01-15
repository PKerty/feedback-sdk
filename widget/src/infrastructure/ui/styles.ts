// styles.ts updates

export const componentStyles = `
  .widget-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
    
    /* DEFINICIÓN DE VARIABLES (Valores por defecto Light Mode) */
    --fdbk-bg: #ffffff;
    --fdbk-text: #1f2937;
    --fdbk-text-secondary: #6b7280;
    --fdbk-border: #e5e7eb;
    --fdbk-input-bg: #ffffff;
    --fdbk-hover: #f3f4f6;
  }

  .trigger-btn {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    /* Ahora usamos variable para el primario */
    background-color: var(--fdbk-primary, #2563eb);
    color: white; /* El icono siempre blanco en el botón de color */
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
  }

  .trigger-btn:hover { transform: scale(1.05); }
  .trigger-btn svg { width: 28px; height: 28px; }

  .modal {
    display: none;
    /* Variables de fondo y texto */
    background: var(--fdbk-bg); 
    color: var(--fdbk-text);
    width: 300px;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2); /* Sombra un poco más fuerte */
    border: 1px solid var(--fdbk-border);
    animation: fadeUp 0.2s ease-out forwards;
  }

  .modal.open { display: block; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  h3 {
    margin: 0 0 12px 0;
    font-size: 18px;
    color: var(--fdbk-text); /* Título dinámico */
    font-weight: 600;
  }

  .stars {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
    justify-content: center;
  }

  .star {
    cursor: pointer;
    color: var(--fdbk-border); /* Estrella vacía */
    transition: color 0.15s;
    font-size: 0;
  }
  
  .star svg { width: 32px; height: 32px; }
  .star.active { color: #fbbf24; /* Amarillo siempre */ }

  textarea {
    width: 100%;
    height: 80px;
    /* Variables de input */
    background-color: var(--fdbk-input-bg);
    color: var(--fdbk-text);
    border: 1px solid var(--fdbk-border);
    border-radius: 8px;
    padding: 10px;
    font-family: inherit;
    resize: none;
    margin-bottom: 12px;
    box-sizing: border-box;
    outline: none;
  }

  textarea:focus {
    border-color: var(--fdbk-primary, #2563eb);
    ring: 1px solid var(--fdbk-primary, #2563eb);
  }

  .submit-btn {
    width: 100%;
    /* Botón de acción: Usamos el color de texto invertido o primario */
    background-color: var(--fdbk-text); 
    color: var(--fdbk-bg);
    border: 1px solid var(--fdbk-border);
    padding: 10px;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
  }
  
  .submit-btn:hover { opacity: 0.9; }
  .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  /* Vistas de estados */
  .hidden { display: none !important; }
  .success-view { text-align: center; padding: 20px 0; color: var(--fdbk-primary, #10b981); }
  .success-view p { color: var(--fdbk-text); margin: 10px 0 20px 0; }

  .rate-limit-view { text-align: center; padding: 20px 0; color: var(--fdbk-text-secondary, #f59e0b); }
  .rate-limit-view p { color: var(--fdbk-text); margin: 10px 0 20px 0; }

  .error-view { text-align: center; padding: 20px 0; color: #ef4444; }
  .error-view p { color: var(--fdbk-text-secondary); margin: 10px 0 20px 0; }

  .retry-btn {
    background: var(--fdbk-text);
    color: var(--fdbk-bg);
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .cancel-link {
    background: transparent;
    border: none;
    color: var(--fdbk-text-secondary);
    text-decoration: underline;
    cursor: pointer;
    margin-top: 10px;
    display: block;
    width: 100%;
  }
`;
