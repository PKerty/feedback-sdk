import { Project } from "../entities/Project";

export interface IProjectRepository {
	findById(id: string): Promise<Project | null>;
	findByPublicKey(publicKey: string): Promise<Project | null>;
	create(project: Project): Promise<void>;
}
