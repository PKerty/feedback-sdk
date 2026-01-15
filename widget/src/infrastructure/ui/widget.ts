import type { SDKConfig } from "../../domain/feedback";
import { SubmitFeedbackUseCase } from "../../application/submitFeedback";
import { componentStyles } from "./styles";
import { ICONS } from "./icons";
import { t } from "../../i18n";

export class FeedbackWidget {
    private root: ShadowRoot;
    private isOpen = false; // Ahora sí lo usaremos
    private rating = 0;

    private readonly useCase: SubmitFeedbackUseCase;
    private readonly config: SDKConfig & { locale: "en" | "es" };
    constructor(useCase: SubmitFeedbackUseCase, config: SDKConfig & { locale: "en" | "es" }) {
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
            <textarea id="comment" placeholder="${t("commentPlaceholder", this.config.locale)}"></textarea>
            <button id="submit" class="submit-btn">${t("submit", this.config.locale)}</button>
        </div>
        <div id="view-error" class="view-section hidden error-view">
            ${ICONS.alert}
            <p>${t("error", this.config.locale)}</p>
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
        const triggerBtn = this.root.getElementById("trigger");
        const modal = this.root.getElementById("modal");
        const stars = this.root.querySelectorAll(".star");
        const submitBtn = this.root.getElementById("submit");
        const retryBtn = this.root.getElementById("retry");
        const cancelBtn = this.root.getElementById("cancel");

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
            });
        });

        // 3. Lógica de Envío
        const handleSubmit = async (): Promise<void> => {
            const comment = (this.root.getElementById("comment") as HTMLTextAreaElement).value;

            this.toggleLoading(true); // <-- Iniciamos carga
            try {
                const feedback = await this.useCase.execute(this.rating, comment);
                this.toggleSuccessView(true);
                if ((this.config as any).onSuccess) {
                    (this.config as any).onSuccess(feedback);
                }
            } catch (e: any) {
                if (e.message === "RATE_LIMIT_EXCEEDED") {
                    this.toggleRateLimitView(true);
                    if ((this.config as any).onError) {
                        (this.config as any).onError(e.message);
                    }
                } else {
                    if ((this.config as any).debug) {
                        console.error("FeedbackSDK Error:", e);
                    }
                    this.toggleErrorView(true);
                    if ((this.config as any).onError) {
                        (this.config as any).onError(e.message || "Unknown error");
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

        const rateLimitOkBtn = this.root.getElementById("rate-limit-ok");
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
        const submitBtn = this.root.getElementById("submit") as HTMLButtonElement;
        const retryBtn = this.root.getElementById("retry") as HTMLButtonElement;

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

    private toggleErrorView(show: boolean): void {
        const form = this.root.getElementById("view-form");
        const error = this.root.getElementById("view-error");
        if (show) {
            form?.classList.add("hidden");
            error?.classList.remove("hidden");
        } else {
            error?.classList.add("hidden");
            form?.classList.remove("hidden");
        }
    }

    private toggleSuccessView(show: boolean): void {
        const form = this.root.getElementById("view-form");
        const success = this.root.getElementById("view-success");
        if (show) {
            form?.classList.add("hidden");
            success?.classList.remove("hidden");
        } else {
            success?.classList.add("hidden");
            form?.classList.remove("hidden");
        }
    }

    private toggleRateLimitView(show: boolean): void {
        const form = this.root.getElementById("view-form");
        const rateLimit = this.root.getElementById("view-rate-limit");
        if (show) {
            form?.classList.add("hidden");
            rateLimit?.classList.remove("hidden");
        } else {
            rateLimit?.classList.add("hidden");
            form?.classList.remove("hidden");
        }
    }
}
