import { eq } from "drizzle-orm";
import { db } from "../db";
import { projects } from "../db/schema";
import { Project, ThemeConfig } from "../../domain/entities/Project";
import { IProjectRepository } from "../../domain/ports/IProjectRepository";

export class DrizzleProjectRepository implements IProjectRepository {
	// Mapper: Convierte de DB a Entidad de Dominio
	private mapToDomain(raw: typeof projects.$inferSelect): Project {
		return new Project(
			raw.id,
			raw.name,
			raw.publicKey,
			raw.secretKey,
			raw.allowedOrigins, // Drizzle ya lo parseó como JSON array
			raw.themeConfig as ThemeConfig, // Drizzle ya lo parseó como JSON object
			new Date(raw.createdAt),
		);
	}

	async findById(id: string): Promise<Project | null> {
		const result = db.select().from(projects).where(eq(projects.id, id)).get();
		if (!result) return null;
		return this.mapToDomain(result);
	}

	async findByPublicKey(publicKey: string): Promise<Project | null> {
		const result = db
			.select()
			.from(projects)
			.where(eq(projects.publicKey, publicKey))
			.get();
		if (!result) return null;
		return this.mapToDomain(result);
	}

	async create(project: Project): Promise<void> {
		db.insert(projects).values({
			id: project.id,
			name: project.name,
			publicKey: project.publicKey,
			secretKey: project.secretKey,
			allowedOrigins: project.allowedOrigins,
			themeConfig: project.themeConfig,
			createdAt: project.createdAt.getTime(), // Convertir Date a Unix Timestamp (ADR-002)
		});
	}
}
