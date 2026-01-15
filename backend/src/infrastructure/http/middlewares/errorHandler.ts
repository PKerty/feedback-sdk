import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
	BusinessRuleViolation,
	ProjectNotFound,
	InvalidOrigin,
} from "../../../domain/errors";

export function errorHandler(
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) {
	console.error(`[Error] ${err.name}: ${err.message}`);

	// 1. Errores de Validación (Zod) -> 400 Bad Request
	if (err instanceof ZodError) {
		res.status(400).json({
			error: "Validation Error",
			details: err.issues,
		});
		return;
	}

	// 2. Errores de Dominio (Mapeo según ADR-005)
	if (err instanceof BusinessRuleViolation) {
		res.status(400).json({ error: err.message });
		return;
	}

	if (err instanceof ProjectNotFound) {
		res.status(404).json({ error: err.message });
		return;
	}

	if (err instanceof InvalidOrigin) {
		res.status(403).json({ error: "Origin not allowed" }); // Mensaje genérico por seguridad
		return;
	}

	// 3. Error desconocido -> 500 Internal Server Error
	res.status(500).json({ error: "Internal Server Error" });
}
