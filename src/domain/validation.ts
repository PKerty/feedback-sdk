import * as v from "valibot";

// Esquema de Configuración
export const ConfigSchema = v.object({
	projectId: v.pipe(v.string(), v.minLength(1, "Project ID es requerido")),
	apiKey: v.pipe(v.string(), v.minLength(1, "API Key es requerida")),
	apiEndpoint: v.optional(v.pipe(v.string(), v.url("Debe ser una URL válida"))),

	// AQUÍ ESTÁ EL CAMBIO: Agregamos todos los campos del tema
	theme: v.optional(
		v.object({
			primaryColor: v.optional(v.string()),
			backgroundColor: v.optional(v.string()), // <-- Nuevo
			textColor: v.optional(v.string()), // <-- Nuevo
			borderColor: v.optional(v.string()), // <-- Nuevo
			inputBackgroundColor: v.optional(v.string()), // <-- Nuevo
		}),
	),
});

// Esquema del Payload (Feedback)
export const FeedbackSchema = v.object({
	projectId: v.string(),
	userId: v.string(),

	// Rating: pipe(number, integer, min, max)
	rating: v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(5)),

	// Comentario: opcional -> pipe(string, max)
	comment: v.optional(
		v.pipe(v.string(), v.maxLength(1000, "El comentario es muy largo")),
	),

	deviceInfo: v.object({
		userAgent: v.string(),
		url: v.string(),
	}),

	timestamp: v.string(), // ISO Date
});

// Tipos inferidos
export type SDKConfig = v.InferOutput<typeof ConfigSchema>;
export type FeedbackPayload = v.InferOutput<typeof FeedbackSchema>;
