import { Feedback } from "../entities/Feedback";

export interface IFeedbackRepository {
	save(feedback: Feedback): Promise<void>;
	findByProjectId(projectId: string): Promise<Feedback[]>;
}
