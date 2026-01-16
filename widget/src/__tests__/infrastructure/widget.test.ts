import { describe, it, expect, vi, beforeEach } from "vitest";
import { FeedbackWidget } from "../../infrastructure/ui/widget";
import type { SubmitFeedbackUseCase } from "../../application/submitFeedback";
import type { SDKConfig } from "../../domain/validation";

describe("FeedbackWidget", () => {
    let mockUseCase: SubmitFeedbackUseCase;
    let config: SDKConfig;
    let widget: FeedbackWidget;

    beforeEach(() => {
        mockUseCase = {
            execute: vi.fn(),
        } as any;
        config = {
            projectId: "test",
            apiKey: "key",
            locale: "en",
        };
        widget = new FeedbackWidget(mockUseCase, config);
    });

    it("should initialize and render widget", () => {
        widget.init();
        const shadowRoot = (widget as any).root;
        expect(shadowRoot).toBeInstanceOf(ShadowRoot);
        expect(shadowRoot.querySelector(".widget-container")).toBeTruthy();
    });

    it("should apply theme colors to CSS variables", () => {
        config.theme = {
            primaryColor: "#ff0000",
            backgroundColor: "#000000",
            textColor: "#ffffff",
        };
        widget = new FeedbackWidget(mockUseCase, config);
        widget.init();

        const container = (widget as any).root.querySelector(".widget-container");
        expect(container.style.getPropertyValue("--fdbk-primary")).toBe("#ff0000");
        expect(container.style.getPropertyValue("--fdbk-bg")).toBe("#000000");
        expect(container.style.getPropertyValue("--fdbk-text")).toBe("#ffffff");
    });

    it("should not apply theme if not provided", () => {
        widget.init();
        const container = (widget as any).root.querySelector(".widget-container");
        expect(container.style.getPropertyValue("--fdbk-primary")).toBe("");
    });

    it("should handle partial theme", () => {
        config.theme = {
            primaryColor: "#00ff00",
        };
        widget = new FeedbackWidget(mockUseCase, config);
        widget.init();

        const container = (widget as any).root.querySelector(".widget-container");
        expect(container.style.getPropertyValue("--fdbk-primary")).toBe("#00ff00");
        expect(container.style.getPropertyValue("--fdbk-bg")).toBe("");
    });

    it("should toggle success view", () => {
        widget.init();
        const form = (widget as any).root.querySelector("#view-form");
        const success = (widget as any).root.querySelector("#view-success");

        expect(form.classList.contains("hidden")).toBe(false);
        expect(success.classList.contains("hidden")).toBe(true);

        (widget as any).toggleSuccessView(true);
        expect(form.classList.contains("hidden")).toBe(true);
        expect(success.classList.contains("hidden")).toBe(false);

        (widget as any).toggleSuccessView(false);
        expect(form.classList.contains("hidden")).toBe(false);
        expect(success.classList.contains("hidden")).toBe(true);
    });

    it("should toggle rate limit view", () => {
        widget.init();
        const form = (widget as any).root.querySelector("#view-form");
        const rateLimit = (widget as any).root.querySelector("#view-rate-limit");

        expect(form.classList.contains("hidden")).toBe(false);
        expect(rateLimit.classList.contains("hidden")).toBe(true);

        (widget as any).toggleRateLimitView(true);
        expect(form.classList.contains("hidden")).toBe(true);
        expect(rateLimit.classList.contains("hidden")).toBe(false);

        (widget as any).toggleRateLimitView(false);
        expect(form.classList.contains("hidden")).toBe(false);
        expect(rateLimit.classList.contains("hidden")).toBe(true);
    });

    it("should call onSuccess callback on successful submit", async () => {
        const mockFeedback = {
            projectId: "test",
            userId: "user",
            rating: 5,
            comment: "",
            deviceInfo: { userAgent: "", url: "" },
            timestamp: "2023-01-01T00:00:00Z",
        };
        vi.mocked(mockUseCase).execute.mockResolvedValue(mockFeedback);
        const onSuccess = vi.fn();
        config.onSuccess = onSuccess;
        widget = new FeedbackWidget(mockUseCase, config);
        widget.init();

        const submitBtn = (widget as any).root.querySelector("#submit");
        const stars = (widget as any).root.querySelectorAll(".star");
        stars[0].click(); // Select valid rating
        await submitBtn.click();

        expect(onSuccess).toHaveBeenCalledWith(mockFeedback);
    });

    it("should log debug error on network failure", async () => {
        vi.mocked(mockUseCase).execute.mockRejectedValue(new Error("NETWORK_ERROR"));
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        config.debug = true;
        widget = new FeedbackWidget(mockUseCase, config);
        widget.init();

        const submitBtn = (widget as any).root.querySelector("#submit");
        const stars = (widget as any).root.querySelectorAll(".star");
        stars[0].click(); // Select valid rating
        await submitBtn.click();

        expect(consoleSpy).toHaveBeenCalledWith("FeedbackSDK Error:", expect.any(Error));
        consoleSpy.mockRestore();
    });

    it("should render stars correctly", () => {
        widget.init();
        const stars = (widget as any).root.querySelectorAll(".star");
        expect(stars.length).toBe(5);
        expect(stars[0].getAttribute("data-value")).toBe("1");
        expect(stars[4].getAttribute("data-value")).toBe("5");
    });

    it("should toggle modal on trigger click", () => {
        widget.init();
        const trigger = (widget as any).root.querySelector("#trigger");
        const modal = (widget as any).root.querySelector("#modal");

        expect(modal.classList.contains("open")).toBe(false);

        trigger.click();
        expect(modal.classList.contains("open")).toBe(true);

        trigger.click();
        expect(modal.classList.contains("open")).toBe(false);
    });

    it("should select rating on star click", () => {
        widget.init();
        const stars = (widget as any).root.querySelectorAll(".star");

        stars[2].click(); // 3rd star
        expect((widget as any).rating).toBe(3);
    });

    it("should submit feedback on button click", () => {
        widget.init();
        const submitBtn = (widget as any).root.querySelector("#submit");
        const stars = (widget as any).root.querySelectorAll(".star");

        stars[4].click(); // Select 5
        submitBtn.click();

        expect(mockUseCase.execute).toHaveBeenCalledWith(5, "");
    });

    it("should show validation errors on submit with invalid rating and comment", () => {
        widget.init();
        const submitBtn = (widget as any).root.querySelector("#submit");
        const ratingError = (widget as any).root.querySelector("#rating-error");
        const commentError = (widget as any).root.querySelector("#comment-error");
        const commentEl = (widget as any).root.querySelector("#comment") as HTMLTextAreaElement;

        // Set invalid comment
        commentEl.value = "a".repeat(1001);
        // Rating is 0, invalid

        submitBtn.click();

        expect(ratingError.textContent).toBe("Rating must be between 1 and 5.");
        expect(commentError.textContent).toBe("Comment is too long (max 1000 characters).");
        expect(mockUseCase.execute).not.toHaveBeenCalled();
    });

    it("should clear validation errors when rating is selected", () => {
        widget.init();
        const submitBtn = (widget as any).root.querySelector("#submit");
        const ratingError = (widget as any).root.querySelector("#rating-error");
        const stars = (widget as any).root.querySelectorAll(".star");
        const commentEl = (widget as any).root.querySelector("#comment") as HTMLTextAreaElement;

        // First show errors
        commentEl.value = "a".repeat(1001);
        submitBtn.click();
        expect(ratingError.textContent).toBeTruthy();

        // Then select rating
        stars[0].click();
        expect(ratingError.textContent).toBe("");
    });

    it("should clear validation errors on comment input", () => {
        widget.init();
        const submitBtn = (widget as any).root.querySelector("#submit");
        const commentError = (widget as any).root.querySelector("#comment-error");
        const commentEl = (widget as any).root.querySelector("#comment") as HTMLTextAreaElement;

        // Show errors
        commentEl.value = "a".repeat(1001);
        submitBtn.click();
        expect(commentError.textContent).toBeTruthy();

        // Input clears
        commentEl.value = "valid";
        commentEl.dispatchEvent(new window.Event("input"));
        expect(commentError.textContent).toBe("");
    });

    it("should show client error message for CLIENT_ERROR", async () => {
        vi.mocked(mockUseCase).execute.mockRejectedValue(new Error("CLIENT_ERROR:400"));
        widget.init();
        const submitBtn = (widget as any).root.querySelector("#submit");
        const stars = (widget as any).root.querySelectorAll(".star");

        stars[0].click(); // Select valid rating
        await submitBtn.click();

        const errorMsg = (widget as any).root.querySelector("#error-message");
        expect(errorMsg.textContent).toBe("Please check your input and try again.");
    });

    it("should show server error message for SERVER_ERROR", async () => {
        vi.mocked(mockUseCase).execute.mockRejectedValue(new Error("SERVER_ERROR:500"));
        widget.init();
        const submitBtn = (widget as any).root.querySelector("#submit");
        const stars = (widget as any).root.querySelectorAll(".star");

        stars[0].click(); // Select valid rating
        await submitBtn.click();

        const errorMsg = (widget as any).root.querySelector("#error-message");
        expect(errorMsg.textContent).toBe("Server issue. Please try again later.");
    });

    it("should show connectivity error message for network failures", async () => {
        vi.mocked(mockUseCase).execute.mockRejectedValue(new Error("Failed to fetch"));
        widget.init();
        const submitBtn = (widget as any).root.querySelector("#submit");
        const stars = (widget as any).root.querySelectorAll(".star");

        stars[0].click(); // Select valid rating
        await submitBtn.click();

        const errorMsg = (widget as any).root.querySelector("#error-message");
        expect(errorMsg.textContent).toBe(
            "No internet connection. Check your connection and retry."
        );
    });

    it("should show unexpected error message for unknown errors", async () => {
        vi.mocked(mockUseCase).execute.mockRejectedValue(new Error("UNKNOWN_ERROR"));
        widget.init();
        const submitBtn = (widget as any).root.querySelector("#submit");
        const stars = (widget as any).root.querySelectorAll(".star");

        stars[0].click(); // Select valid rating
        await submitBtn.click();

        const errorMsg = (widget as any).root.querySelector("#error-message");
        expect(errorMsg.textContent).toBe("Something went wrong. Please try again.");
    });
});
