import type { Feedback, SDKConfig } from "../domain/feedback";
import { FeedbackSchema } from "../domain/validation";
import type { FeedbackRepository, UserStorage } from "../domain/ports";
import * as v from "valibot";

export class SubmitFeedbackUseCase {
    private readonly repository: FeedbackRepository;
    private readonly storage: UserStorage;
    private readonly config: SDKConfig;
    constructor(repository: FeedbackRepository, storage: UserStorage, config: SDKConfig) {
        this.repository = repository;
        this.storage = storage;
        this.config = config;
    }

    async execute(rating: number, comment: string): Promise<Feedback> {
        // 1. Regla de Negocio: Rate Limiting
        if (this.storage.isRateLimited(2 * 60 * 1000)) {
            // 2 min hardcoded por regla de negocio
            throw new Error("RATE_LIMIT_EXCEEDED");
        }

        // 2. Construcción de la Entidad
        const rawFeedback = {
            projectId: this.config.projectId,
            userId: this.storage.getUserId(),
            rating,
            comment,
            deviceInfo: {
                userAgent: navigator.userAgent,
                url: window.location.href,
            },
            timestamp: new Date().toISOString(),
        };

        // 3. Validación de Dominio (Valibot)
        const result = v.safeParse(FeedbackSchema, rawFeedback);
        if (!result.success) {
            console.error(result.issues);
            throw new Error("VALIDATION_ERROR");
        }

        // 4. Envío a través del Puerto (No sabemos si es Fetch o Axios)
        const endpoint = this.config.apiEndpoint || "https://api.default.com/feedback";
        await this.repository.send(result.output as Feedback, endpoint, this.config.apiKey);

        // 5. Registrar éxito
        this.storage.recordSubmission();

        return result.output;
    }
}
