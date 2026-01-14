# Architecture Decision Records (ADR) - Feedback SDK

**Proyecto:** Feedback SDK Embeddable
**Estado:** Propuesto / En Desarrollo
**Fecha:** Enero 2026

## 1. Contexto del Proyecto

El objetivo es construir un widget ("burbuja") de feedback que pueda ser incrustado en cualquier sitio web de terceros.
**Restricciones Clave:**

- **Agnosticismo:** Debe funcionar en React, Vue, Angular o HTML plano.
- **Performance:** El peso del bundle debe ser mínimo (Target: <10kb gzipped).
- **Aislamiento:** No debe heredar estilos del sitio huésped ni romperlos.
- **Resiliencia:** Debe manejar fallos de red básicos sin frustrar al usuario.

---

## 2. Resumen de Decisiones

| ID          | Área             | Decisión                         | Alternativas Descartadas     | Motivo Principal                                                                                   |
| :---------- | :--------------- | :------------------------------- | :--------------------------- | :------------------------------------------------------------------------------------------------- |
| **ADR-001** | **Core UI**      | **Shadow DOM (Open Mode)**       | Iframe, Direct DOM Injection | Aislamiento total de estilos (CSS Sandbox) sin el peso de un Iframe.                               |
| **ADR-002** | **Lenguaje**     | **Vanilla TS (Sin Frameworks)**  | React, Vue, Svelte, Preact   | Eliminar overhead de runtime. Evitar conflictos de versiones con el host.                          |
| **ADR-003** | **Validación**   | **Valibot**                      | Zod, Joi, Manual regex       | Zod es muy pesado (12kb). Valibot ofrece la misma seguridad con Tree-shaking (~1kb).               |
| **ADR-004** | **Assets**       | **Inline SVGs**                  | FontAwesome, Unicode, PNGs   | Unicode es inconsistente entre OS. Las fuentes externas son pesadas y bloqueantes.                 |
| **ADR-005** | **Arquitectura** | **Hexagonal (Ports & Adapters)** | MVC, Spaghetti Code          | Desacoplar la lógica de negocio del DOM y Fetch para facilitar testing y mantenimiento.            |
| **ADR-006** | **Red**          | **Retry + Exponential Backoff**  | Offline Queue (IndexedDB)    | Complejidad de DB local es innecesaria para un MVP. Backoff soluciona el 90% de fallos temporales. |
| **ADR-007** | **Estilos**      | **CSS Variables + Fallbacks**    | CSS-in-JS, Sass              | Permite al cliente personalizar colores (Theming) traspasando el Shadow Boundary.                  |

---

## 3. Detalle de Decisiones Críticas

### ADR-001: Uso de Shadow DOM

- **Decisión:** Encapsular todo el widget dentro de `element.attachShadow({ mode: 'open' })`.
- **Consecuencias Positivas:** Garantiza que `div { color: red }` en el sitio del cliente no afecte a nuestro widget.
- **Trade-offs:** La personalización externa es más difícil; requiere exponer explícitamente variables CSS o partes del componente.

### ADR-003: Validación con Valibot

- **Contexto:** Necesitamos validar que el `rating` sea 1-5 y el `projectId` exista antes de enviar datos a la API, para proteger el backend de datos corruptos.
- **Decisión:** Usar `valibot` debido a su arquitectura modular.
- **Impacto en Bundle:** Ahorro significativo (~10kb) comparado con Zod, manteniendo una DX (Experiencia de desarrollo) similar con inferencia de tipos TypeScript.

### ADR-005: Arquitectura Hexagonal

- **Estructura:**
  - `Domain`: Entidades y Reglas (e.j. Rate limiting, Schema).
  - `Application`: Casos de uso (e.j. `SubmitFeedback`).
  - `Infrastructure`: Implementaciones (DOM, Fetch, LocalStorage).
- **Justificación:** Permite cambiar la librería de UI o el método de persistencia (ej. cambiar LocalStorage por SessionStorage) sin tocar la lógica de negocio. Facilita los Tests Unitarios sin necesidad de un navegador real (JSDOM).

### ADR-006: Estrategia de Resiliencia (Red)

- **Problema:** Los usuarios móviles a menudo tienen micro-cortes de conexión.
- **Solución:** Implementar un wrapper sobre `fetch` que reintenta 3 veces con espera exponencial (1s, 2s, 4s) ante errores 5xx.
- **UX:** Si falla tras los reintentos, se muestra una vista de error dedicada con botón "Reintentar" (preservando los datos del formulario en memoria), en lugar de un simple `alert()`.

---

## 4. Notas de Seguridad

- **API Key:** La clave utilizada en el frontend es **Pública**. Solo tiene permisos de escritura (POST).
- **Anti-Spam:** Se implementa un "Rate Limit" optimista en el cliente (LocalStorage) para prevenir envíos accidentales, complementado con Rate Limiting real por IP en el backend.
