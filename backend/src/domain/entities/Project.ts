export interface ThemeConfig {
	primaryColor: string;
	backgroundColor: string;
	[key: string]: string;
}

export class Project {
	constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly publicKey: string,
		public readonly secretKey: string,
		public readonly allowedOrigins: string[],
		public readonly themeConfig: ThemeConfig,
		public readonly createdAt: Date,
	) {}

	// Método de dominio para validar origen (ADR-004)
	isOriginAllowed(origin: string): boolean {
		return (
			this.allowedOrigins.includes(origin) || this.allowedOrigins.includes("*")
		);
	}
}
