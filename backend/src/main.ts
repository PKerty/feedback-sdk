import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./infrastructure/http/middlewares/errorHandler";

// Repositorios (Infra)
import { DrizzleProjectRepository } from "./infrastructure/repositories/DrizzleProjectRepository";
import { DrizzleFeedbackRepository } from "./infrastructure/repositories/DrizzleFeedbackRepository";

// Casos de Uso (Application)
import { SubmitFeedbackUseCase } from "./application/use-cases/SubmitFeedbackUseCase";
import { GetProjectFeedbacksUseCase } from "./application/use-cases/GetProjectFeedbackUseCase";

// Controladores (Infra HTTP)
import { FeedbackController } from "./infrastructure/http/controllers/FeedbackController";

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuración Global (Middlewares) ---
app.use(helmet()); // Seguridad headers
app.use(cors()); // CORS básico (El estricto lo maneja el Caso de Uso con InvalidOrigin)
app.use(express.json());

// ADR-004: Rate Limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutos
	limit: 100, // Límite de 100 peticiones por IP
	standardHeaders: true,
	legacyHeaders: false,
});
app.use("/v1/feedback", limiter); // Solo aplicamos Rate Limit al endpoint de ingesta

// --- Inyección de Dependencias ---
const projectRepo = new DrizzleProjectRepository();
const feedbackRepo = new DrizzleFeedbackRepository();

const submitUseCase = new SubmitFeedbackUseCase(projectRepo, feedbackRepo);
const getFeedbacksUseCase = new GetProjectFeedbacksUseCase(
	projectRepo,
	feedbackRepo,
);

const feedbackController = new FeedbackController(
	submitUseCase,
	getFeedbacksUseCase,
);

// --- Rutas ---

// Collector API
app.post("/v1/feedback", (req, res, next) =>
	feedbackController.submit(req, res, next),
);

// Management API
app.get("/projects/:projectId/feedbacks", (req, res, next) =>
	feedbackController.getByProject(req, res, next),
);

// Health Check
app.get("/health", (_, res) => {
	res.json({ status: "ok", timestamp: new Date() });
});

// Middleware de Errores (SIEMPRE AL FINAL)
app.use(errorHandler);

// --- Server Start ---
app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`);
	console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
