// styles.ts updates
export const componentStyles = `
  /* ... estilos anteriores ... */

  /* Clases de utilidad para cambiar vistas */
  .view-section {
    transition: opacity 0.2s ease-in-out;
  }
  
  .hidden {
    display: none !important;
  }

  /* Estilos de la vista de error */
  .error-view {
    text-align: center;
    padding: 20px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .error-title {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin: 0;
  }

  .error-desc {
    font-size: 14px;
    color: #666;
    margin: 0;
  }

  .retry-btn {
    background-color: #333;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }
  
  .cancel-link {
    background: none;
    border: none;
    color: #999;
    text-decoration: underline;
    cursor: pointer;
    font-size: 12px;
  }
`;
