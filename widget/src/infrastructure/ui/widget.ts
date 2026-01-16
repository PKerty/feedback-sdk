import type { SDKConfig } from "../../domain/feedback";
import { SubmitFeedbackUseCase } from "../../application/submitFeedback";
import { FeedbackSchema } from "../../domain/validation";
import { componentStyles } from "./styles";
import { ICONS } from "./icons";
import { t } from "../../i18n";
import type { TranslationKey } from "../../i18n";
import * as v from "valibot";

export class FeedbackWidget {
    private root: ShadowRoot;
    private isOpen = false; // Ahora sí lo usaremos
    private rating = 0;

    private readonly useCase: SubmitFeedbackUseCase;
    private readonly config: SDKConfig;
    constructor(useCase: SubmitFeedbackUseCase, config: SDKConfig) {
        const host = document.createElement("div");
        document.body.appendChild(host);
        this.root = host.attachShadow({ mode: "open" });
        this.useCase = useCase;
        this.config = config;
    }

    init(): void {
        this.render();
        this.applyTheme();
        this.bindEvents();
    }

    private applyTheme(): void {
        const theme = this.config.theme;
        if (!theme) return;
        const container = this.root.querySelector(".widget-container") as HTMLElement;

        // Mapa de configuración -> Variable CSS
        const mappings: Record<string, string> = {
            primaryColor: "--fdbk-primary",
            backgroundColor: "--fdbk-bg",
            textColor: "--fdbk-text",
            borderColor: "--fdbk-border",
            inputBackgroundColor: "--fdbk-input-bg",
        };

        // Iteramos e inyectamos
        Object.keys(mappings).forEach((key) => {
            // @ts-expect-error: Acceso dinámico simple
            if (theme[key]) {
                // @ts-expect-error
                container.style.setProperty(mappings[key], theme[key]);
            }
        });
    }

    private render(): void {
        const style = document.createElement("style");
        style.textContent = componentStyles;
        this.root.appendChild(style);

        const container = document.createElement("div");
        container.className = "widget-container";

        container.innerHTML = `
      <div class="modal" id="modal">
        <div id="view-form" class="view-section">
            <h3>${t("title", this.config.locale)}</h3>
            <div class="stars" id="stars-container">${this.renderStars()}</div>
            <div class="error" id="rating-error"></div>
            <textarea id="comment" placeholder="${t("commentPlaceholder", this.config.locale)}"></textarea>
            <div class="error" id="comment-error"></div>
            <button id="submit" class="submit-btn">${t("submit", this.config.locale)}</button>
        </div>
        <div id="view-error" class="view-section hidden error-view">
            ${ICONS.alert}
            <p id="error-message">${t("error", this.config.locale)}</p>
            <button id="retry" class="retry-btn">${ICONS.refresh} ${t("retry", this.config.locale)}</button>
            <button id="cancel" class="cancel-link">${t("cancel", this.config.locale)}</button>
        </div>
        <div id="view-success" class="view-section hidden success-view">
            ${ICONS.check}
            <p>${t("success", this.config.locale)}</p>
        </div>
        <div id="view-rate-limit" class="view-section hidden rate-limit-view">
            ${ICONS.warning}
            <p>${t("rateLimit", this.config.locale)}</p>
            <button id="rate-limit-ok" class="cancel-link">${t("cancel", this.config.locale)}</button>
        </div>
      </div>
      <button id="trigger" class="trigger-btn">${ICONS.chat}</button>
    `;
        this.root.appendChild(container);
    }

    private renderStars(): string {
        return [1, 2, 3, 4, 5]
            .map((i) => `<span class="star" data-value="${i}">${ICONS.star}</span>`)
            .join("");
    }

    private bindEvents(): void {
        const triggerBtn = this.root.querySelector("#trigger");
        const modal = this.root.querySelector("#modal");
        const stars = this.root.querySelectorAll(".star");
        const submitBtn = this.root.querySelector("#submit");
        const retryBtn = this.root.querySelector("#retry");
        const cancelBtn = this.root.querySelector("#cancel");

        // 1. Lógica de Apertura/Cierre (Usa this.isOpen)
        triggerBtn?.addEventListener("click", () => {
            this.isOpen = !this.isOpen; // <-- USO DE VARIABLE

            if (this.isOpen) {
                modal?.classList.add("open");
                triggerBtn.innerHTML = ICONS.close; // Cambiamos icono a "X"
            } else {
                modal?.classList.remove("open");
                triggerBtn.innerHTML = ICONS.chat; // Restauramos icono
            }
        });

        // 2. Lógica de Estrellas
        stars.forEach((star) => {
            star.addEventListener("click", (e) => {
                const target = e.currentTarget as HTMLElement;
                this.rating = parseInt(target.dataset.value || "0");
                this.updateStars(stars);
                this.clearValidationErrors();
            });
        });

        // 2.5. Clear errors on comment input
        const commentEl = this.root.getElementById("comment") as HTMLTextAreaElement;
        commentEl.addEventListener("input", () => {
            this.clearValidationErrors();
        });

        // 3. Lógica de Envío
        const handleSubmit = async (): Promise<void> => {
            const comment = (this.root.querySelector("#comment") as HTMLTextAreaElement).value;

            // Client-side validation
            const validation = this.validateForm(this.rating, comment);
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                return;
            }

            this.toggleLoading(true); // <-- Iniciamos carga
            try {
                const feedback = await this.useCase.execute(this.rating, comment);
                this.toggleSuccessView(true);
                if (this.config.onSuccess) {
                    this.config.onSuccess(feedback);
                }
            } catch (e: any) {
                if (e.message === "RATE_LIMIT_EXCEEDED") {
                    this.toggleRateLimitView(true);
                    if (this.config.onError) {
                        this.config.onError(e.message);
                    }
                } else {
                    const errorMessageKey = this.getErrorMessageKey(e);
                    this.toggleErrorView(true, errorMessageKey);
                    if (this.config.debug) {
                        console.error("FeedbackSDK Error:", e);
                    }
                    if (this.config.onError) {
                        this.config.onError(e.message);
                    }
                }
            } finally {
                this.toggleLoading(false); // <-- Terminamos carga
            }
        };

