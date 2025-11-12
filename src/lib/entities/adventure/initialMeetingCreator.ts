import { Creator } from '../base/creator';
import { InitialMeeting } from './initialMeeting';
import { InitialMeetingTypeTable } from '$lib/tables/adventureTables/initialMeetingTypeTable';
import { InitialMeetingCircumstancesTable } from '$lib/tables/adventureTables/initialMeetingCircumstancesTable';
import { InitialMeetingToneTable } from '$lib/tables/adventureTables/initialMeetingToneTable';
import { LocationTable } from '$lib/tables/otherTables/locationTable';

export class InitialMeetingCreator extends Creator<InitialMeeting> {
	create(): InitialMeeting {
		const meeting = new InitialMeeting();

		// Generate meeting details
		meeting.type = new InitialMeetingTypeTable().roleWithCascade(this.dice).text;
		meeting.location = new LocationTable().roleWithCascade(this.dice).text;
		meeting.circumstances = new InitialMeetingCircumstancesTable().roleWithCascade(this.dice).text;
		meeting.tone = new InitialMeetingToneTable().roleWithCascade(this.dice).text;

		// Generate name and description
		meeting.name = this.generateName(meeting);
		meeting.description = this.generateDescription(meeting);

		return meeting;
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateName(meeting: InitialMeeting): string {
		return `${this.capitalize(meeting.type)}`;
	}

	private generateDescription(meeting: InitialMeeting): string {
		let desc = `The characters meet through a ${meeting.type} at ${meeting.location}. `;

		desc += `This encounter happens ${meeting.circumstances}. `;

		desc += `The meeting is ${meeting.tone}.`;

		return desc;
	}
}
