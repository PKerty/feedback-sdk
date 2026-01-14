import express from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

// Habilitar CORS para que el demo.html pueda hablar con el server
app.use(cors());
app.use(express.json());

// Endpoint que configuramos en el SDK
app.post("/api/feedback", (req, res) => {
	const payload = req.body;
	const authHeader = req.headers["authorization"];
	const projectIdHeader = req.headers["x-project-id"];

	console.log("--- NUEVO FEEDBACK RECIBIDO ---");
	console.log("Auth:", authHeader); // Debería decir "Bearer pk_public_key_abc"
	console.log("Project:", projectIdHeader); // Debería decir "proyecto_demo_123"
	console.log("Datos:", payload);

	// Simulamos un delay de red de 1 segundo
	setTimeout(() => {
		// Simulación: Descomenta esto para probar el RETRY automático del frontend
		// if (Math.random() < 0.7) {
		//     console.log("Simulando error 500...");
		//     return res.status(500).json({ error: "Server Error simulado" });
		// }

		res.status(201).json({ success: true, id: Date.now() });
	}, 1000);
});

app.listen(PORT, () => {
	console.log(`📡 API Backend simulada corriendo en http://localhost:${PORT}`);
});
