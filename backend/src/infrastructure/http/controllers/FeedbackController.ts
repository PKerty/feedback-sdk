import { Request, Response, NextFunction } from "express";
import { SubmitFeedbackUseCase } from "../../../application/use-cases/SubmitFeedbackUseCase";
import { GetProjectFeedbacksUseCase } from "../../../application/use-cases/GetProjectFeedbackUseCase";
import { submitFeedbackSchema } from "../schemas/feedbackSchema";

export class FeedbackController {
	constructor(
		private submitUseCase: SubmitFeedbackUseCase,
		private getFeedbacksUseCase: GetProjectFeedbacksUseCase,
	) {}

	// POST /v1/feedback (Collector API)
	async submit(req: Request, res: Response, next: NextFunction) {
		try {
			// 1. Extraer Public Key del Header (Authorization: Bearer <KEY>)
			const authHeader = req.headers.authorization;
			if (!authHeader || !authHeader.startsWith("Bearer ")) {
				res
					.status(401)
					.json({ error: "Missing or invalid Authorization header" });
				return;
			}
			const publicKey = authHeader.split(" ")[1];

			// 2. Validar Body con Zod
			const body = submitFeedbackSchema.parse(req.body);

			// 3. Extraer Metadata
			const userIp = req.ip || req.socket.remoteAddress || "unknown";
			const origin = req.headers.origin || "";

			// 4. Ejecutar Caso de Uso
			await this.submitUseCase.execute({
				projectPublicKey: publicKey,
				rating: body.rating,
				comment: body.comment,
				deviceInfo: body.deviceInfo,
				ipAddress: userIp,
				origin: origin,
			});

			// 5. Respuesta
			res.status(201).json({ success: true });
		} catch (error) {
			next(error); // Pasa el error al middleware errorHandler
		}
	}

	// GET /projects/:projectId/feedbacks (Management API)
	async getByProject(req: Request, res: Response, next: NextFunction) {
		try {
			const projectId = req.params.projectId as string;

			// TODO: Aquí deberíamos validar la SECRET_KEY según ADR-003,
			// pero por ahora lo dejamos abierto o lo simulamos.

			const feedbacks = await this.getFeedbacksUseCase.execute(projectId);
			res.json(feedbacks);
		} catch (error) {
			next(error);
		}
	}
}
