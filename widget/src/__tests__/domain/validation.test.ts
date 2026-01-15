import { describe, it, expect } from "vitest";
import * as v from "valibot";
import { ConfigSchema, FeedbackSchema } from "../../domain/validation";

describe("ConfigSchema", () => {
    it("should validate a valid config", () => {
        const validConfig = {
            projectId: "test-project",
            apiKey: "test-key",
            theme: {
                primaryColor: "#ff0000",
                backgroundColor: "#ffffff",
            },
        };

        const result = v.safeParse(ConfigSchema, validConfig);
        expect(result.success).toBe(true);
        expect(result.output).toEqual(validConfig);
    });

    it("should reject missing required fields", () => {
        const invalidConfig = { apiKey: "test" };

        const result = v.safeParse(ConfigSchema, invalidConfig);
        expect(result.success).toBe(false);
        expect(result.issues).toBeDefined();
        expect(result.issues![0].message).toContain("projectId");
    });

    it("should reject invalid URL", () => {
        const invalidConfig = {
            projectId: "test",
            apiKey: "test",
            apiEndpoint: "not-a-url",
        };

        const result = v.safeParse(ConfigSchema, invalidConfig);
        expect(result.success).toBe(false);
        expect(result.issues).toBeDefined();
        expect(result.issues![0].message).toContain("URL válida");
    });

    it("should accept optional theme fields", () => {
        const config = {
            projectId: "test",
            apiKey: "test",
            theme: {
                primaryColor: "#ff0000",
            },
        };

        const result = v.safeParse(ConfigSchema, config);
        expect(result.success).toBe(true);
    });
});

describe("FeedbackSchema", () => {
    it("should validate a valid feedback payload", () => {
        const validFeedback = {
            projectId: "test",
            userId: "user-123",
            rating: 5,
            comment: "Great!",
            deviceInfo: {
                userAgent: "Mozilla/5.0",
                url: "https://example.com",
            },
            timestamp: "2023-01-01T00:00:00Z",
        };

        const result = v.safeParse(FeedbackSchema, validFeedback);
        expect(result.success).toBe(true);
    });

    it("should reject invalid rating", () => {
        const invalidFeedback = {
            projectId: "test",
            userId: "user-123",
            rating: 6, // Invalid
            deviceInfo: { userAgent: "", url: "" },
            timestamp: "",
        };

        const result = v.safeParse(FeedbackSchema, invalidFeedback);
        expect(result.success).toBe(false);
    });

    it("should reject comment too long", () => {
        const longComment = "a".repeat(1001);
        const invalidFeedback = {
            projectId: "test",
            userId: "user-123",
            rating: 5,
            comment: longComment,
            deviceInfo: { userAgent: "", url: "" },
            timestamp: "",
        };

        const result = v.safeParse(FeedbackSchema, invalidFeedback);
        expect(result.success).toBe(false);
        expect(result.issues).toBeDefined();
        expect(result.issues![0].message).toContain("muy largo");
    });
});
