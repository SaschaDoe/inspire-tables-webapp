import { Creator } from '../base/creator';
import { Trap } from './trap';
import { TrapTriggerTable } from '$lib/tables/dungeonTables/trapTriggerTable';
import { TrapFunctionTable } from '$lib/tables/dungeonTables/trapFunctionTable';

export class TrapCreator extends Creator<Trap> {
	create(): Trap {
		const trap = new Trap();
		this.setParentReference(trap); // Automatically sets parentId

		trap.trigger = new TrapTriggerTable().roleWithCascade(this.dice).text;
		trap.function = new TrapFunctionTable().roleWithCascade(this.dice).text;

		// Generate name
		trap.name = this.generateName(trap);

		// Generate description
		trap.description = this.generateDescription(trap);

		return trap;
	}

	private generateName(trap: Trap): string {
		return `${this.capitalize(trap.trigger)} ${this.capitalize(trap.function)} Trap`;
	}

	private generateDescription(trap: Trap): string {
		return `A trap triggered by ${trap.trigger} that executes ${trap.function}.`;
	}

	private capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
}
