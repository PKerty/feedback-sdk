import type { Feedback } from "./feedback";

// Puerto de Salida (Secondary Port): Para guardar datos
export interface FeedbackRepository {
	send(feedback: Feedback, endpoint: string, apiKey: string): Promise<void>;
}

// Puerto de Salida (Secondary Port): Para persistencia local
export interface UserStorage {
	getUserId(): string;
	isRateLimited(cooldownMs: number): boolean;
	recordSubmission(): void;
}
