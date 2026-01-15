import { IFeedbackRepository } from "../../domain/repositories/IFeedbackRepository";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { Feedback, DeviceInfo } from "../../domain/entities/Feedback";
import { ProjectNotFound, InvalidOrigin } from "../../domain/errors";

// DTO (Data Transfer Object): Datos puros que vienen de afuera
export interface SubmitFeedbackDTO {
	projectPublicKey: string;
	rating: number;
	comment?: string;
	deviceInfo: DeviceInfo;
	ipAddress: string;
	origin: string;
}

export class SubmitFeedbackUseCase {
	constructor(
		private projectRepository: IProjectRepository,
		private feedbackRepository: IFeedbackRepository,
	) {}

	async execute(request: SubmitFeedbackDTO): Promise<void> {
		// 1. Buscar Proyecto por Public Key (Auth implícita del Collector)
		const project = await this.projectRepository.findByPublicKey(
			request.projectPublicKey,
		);

		if (!project) {
			throw new ProjectNotFound(request.projectPublicKey);
		}

		// 2. Validar Origen (Regla de Seguridad ADR-004)
		// Delegamos la lógica a la Entidad Project
		if (!project.isOriginAllowed(request.origin)) {
			throw new InvalidOrigin(request.origin);
		}

		// 3. Crear Entidad Feedback (Validará el rating 1-5 internamente)
		const feedback = Feedback.create({
			projectId: project.id,
			userId: request.deviceInfo.userId || "anonymous", // Si no hay userId en deviceInfo, usamos 'anonymous'
			rating: request.rating,
			comment: request.comment || null,
			deviceInfo: request.deviceInfo,
			ipAddress: request.ipAddress,
		});

		// 4. Persistir
		await this.feedbackRepository.save(feedback);
	}
}
