import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocalUserStorageAdapter } from "../../infrastructure/storage/userAdapter";

describe("LocalUserStorageAdapter", () => {
    let adapter: LocalUserStorageAdapter;

    beforeEach(() => {
        adapter = new LocalUserStorageAdapter();
        localStorage.clear();
        vi.spyOn(crypto, "randomUUID").mockReturnValue("12345678-1234-1234-1234-123456789abc");
    });

    it("should generate and store user ID if not exists", () => {
        const userId = adapter.getUserId();
        expect(userId).toBe("12345678-1234-1234-1234-123456789abc");
        expect(localStorage.getItem("fdbk_user_id")).toBe("12345678-1234-1234-1234-123456789abc");
    });

    it("should return existing user ID", () => {
        localStorage.setItem("fdbk_user_id", "existing-id");
        const userId = adapter.getUserId();
        expect(userId).toBe("existing-id");
    });

    it("should not be rate limited if no last submission", () => {
        expect(adapter.isRateLimited(120000)).toBe(false);
    });

    it("should be rate limited if within cooldown", () => {
        const now = Date.now();
        localStorage.setItem("fdbk_last_sent", (now - 60000).toString()); // 1 min ago
        vi.spyOn(Date, "now").mockReturnValue(now);

        expect(adapter.isRateLimited(120000)).toBe(true); // 2 min cooldown
    });

    it("should not be rate limited if cooldown passed", () => {
        const now = Date.now();
        localStorage.setItem("fdbk_last_sent", (now - 130000).toString()); // 2.1 min ago
        vi.spyOn(Date, "now").mockReturnValue(now);

        expect(adapter.isRateLimited(120000)).toBe(false);
    });

    it("should record submission", () => {
        const now = 1234567890000;
        vi.spyOn(Date, "now").mockReturnValue(now);

        adapter.recordSubmission();
        expect(localStorage.getItem("fdbk_last_sent")).toBe("1234567890000");
    });
});
