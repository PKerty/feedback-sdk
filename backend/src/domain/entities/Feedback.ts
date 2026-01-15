import { v4 as uuidv4 } from "uuid";
import { BusinessRuleViolation } from "../errors";

export interface DeviceInfo {
	userAgent: string;
	screenSize?: string;
	url?: string;
	[key: string]: any;
}

export class Feedback {
	constructor(
		public readonly id: string,
		public readonly projectId: string,
		public readonly userId: string,
		public readonly rating: number,
		public readonly comment: string | null,
		public readonly deviceInfo: DeviceInfo,
		public readonly ipAddress: string,
		public readonly createdAt: Date,
	) {
		// Validación de Invariante de Negocio (ADR-005)
		if (this.rating < 1 || this.rating > 5) {
			throw new BusinessRuleViolation("Rating must be between 1 and 5");
		}
	}

	// Factory method para facilitar la creación de nuevos feedbacks
	static create(props: Omit<Feedback, "id" | "createdAt">): Feedback {
		return new Feedback(
			uuidv4(),
			props.projectId,
			props.userId,
			props.rating,
			props.comment,
			props.deviceInfo,
			props.ipAddress,
			new Date(),
		);
	}
}
