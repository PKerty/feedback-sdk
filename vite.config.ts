import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
	build: {
		// Modo librería
		lib: {
			entry: path.resolve(__dirname, "src/main.ts"),
			name: "FeedbackSDK", // El nombre de la variable global en builds UMD/IIFE
			fileName: (format) => `feedback-sdk.${format}.js`,
			formats: ["es", "umd"], // 'es' para import, 'umd' para script tag clásico
		},
		// Minificación agresiva
		minify: "terser",
		terserOptions: {
			compress: {
				drop_console: true, // Opcional: Quita los console.log en prod
			},
		},
	},
});
