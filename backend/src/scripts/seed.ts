import { v4 as uuidv4 } from "uuid";
import { db } from "../infrastructure/db";
import { projects } from "../infrastructure/db/schema";

async function main() {
	console.log("🌱 Starting seed...");

	const projectId = uuidv4();
	const publicKey = `pk_${uuidv4().replace(/-/g, "")}`; // Simulamos formato tipo Stripe
	const secretKey = `sk_${uuidv4().replace(/-/g, "")}`;

	console.log("Inserting demo project...");

	try {
		// Insertamos directamente usando Drizzle (bypasseando el repo para este script administrativo)
		db.insert(projects)
			.values({
				id: projectId,
				name: "Demo Project",
				publicKey: publicKey,
				secretKey: secretKey,
				allowedOrigins: ["*"], // Permitimos todo para facilitar pruebas locales (ADR-004)
				themeConfig: {
					primaryColor: "#007bff",
					backgroundColor: "#ffffff",
				},
				createdAt: Date.now(), // ADR-002: Timestamp como Integer
			})
			.run();

		console.log("\n✅ Seed completed successfully!\n");
		console.log("-------------------------------------------------------");
		console.log("📋 Project Details (Use these for testing):");
		console.log(`🆔 Project ID:   ${projectId}`);
		console.log(
			`🔑 Public Key:   ${publicKey}  <-- Usar en Header 'Authorization: Bearer ...'`,
		);
		console.log(
			`🔒 Secret Key:   ${secretKey}  <-- Usar para Dashboard (futuro)`,
		);
		console.log("-------------------------------------------------------");
	} catch (error) {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	}
}

main();
