import { z } from "zod";

export const submitFeedbackSchema = z.object({
	rating: z.number().int().min(1).max(5), // Validación redundante con dominio, pero buena para "Fail Fast"
	comment: z.string().optional(),
	deviceInfo: z
		.object({
			userAgent: z.string(),
			screenSize: z.string().optional(),
			url: z.string().optional(),
		})
		.passthrough(), // Permite otras propiedades extra
});
