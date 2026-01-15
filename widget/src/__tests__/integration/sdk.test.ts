import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

describe("FeedbackSDK Integration", () => {
    beforeAll(async () => {
        // Import main to set global
        await import("../../main");
    });

    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("should initialize SDK with valid config", () => {
        const config = {
            projectId: "test-project",
            apiKey: "test-key",
        };

        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        (window as any).FeedbackSDK.init(config);

        expect(consoleSpy).toHaveBeenCalledWith("[FeedbackSDK] Inicializado correctamente");
        expect(document.body.querySelector("div")).toBeTruthy(); // Widget attached

        consoleSpy.mockRestore();
    });

    it("should not initialize with invalid config", () => {
        const invalidConfig = { apiKey: "test" };

        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        (window as any).FeedbackSDK.init(invalidConfig);

        expect(consoleSpy).toHaveBeenCalledWith(
            "[FeedbackSDK] Configuración inválida:",
            expect.any(Array)
        );
        expect(document.body.querySelector("div")).toBeFalsy();

        consoleSpy.mockRestore();
    });
});
