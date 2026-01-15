import { eq, desc } from "drizzle-orm";
import { db } from "../db";
import { feedbacks } from "../db/schema";
import { DeviceInfo, Feedback } from "../../domain/entities/Feedback";
import { IFeedbackRepository } from "../../domain/repositories/IFeedbackRepository";

export class DrizzleFeedbackRepository implements IFeedbackRepository {
	private mapToDomain(raw: typeof feedbacks.$inferSelect): Feedback {
		return new Feedback(
			raw.id,
			raw.projectId,
			raw.userId,
			raw.rating,
			raw.comment,
			raw.deviceInfo as DeviceInfo,
			raw.ipAddress,
			new Date(raw.createdAt),
		);
	}

	async save(feedback: Feedback): Promise<void> {
		db.insert(feedbacks)
			.values({
				id: feedback.id,
				projectId: feedback.projectId,
				userId: feedback.userId,
				rating: feedback.rating,
				comment: feedback.comment,
				deviceInfo: feedback.deviceInfo,
				ipAddress: feedback.ipAddress,
				createdAt: feedback.createdAt.getTime(),
			})
			.run();
	}

	async findByProjectId(projectId: string): Promise<Feedback[]> {
		const results = db
			.select()
			.from(feedbacks)
			.where(eq(feedbacks.projectId, projectId))
			.orderBy(desc(feedbacks.createdAt))
			.all(); // ADR-002: Ordenamiento descendente

		return results.map(this.mapToDomain);
	}
}
