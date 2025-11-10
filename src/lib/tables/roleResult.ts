export class RoleResult {
	text: string;
	fullText: string;
	cascadingRoles: [any, number, string][];
	functions: ((entity: any) => any)[];

	constructor(
		text: string = '',
		fullText: string = '',
		cascadingRoles: [any, number, string][] = [],
		functions: ((entity: any) => any)[] = []
	) {
		this.text = text;
		this.fullText = fullText;
		this.cascadingRoles = cascadingRoles;
		this.functions = functions;
	}

	setText(text: string): void {
		this.text = text;
	}
}
