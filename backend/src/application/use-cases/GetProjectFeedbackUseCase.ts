import { IFeedbackRepository } from "../../domain/repositories/IFeedbackRepository";
import { IProjectRepository } from "../../domain/repositories/IProjectRepository";
import { ProjectNotFound } from "../../domain/errors";
import { Feedback } from "../../domain/entities/Feedback";

export class GetProjectFeedbacksUseCase {
	constructor(
		private projectRepository: IProjectRepository,
		private feedbackRepository: IFeedbackRepository,
	) {}

	async execute(projectId: string): Promise<Feedback[]> {
		// 1. Verificar que el proyecto exista antes de buscar (Buena práctica)
		const project = await this.projectRepository.findById(projectId);

		if (!project) {
			throw new ProjectNotFound(projectId);
		}

		// 2. Obtener feedbacks
		return this.feedbackRepository.findByProjectId(projectId);
	}
}
