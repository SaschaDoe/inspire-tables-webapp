import type { Table } from './table';

export class TableEntry {
	private minRole: number;
	private maxRole: number;
	text: string;
	textWithCascades: string;
	fullText = '';
	cascadingRoles: ([Table, number, string] | [string, number, string] | [() => string, number, string])[] = [];
	functions: ((entity: any) => any)[];

	constructor(text: string = '-', singleRoleValue = -1) {
		this.minRole = singleRoleValue;
		this.maxRole = singleRoleValue;
		this.text = text;
		this.functions = [];
		this.setFullText();
		this.textWithCascades = text;
	}

	withRoleInterval(minRole: number, maxRole: number): TableEntry {
		if (minRole > maxRole) {
			throw new RangeError('Max should be equal or bigger than min');
		}
		this.setMinMax(minRole, maxRole);
		return this;
	}

	withFunction(func: (entity: any) => any): TableEntry {
		this.functions.push(func);
		return this;
	}

	toString(): string {
		if (this.minRole === this.maxRole) {
			return `${this.minRole}`;
		}
		return `${this.minRole}-${this.maxRole}`;
	}

	withCascadingRole(table: Table, probability = 100, text = ''): TableEntry {
		this.cascadingRoles.push([table, probability, text]);
		this.textWithCascades = this.textWithCascades + ' ' + text + ' (' + table.title + ')';
		return this;
	}

	with(input: string, probability = 100): TableEntry {
		this.cascadingRoles.push([input, probability, '']);
		this.textWithCascades = this.textWithCascades + ' ' + input;
		return this;
	}

	withFunctionString(fnk: () => string, probability = 100): TableEntry {
		this.cascadingRoles.push([fnk, probability, '']);
		return this;
	}

	withSelfCascade(probability = 100, input = ''): TableEntry {
		this.cascadingRoles.push(['self', probability, input]);
		this.textWithCascades = this.textWithCascades + ' (self)';
		return this;
	}

	getMin(): number {
		return this.minRole;
	}

	getMax(): number {
		return this.maxRole;
	}

	setMinMax(min: number, max: number): void {
		this.minRole = min;
		this.maxRole = max;
		this.setFullText();
	}

	setFullText(): void {
		this.fullText = `${this.toString()}: ${this.text}`;
	}
}
