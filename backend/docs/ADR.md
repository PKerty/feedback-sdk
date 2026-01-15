# Architecture Decision Records (ADR) - Feedback Backend

Este documento registra las decisiones de arquitectura significativas y el diseño de datos para el backend del sistema de Feedback.

## ADR-001: Arquitectura Hexagonal (Clean Architecture)

**Estado:** Aceptado
**Fecha:** 2026-01-14

### Contexto

El sistema requiere desacoplamiento entre reglas de negocio y tecnologías.

### Decisión

Adoptar **Arquitectura Hexagonal**.

- **Dominio:** Entidades puras en TypeScript.
- **Puertos:** Interfaces (`Repository`).
- **Adaptadores:** Implementaciones (`Drizzle`, `Express`).

---

## ADR-002: Base de Datos y Diseño de Schema (SQLite)

**Estado:** Aceptado
**Fecha:** 2026-01-14

### Contexto

Necesitamos una base de datos relacional ligera, sin overhead de Docker para desarrollo, pero capaz de manejar datos estructurados complejos (configuraciones, arrays).

### Decisión

1.  **Motor:** **SQLite** (vía `better-sqlite3` con modo WAL).
2.  **ORM:** **Drizzle ORM** con `sqliteTableCreator` para "Namespacing".
3.  **Convención de Nombres:** Todas las tablas llevarán el prefijo `feedback_` para evitar colisiones.
4.  **Estrategia de Tipos (SQLite Workarounds):**
    - **UUIDs:** Se almacenan como `TEXT` (generados por aplicación).
    - **Arrays/Objetos:** Se almacenan como `TEXT` serializado en JSON (usando `mode: 'json'` de Drizzle).
    - **Fechas:** Se almacenan como `INTEGER` (Unix Timestamp) para búsquedas rápidas por rango.

### Definición de Tablas (Schema)

#### Tabla: `feedback_projects`

Responsable de la configuración, seguridad y tenencia.

| Columna           | Tipo SQL      | Notas de Diseño                                |
| :---------------- | :------------ | :--------------------------------------------- |
| `id`              | `TEXT (PK)`   | UUID v4 generado por Node.js.                  |
| `name`            | `TEXT`        | Nombre descriptivo interno.                    |
| `public_key`      | `TEXT`        | **Unique, Indexada.** Usada para Auth del SDK. |
| `secret_key`      | `TEXT`        | **Unique.** Usada para Auth del Dashboard.     |
| `allowed_origins` | `TEXT (JSON)` | Array de dominios permitidos para CORS.        |
| `theme_config`    | `TEXT (JSON)` | Objeto de configuración de colores CSS.        |
| `created_at`      | `INTEGER`     | Timestamp de creación.                         |

#### Tabla: `feedback_feedbacks`

Responsable de almacenar la actividad de usuarios (Ingesta).

| Columna       | Tipo SQL      | Notas de Diseño                                         |
| :------------ | :------------ | :------------------------------------------------------ |
| `id`          | `TEXT (PK)`   | UUID v4.                                                |
| `project_id`  | `TEXT (FK)`   | Referencia a `feedback_projects.id`. ON DELETE CASCADE. |
| `user_id`     | `TEXT`        | UUID anónimo generado por el cliente (SDK).             |
| `rating`      | `INTEGER`     | Valor numérico (validado 1-5 en Dominio).               |
| `comment`     | `TEXT`        | Opcional. Comentario del usuario.                       |
| `device_info` | `TEXT (JSON)` | Metadata (UserAgent, URL, Screen Size).                 |
| `ip_address`  | `TEXT`        | Dirección IP para auditoría y Rate Limiting.            |
| `created_at`  | `INTEGER`     | Timestamp. Ordenamiento descendente por defecto.        |

### Consecuencias

- ✅ **Integridad:** Las Foreign Keys aseguran que si se borra un proyecto, desaparecen sus feedbacks.
- ✅ **Flexibilidad:** El uso de JSON para `theme_config` permite agregar propiedades visuales futuras sin migraciones SQL.

---

## ADR-003: Estrategia de API (Collector vs. Management)

**Estado:** Aceptado
**Fecha:** 2026-01-14

### Decisión

Separación de responsabilidades en las rutas:

1.  **Collector API (SDK):** `POST /v1/feedback`.
    - Contexto inferido por `Authorization: Bearer <PUBLIC_KEY>`.
    - Respuesta mínima para reducir latencia.
2.  **Management API (Dashboard):** `GET /projects/:id/feedbacks`.
    - Contexto explícito en URL.
    - Auth vía `SECRET_KEY`.

---

## ADR-004: Seguridad (CORS Dinámico & Rate Limit)

**Estado:** Aceptado
**Fecha:** 2026-01-14

### Decisión

1.  **CORS:** Middleware personalizado. Consulta `allowed_origins` en DB basándose en la Public Key del request.
2.  **Rate Limit:** Límite de peticiones por IP en endpoint de ingesta.
3.  **Validación:**
    - **Zod:** Valida tipos de entrada (Input Validation).
    - **Dominio:** Valida reglas de negocio (Business Invariants).

---

## ADR-005: Manejo de Errores Semánticos

**Estado:** Aceptado
**Fecha:** 2026-01-14

### Decisión

Mapeo estricto de Errores de Dominio a HTTP Status Codes.

| Clase de Error (Dominio) | HTTP Status               | Causa                                  |
| :----------------------- | :------------------------ | :------------------------------------- |
| `BusinessRuleViolation`  | **400** Bad Request       | Datos inválidos (ej. Rating 6).        |
| `ProjectNotFound`        | **404** Not Found         | ID o Key inexistente.                  |
| `InvalidOrigin`          | **403** Forbidden         | CORS rechazado (dominio no permitido). |
| `RateLimitExceeded`      | **429** Too Many Requests | Exceso de intentos por IP.             |
| `Error` (Genérico)       | **500** Server Error      | Fallo no controlado.                   |
