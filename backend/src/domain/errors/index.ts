export class BusinessRuleViolation extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BusinessRuleViolation";
	}
}

export class ProjectNotFound extends Error {
	constructor(identifier: string) {
		super(`Project not found with identifier: ${identifier}`);
		this.name = "ProjectNotFound";
	}
}

export class InvalidOrigin extends Error {
	constructor(origin: string) {
		super(`Origin not allowed: ${origin}`);
		this.name = "InvalidOrigin";
	}
}
