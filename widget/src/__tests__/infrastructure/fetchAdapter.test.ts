import { describe, it, expect, vi, beforeEach } from "vitest";
import { FetchFeedbackRepository } from "../../infrastructure/http/fetchAdapter";
import type { Feedback } from "../../domain/feedback";

describe("FetchFeedbackRepository", () => {
    let repo: FetchFeedbackRepository;
    let mockFetch: any;
    let feedback: Feedback;

    beforeEach(() => {
        repo = new FetchFeedbackRepository();
        feedback = {
            projectId: "test",
            userId: "user",
            rating: 5,
            deviceInfo: { userAgent: "", url: "" },
            timestamp: "2023-01-01T00:00:00Z",
        };
        mockFetch = vi.fn();
        vi.stubGlobal("fetch", mockFetch);
    });

    it("should send feedback successfully on first attempt", async () => {
        mockFetch.mockResolvedValue({ ok: true });

        await repo.send(feedback, "https://api.com", "key");

        expect(mockFetch).toHaveBeenCalledWith("https://api.com", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer key",
                "minders-api-key": "minders_secret_key",
                "X-Project-ID": "test",
            },
            body: JSON.stringify(feedback),
        });
    });

    it("should retry on server error and succeed", async () => {
        mockFetch
            .mockResolvedValueOnce({ ok: false, status: 500 })
            .mockResolvedValueOnce({ ok: true });

        await repo.send(feedback, "https://api.com", "key");

        expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should fail after max retries on server error", async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 500 });

        await expect(repo.send(feedback, "https://api.com", "key")).rejects.toThrow(
            "SERVER_ERROR:500"
        );
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should not retry on client error", async () => {
        mockFetch.mockResolvedValue({ ok: false, status: 400 });

        await expect(repo.send(feedback, "https://api.com", "key")).rejects.toThrow(
            "CLIENT_ERROR:400"
        );
        expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle network errors with retries", async () => {
        mockFetch
            .mockRejectedValueOnce(new Error("Network error"))
            .mockResolvedValueOnce({ ok: true });

        await repo.send(feedback, "https://api.com", "key");

        expect(mockFetch).toHaveBeenCalledTimes(2);
    });
});
