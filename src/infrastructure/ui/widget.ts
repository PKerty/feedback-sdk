import type { SDKConfig } from "../../domain/feedback";
import { SubmitFeedbackUseCase } from "../../application/submitFeedback";
import { componentStyles } from "./styles";
import { ICONS } from "./icons";

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

	init() {
		this.render();
		this.applyTheme();
		this.bindEvents();
	}

	private applyTheme() {
		const theme = this.config.theme;
		if (!theme) return;
		const container = this.root.querySelector(
			".widget-container",
		) as HTMLElement;

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
			// @ts-ignore: Acceso dinámico simple
			if (theme[key]) {
				// @ts-ignore
				container.style.setProperty(mappings[key], theme[key]);
			}
		});
	}

	private render() {
		const style = document.createElement("style");
		style.textContent = componentStyles;
		this.root.appendChild(style);

		const container = document.createElement("div");
		container.className = "widget-container";

		container.innerHTML = `
      <div class="modal" id="modal">
        <div id="view-form" class="view-section">
            <h3>Tu opinión</h3>
            <div class="stars" id="stars-container">${this.renderStars()}</div>
            <textarea id="comment" placeholder="Comentario..."></textarea>
            <button id="submit" class="submit-btn">Enviar</button>
        </div>
        <div id="view-error" class="view-section hidden error-view">
            ${ICONS.alert}
            <p>Error al enviar</p>
            <button id="retry" class="retry-btn">${ICONS.refresh} Reintentar</button>
            <button id="cancel" class="cancel-link">Cancelar</button>
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

	private bindEvents() {
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
		const handleSubmit = async () => {
			const comment = (
				this.root.getElementById("comment") as HTMLTextAreaElement
			).value;

			this.toggleLoading(true); // <-- Iniciamos carga
			try {
				await this.useCase.execute(this.rating, comment);
				alert("Gracias por tu feedback!");
				this.closeModal();
			} catch (e: any) {
				if (e.message === "RATE_LIMIT_EXCEEDED") {
					alert("Por favor espera un momento antes de enviar otro.");
				} else {
					console.error(e);
					this.toggleErrorView(true);
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
			submitBtn.textContent = "Enviar";
			submitBtn.disabled = false;
			retryBtn.innerHTML = `${ICONS.refresh} Reintentar`;
			retryBtn.disabled = false;
		}
	}

	private toggleErrorView(show: boolean) {
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

	// IMPLEMENTACIÓN CORREGIDA
	private closeModal() {
		this.isOpen = false; // <-- USO DE VARIABLE
		this.root.getElementById("modal")?.classList.remove("open");

		// Resetear icono del trigger
		const trigger = this.root.getElementById("trigger");
		if (trigger) trigger.innerHTML = ICONS.chat;

		// Resetear formulario (opcional)
		const input = this.root.getElementById("comment") as HTMLTextAreaElement;
		if (input) input.value = "";
		this.rating = 0;
		this.updateStars(this.root.querySelectorAll(".star"));
	}
}
