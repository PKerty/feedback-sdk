import { sqliteTableCreator, text, integer } from "drizzle-orm/sqlite-core";

// ADR-002: Convención de Nombres (Prefijo feedback_)
const createTable = sqliteTableCreator((name) => `feedback_${name}`);

// Tabla: feedback_projects
export const projects = createTable("projects", {
	id: text("id").primaryKey(), // UUID v4 generado por Node
	name: text("name").notNull(),
	publicKey: text("public_key").notNull().unique(), // Indexada automáticamente al ser unique
	secretKey: text("secret_key").notNull().unique(),
	allowedOrigins: text("allowed_origins", { mode: "json" })
		.$type<string[]>()
		.notNull(), // Array de dominios
	themeConfig: text("theme_config", { mode: "json" })
		.$type<Record<string, string>>()
		.notNull(), // Configuración de colores
	createdAt: integer("created_at").notNull(), // Unix Timestamp
});

// Tabla: feedback_feedbacks
export const feedbacks = createTable("feedbacks", {
	id: text("id").primaryKey(),
	projectId: text("project_id")
		.notNull()
		.references(() => projects.id, { onDelete: "cascade" }), // Integrity check
	userId: text("user_id").notNull(), // UUID anónimo del SDK
	rating: integer("rating").notNull(),
	comment: text("comment"), // Opcional
	deviceInfo: text("device_info", { mode: "json" })
		.$type<Record<string, any>>()
		.notNull(), // Metadata
	ipAddress: text("ip_address").notNull(),
	createdAt: integer("created_at").notNull(),
});