        submitBtn?.addEventListener("click", handleSubmit);
        retryBtn?.addEventListener("click", handleSubmit);

        cancelBtn?.addEventListener("click", () => {
            this.toggleErrorView(false);
        });

        const rateLimitOkBtn = this.root.querySelector("#rate-limit-ok");
        rateLimitOkBtn?.addEventListener("click", () => {
            this.toggleRateLimitView(false);
        });
    }

    private updateStars(stars: NodeListOf<Element>) {
        stars.forEach((star) => {
            const s = star as HTMLElement;
            const val = parseInt(s.dataset.value || "0");
            if (val <= this.rating) s.classList.add("active");
            else s.classList.remove("active");
        });
    }

    // IMPLEMENTACIÓN CORREGIDA
    private toggleLoading(isLoading: boolean) {
        const submitBtn = this.root.querySelector("#submit") as HTMLButtonElement;
        const retryBtn = this.root.querySelector("#retry") as HTMLButtonElement;

        if (!submitBtn || !retryBtn) return;

        if (isLoading) {
            // Estado de carga: Deshabilitar y texto "..."
            submitBtn.textContent = "...";
            submitBtn.disabled = true;
            retryBtn.textContent = "...";
            retryBtn.disabled = true;
        } else {
            // Estado normal: Habilitar y restaurar texto/iconos
            submitBtn.textContent = t("submit", this.config.locale);
            submitBtn.disabled = false;
            retryBtn.innerHTML = `${ICONS.refresh} Reintentar`;
            retryBtn.disabled = false;
        }
    }

    private toggleErrorView(show: boolean, messageKey?: string): void {
        const form = this.root.querySelector("#view-form");
        const error = this.root.querySelector("#view-error");
        if (show) {
            form?.classList.add("hidden");
            error?.classList.remove("hidden");
            if (messageKey) {
                const msgEl = this.root.querySelector("#error-message");
                if (msgEl) msgEl.textContent = t(messageKey as TranslationKey, this.config.locale);
            }
        } else {
            error?.classList.add("hidden");
            form?.classList.remove("hidden");
        }
    }

    private toggleSuccessView(show: boolean): void {
        const form = this.root.querySelector("#view-form");
        const success = this.root.querySelector("#view-success");
        if (show) {
            form?.classList.add("hidden");
            success?.classList.remove("hidden");
        } else {
            success?.classList.add("hidden");
            form?.classList.remove("hidden");
        }
    }

    private toggleRateLimitView(show: boolean): void {
        const form = this.root.querySelector("#view-form");
        const rateLimit = this.root.querySelector("#view-rate-limit");
        if (show) {
            form?.classList.add("hidden");
            rateLimit?.classList.remove("hidden");
        } else {
            rateLimit?.classList.add("hidden");
            form?.classList.remove("hidden");
        }
    }

    private validateForm(
        rating: number,
        comment: string
    ): { isValid: boolean; errors: { rating?: string; comment?: string } } {
        const rawFeedback = {
            projectId: this.config.projectId,
            userId: "dummy",
            rating,
            comment,
            deviceInfo: { userAgent: "", url: "" },
            timestamp: "",
        };
        const result = v.safeParse(FeedbackSchema, rawFeedback);
        const errors: { rating?: string; comment?: string } = {};
        if (!result.success) {
            for (const issue of result.issues) {
                const pathItem = issue.path?.[0];
                if (pathItem && typeof pathItem === "object" && "key" in pathItem) {
                    const field = pathItem.key;
                    if (field === "rating") {
                        errors.rating = t("ratingError", this.config.locale);
                    } else if (field === "comment") {
                        errors.comment = t("commentError", this.config.locale);
                    }
                }
            }
        }
        return { isValid: result.success, errors };
    }

    private showValidationErrors(errors: { rating?: string; comment?: string }): void {
        const ratingErrorEl = this.root.querySelector("#rating-error");
        const commentErrorEl = this.root.querySelector("#comment-error");
        if (ratingErrorEl) ratingErrorEl.textContent = errors.rating || "";
        if (commentErrorEl) commentErrorEl.textContent = errors.comment || "";
    }

    private clearValidationErrors(): void {
        this.showValidationErrors({});
    }

    private getErrorMessageKey(
        error: any
    ): "clientError" | "serverError" | "connectivityError" | "unexpectedError" {
        if (error.message.startsWith("CLIENT_ERROR:")) {
            return "clientError";
        } else if (error.message.startsWith("SERVER_ERROR:")) {
            return "serverError";
        } else if (
            error.message.includes("fetch") ||
            error.message.includes("network") ||
            error.message.includes("Failed to fetch")
        ) {
            return "connectivityError";
        }
        return "unexpectedError";
    }
}
