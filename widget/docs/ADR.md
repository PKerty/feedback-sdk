# Architecture Decision Records (ADR) - Feedback SDK

**Proyecto:** Feedback SDK Embeddable
**Estado:** Completado / En Producción
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
| **ADR-008** | **UX Feedback**  | **In-Widget UI Views**           | Browser Alerts, Toasts       | Mejor UX sin popups disruptivos; usa esquema de colores para consistencia.                        |
| **ADR-009** | **DX Herramientas** | **Debug + Callbacks**         | Console Only, Events         | Facilita debugging y control programático para desarrolladores.                                    |
| **ADR-010**| **Control Modal**| **Usuario Exclusivo**            | Auto-Close, Dev Override     | Da control total al usuario; devs manejan estado via callbacks.                                     |
| **ADR-011**| **Testing**      | **Vitest + 90% Coverage**        | Jest, Manual Tests           | Asegura calidad y facilidad de refactorización en arquitectura hexagonal.                           |
| **ADR-012**| **i18n**         | **i18next-lite + Schema Default**| Manual Maps, No Defaults    | Internacionalización ligera con fallback automático a inglés.                                       |
| **ADR-013**| **Linting**      | **ESLint Stricter Rules**        | Basic Rules, Manual         | Mejora calidad de código con naming, complexity, y auto-fixes.                                       |

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

### ADR-008: Mecanismo de Feedback en UI

- **Contexto:** Los usuarios necesitan confirmación clara de envío exitoso o errores, sin popups disruptivos que rompan la experiencia.
- **Decisión:** Implementar vistas dedicadas dentro del widget (éxito con check verde, rate-limit con warning naranja, error con ícono rojo), usando variables CSS del esquema de colores.
- **Consecuencias Positivas:** UX mejorada, consistente con theming; mensajes concisos distinguen errores de usuario (rate-limit) vs. sistema (red).
- **Trade-offs:** Aumenta complejidad del componente UI; requiere testing adicional para transiciones.

### ADR-009: Herramientas para Desarrolladores

- **Contexto:** Desarrolladores necesitan debuggear errores y controlar el estado del widget programáticamente.
- **Decisión:** Agregar opción `debug` para logging de errores en consola, y callbacks `onSuccess`/`onError` para manejar eventos.
- **Consecuencias Positivas:** Mejora DX; permite integraciones personalizadas (e.g., cerrar widget en éxito).
- **Trade-offs:** Aumenta superficie de API; requiere documentación clara.

### ADR-010: Control del Modal

- **Contexto:** El modal debe ser controlado por el usuario para evitar interrupciones inesperadas.
- **Decisión:** No auto-cerrar el modal; apertura/cierre solo por usuario; devs usan callbacks para acciones post-evento.
- **Consecuencias Positivas:** Respeta autonomía del usuario; devs tienen flexibilidad total.
- **Trade-offs:** Requiere devs implementar lógica de cierre; no hay "auto-magic".

### ADR-011: Estrategia de Testing

- **Contexto:** El SDK debe ser confiable y fácil de mantener, especialmente en arquitectura hexagonal.
- **Decisión:** Suite completa con Vitest (unit/integration), jsdom para DOM, cobertura 90%+, enfocada en paths críticos de DX (validación, theming, reintentos).
- **Consecuencias Positivas:** Detecta regresiones temprano; facilita refactors; cubre 96% actual con 37 tests.
- **Trade-offs:** Overhead de mantenimiento de tests; requiere jsdom para UI, pero vale la calidad.

### ADR-012: Internacionalización (i18n)

- **Contexto:** El SDK debe ser usable globalmente sin asumir inglés como único idioma.
- **Decisión:** Implementar i18n con i18next-lite (~0.5kb), traducciones en/es completas, fallback estricto a inglés, configuración opcional con default "en" en esquema.
- **Consecuencias Positivas:** Soporte multiidioma ligero; mensajes localizados en UI; extensible a más idiomas.
- **Trade-offs:** Aumento mínimo de bundle (~0.5kb); requiere mantenimiento de traducciones, pero mejora accesibilidad global.

### ADR-013: Linting Estricto

- **Contexto:** El código debe ser consistente y de alta calidad para mantenimiento a largo plazo.
- **Decisión:** ESLint con reglas estrictas (naming conventions, complexity, no unused vars), auto-fixes, y overrides para tests.
- **Consecuencias Positivas:** Previene bugs comunes; enforces camelCase, limites de complejidad; facilita contribuciones.
- **Trade-offs:** Más reglas iniciales pueden ralentizar desarrollo, pero long-term beneficios en calidad.

---

## 4. Notas de Seguridad

- **API Key:** La clave utilizada en el frontend es **Pública**. Solo tiene permisos de escritura (POST).
- **Anti-Spam:** Se implementa un "Rate Limit" optimista en el cliente (LocalStorage) para prevenir envíos accidentales, complementado con Rate Limiting real por IP en el backend.
