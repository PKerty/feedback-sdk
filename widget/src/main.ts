import * as v from "valibot";
import { ConfigSchema } from "./domain/validation";
import { FetchFeedbackRepository } from "./infrastructure/http/fetchAdapter";
import { LocalUserStorageAdapter } from "./infrastructure/storage/userAdapter";
import { SubmitFeedbackUseCase } from "./application/submitFeedback";
import { FeedbackWidget } from "./infrastructure/ui/widget";

class FeedbackSDK {
    static init(rawConfig: unknown): void {
        // 1. Validar Configuración (Fail Fast)
        const configResult = v.safeParse(ConfigSchema, rawConfig);

        if (!configResult.success) {
            console.error("[FeedbackSDK] Configuración inválida:", configResult.issues);
            return;
        }
        const config = configResult.output;
        config.locale = config.locale || "en"; // Set default locale

        // 2. Instanciar Adaptadores (Infrastructure)
        const repository = new FetchFeedbackRepository();
        const storage = new LocalUserStorageAdapter();

        // 3. Instanciar Caso de Uso (Application)
        // Inyección de dependencias manual
        const submitUseCase = new SubmitFeedbackUseCase(repository, storage, config);

        // 4. Iniciar UI (Infrastructure - Driving)
        const widget = new FeedbackWidget(submitUseCase, config as typeof config & { locale: "en" | "es" });
        widget.init();

        console.log("[FeedbackSDK] Inicializado correctamente");
    }
}

// Exponer al scope global
(window as any).FeedbackSDK = FeedbackSDK;
