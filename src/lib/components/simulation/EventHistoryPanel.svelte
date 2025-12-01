<script lang="ts">
	import type { HistoricalEvent } from '$lib/entities/simulation/historicalEvent';
	import { EventSignificance, HistoricalEventType } from '$lib/entities/simulation/historicalEvent';

	interface Props {
		events: HistoricalEvent[];
		currentYear: number;
		maxEvents?: number;
	}

	let { events, currentYear, maxEvents = 50 }: Props = $props();

	// Sort events by year/turn descending (newest first) and limit
	const displayEvents = $derived(
		[...events]
			.sort((a, b) => b.turnNumber - a.turnNumber || b.year - a.year)
			.slice(0, maxEvents)
	);

	function getEventIcon(type: HistoricalEventType): string {
		switch (type) {
			case HistoricalEventType.CityFounded:
				return '🏛️';
			case HistoricalEventType.CityGrew:
				return '📈';
			case HistoricalEventType.CityStarved:
				return '💀';
			case HistoricalEventType.TechDiscovered:
				return '🔬';
			case HistoricalEventType.PolicyUnlocked:
				return '📜';
			case HistoricalEventType.WarDeclared:
				return '⚔️';
			case HistoricalEventType.PeaceTreaty:
				return '🕊️';
			case HistoricalEventType.MilitaryVictory:
				return '🏆';
			case HistoricalEventType.BattleFought:
				return '🗡️';
			case HistoricalEventType.BorderExpansion:
				return '🗺️';
			case HistoricalEventType.NationEliminated:
				return '☠️';
			case HistoricalEventType.UnitCreated:
				return '🛡️';
			case HistoricalEventType.BuildingConstructed:
				return '🏗️';
			default:
				return '📌';
		}
	}

	function getSignificanceClass(significance: EventSignificance): string {
		switch (significance) {
			case EventSignificance.Critical:
				return 'critical';
			case EventSignificance.Historic:
				return 'historic';
			case EventSignificance.Major:
				return 'major';
			case EventSignificance.Normal:
				return 'normal';
			case EventSignificance.Minor:
				return 'minor';
			default:
				return 'normal';
		}
	}

	function formatYear(year: number): string {
		if (year < 0) {
			return `${Math.abs(year)} BCE`;
		}
		return `${year} CE`;
	}
</script>

<div class="event-history-panel">
	<div class="panel-header">
		<h4>Event History</h4>
		<span class="current-year">Year: {formatYear(currentYear)}</span>
	</div>

	<div class="events-container">
		{#if displayEvents.length === 0}
			<p class="no-events">No events yet. Run the simulation to see history unfold.</p>
		{:else}
			<ul class="events-list">
				{#each displayEvents as event (event.id)}
					<li class="event-item {getSignificanceClass(event.significance)}">
						<div class="event-icon">{getEventIcon(event.eventType)}</div>
						<div class="event-content">
							<div class="event-header">
								<span class="event-name">{event.name}</span>
								<span class="event-year">Turn {event.turnNumber} ({formatYear(event.year)})</span>
							</div>
							<p class="event-description">{event.description}</p>
							{#if event.participants.length > 0}
								<div class="event-participants">
									{#each event.participants as participant}
										<span class="participant-tag" data-role={participant.role}>
											{participant.entityName}
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.event-history-panel {
		display: flex;
		flex-direction: column;
		background: rgb(30 27 75 / 0.4);
		border-radius: 0.5rem;
		border: 2px solid rgb(147 51 234 / 0.3);
		overflow: hidden;
		max-height: 400px;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem 1rem;
		background: rgb(30 27 75 / 0.6);
		border-bottom: 1px solid rgb(147 51 234 / 0.3);
	}

	.panel-header h4 {
		margin: 0;
		color: rgb(192 132 252);
		font-size: 1rem;
		font-weight: 600;
	}

	.current-year {
		color: rgb(250 204 21);
		font-size: 0.875rem;
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		background: rgb(30 27 75 / 0.8);
		border-radius: 0.25rem;
	}

	.events-container {
		flex: 1;
		overflow-y: auto;
		padding: 0.5rem;
	}

	.no-events {
		text-align: center;
		color: rgb(148 163 184);
		font-size: 0.875rem;
		padding: 2rem;
		margin: 0;
	}

	.events-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.event-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem;
		background: rgb(15 23 42 / 0.6);
		border-radius: 0.375rem;
		border-left: 3px solid rgb(71 85 105);
		transition: all 0.2s;
	}

	.event-item:hover {
		background: rgb(15 23 42 / 0.8);
	}

	.event-item.critical {
		border-left-color: rgb(239 68 68);
		background: rgb(127 29 29 / 0.2);
	}

	.event-item.historic {
		border-left-color: rgb(250 204 21);
		background: rgb(113 63 18 / 0.2);
	}

	.event-item.major {
		border-left-color: rgb(147 51 234);
		background: rgb(88 28 135 / 0.2);
	}

	.event-item.normal {
		border-left-color: rgb(59 130 246);
	}

	.event-item.minor {
		border-left-color: rgb(100 116 139);
	}

	.event-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		width: 2rem;
		text-align: center;
	}

	.event-content {
		flex: 1;
		min-width: 0;
	}

	.event-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.event-name {
		font-weight: 600;
		color: rgb(226 232 240);
		font-size: 0.875rem;
	}

	.event-year {
		font-size: 0.7rem;
		color: rgb(148 163 184);
		white-space: nowrap;
	}

	.event-description {
		margin: 0;
		color: rgb(203 213 225);
		font-size: 0.8rem;
		line-height: 1.4;
	}

	.event-participants {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.5rem;
	}

	.participant-tag {
		font-size: 0.65rem;
		padding: 0.15rem 0.4rem;
		border-radius: 0.25rem;
		background: rgb(51 65 85);
		color: rgb(203 213 225);
	}

	.participant-tag[data-role='primary'] {
		background: rgb(88 28 135 / 0.5);
		color: rgb(216 180 254);
	}

	.participant-tag[data-role='secondary'] {
		background: rgb(30 58 138 / 0.5);
		color: rgb(147 197 253);
	}
</style>
