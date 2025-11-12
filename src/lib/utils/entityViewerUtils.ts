/**
 * Utility functions for entity viewer components
 */

/**
 * Formats a list of items as a comma-separated string
 */
export function formatList(items: string[]): string {
	return items.join(', ');
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats a number with a + or - prefix
 */
export function formatModifier(value: number): string {
	return value >= 0 ? `+${value}` : `${value}`;
}

/**
 * Truncates a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
	if (str.length <= maxLength) return str;
	return str.slice(0, maxLength) + '...';
}

/**
 * Formats a date to a readable string
 */
export function formatDate(date: Date): string {
	return new Intl.DateTimeFormat('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	}).format(date);
}

/**
 * Gets a color class based on a value's positivity
 */
export function getValueColorClass(value: string): string {
	const lowerValue = value.toLowerCase();
	if (lowerValue.includes('advantage') || lowerValue.includes('blessing')) {
		return 'positive';
	}
	if (lowerValue.includes('disadvantage') || lowerValue.includes('curse')) {
		return 'negative';
	}
	return '';
}
