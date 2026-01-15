import * as v from "valibot";

// Esquema de Configuración
export const ConfigSchema = v.object({
    projectId: v.pipe(v.string(), v.minLength(1, "Project ID es requerido")),
    apiKey: v.pipe(v.string(), v.minLength(1, "API Key es requerida")),
    apiEndpoint: v.optional(v.pipe(v.string(), v.url("Debe ser una URL válida"))),
    locale: v.optional(v.union([v.literal("en"), v.literal("es")])), // Optional, default set in code

    // Tema para personalización
    theme: v.optional(
        v.object({
            primaryColor: v.optional(v.string()),
            backgroundColor: v.optional(v.string()),
            textColor: v.optional(v.string()),
            borderColor: v.optional(v.string()),
            inputBackgroundColor: v.optional(v.string()),
        })
    ),

    // Opciones para desarrolladores
    debug: v.optional(v.boolean()), // Habilita logs de debug
    onSuccess: v.optional(v.function()), // Callback en éxito: (feedback) => void
    onError: v.optional(v.function()), // Callback en error: (error) => void
});

// Esquema del Payload (Feedback)
export const FeedbackSchema = v.object({
    projectId: v.string(),
    userId: v.string(),

    // Rating: pipe(number, integer, min, max)
    rating: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),

    // Comentario: opcional -> pipe(string, max)
    comment: v.optional(v.pipe(v.string(), v.maxLength(1000, "El comentario es muy largo"))),

    deviceInfo: v.object({
        userAgent: v.string(),
        url: v.string(),
    }),

    timestamp: v.string(), // ISO Date
});

// Tipos inferidos
export type SDKConfig = v.InferOutput<typeof ConfigSchema> & { locale: "en" | "es" }; // locale is always set
export type FeedbackPayload = v.InferOutput<typeof FeedbackSchema>;
