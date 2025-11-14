<script lang="ts">
	import type { SphereConnection } from '$lib/entities/celestial/sphereConnection';
	import Section from '../shared/Section.svelte';
	import InfoGrid from '../shared/InfoGrid.svelte';
	import { createEventDispatcher } from 'svelte';

	interface Props {
		sphereConnection: SphereConnection;
		parentEntity?: any;
	}

	let { sphereConnection, parentEntity }: Props = $props();

	const dispatch = createEventDispatcher();

	const basicInfo = $derived([
		{ label: 'Name', value: sphereConnection.name || 'Unnamed Connection' },
		{ label: 'From Sphere', value: sphereConnection.fromSphereName },
		{ label: 'To Sphere', value: sphereConnection.toSphereName },
		{ label: 'Connection Type', value: sphereConnection.connectionType },
		{ label: 'Travel Method', value: sphereConnection.travelMethod },
		{ label: 'One-Way', value: sphereConnection.isOneWay ? 'Yes' : 'No' },
		{ label: 'Commonality', value: sphereConnection.commonality },
		{ label: 'Travel Duration', value: sphereConnection.travelDuration }
	]);

	const accessInfo = $derived([
		{
			label: 'Access Conditions',
			value:
				sphereConnection.accessConditions.length > 0
					? sphereConnection.accessConditions.join(', ')
					: 'None'
		},
		{
			label: 'Single Access Point',
			value: sphereConnection.hasSingleAccessPoint ? 'Yes' : 'No'
		},
		...(sphereConnection.hasSingleAccessPoint && sphereConnection.accessPointDescription
			? [{ label: 'Access Point', value: sphereConnection.accessPointDescription }]
			: [])
	]);

	const requirementsInfo = $derived(
		sphereConnection.requirements.length > 0
			? sphereConnection.requirements.map((req) => ({ label: '•', value: req }))
			: [{ label: '', value: 'No special requirements' }]
	);

	const travelRulesInfo = $derived(
		sphereConnection.travelRules.length > 0
			? sphereConnection.travelRules.map((rule) => ({ label: '•', value: rule }))
			: [{ label: '', value: 'No special rules' }]
	);

	const behavioralInfo = $derived(
		sphereConnection.behavioralRequirements.length > 0
			? sphereConnection.behavioralRequirements.map((req) => ({ label: '•', value: req }))
			: [{ label: '', value: 'No behavioral requirements' }]
	);

	const problemsInfo = $derived(
		sphereConnection.journeyProblems.length > 0
			? sphereConnection.journeyProblems.map((problem) => ({ label: '•', value: problem }))
			: [{ label: '', value: 'No known problems' }]
	);
</script>

<div class="sphere-connection-viewer">
	<Section title="Connection Information">
		<InfoGrid items={basicInfo} />
	</Section>

	<Section title="Access Information">
		<InfoGrid items={accessInfo} />
	</Section>

	{#if sphereConnection.requirements.length > 0}
		<Section title="Requirements">
			<div class="list-section">
				{#each sphereConnection.requirements as requirement}
					<div class="list-item">• {requirement}</div>
				{/each}
			</div>
		</Section>
	{/if}

	<Section title="Travel Rules">
		<div class="list-section">
			{#if sphereConnection.travelRules.length > 0}
				{#each sphereConnection.travelRules as rule}
					<div class="list-item">• {rule}</div>
				{/each}
			{:else}
				<div class="empty-message">No special travel rules</div>
			{/if}
		</div>
	</Section>

	<Section title="Behavioral Requirements">
		<div class="list-section">
			{#if sphereConnection.behavioralRequirements.length > 0}
				{#each sphereConnection.behavioralRequirements as req}
					<div class="list-item">• {req}</div>
				{/each}
			{:else}
				<div class="empty-message">No behavioral requirements</div>
			{/if}
		</div>
	</Section>

	<Section title="Journey Problems">
		<div class="list-section danger">
			{#if sphereConnection.journeyProblems.length > 0}
				{#each sphereConnection.journeyProblems as problem}
					<div class="list-item warning">⚠ {problem}</div>
				{/each}
			{:else}
				<div class="empty-message">No known journey problems</div>
			{/if}
		</div>
	</Section>

	{#if sphereConnection.consequencesOfViolation}
		<Section title="Consequences of Violation">
			<div class="consequence-warning">
				<span class="warning-icon">⚠</span>
				<span>{sphereConnection.consequencesOfViolation}</span>
			</div>
		</Section>
	{/if}

	{#if sphereConnection.description}
		<Section title="Description">
			<p class="description-text">{sphereConnection.description}</p>
		</Section>
	{/if}
</div>

<style>
	.sphere-connection-viewer {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.list-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem 0;
	}

	.list-item {
		padding: 0.25rem 0;
		color: var(--text-primary, #e5e7eb);
	}

	.list-item.warning {
		color: var(--warning-color, #fbbf24);
	}

	.empty-message {
		color: var(--text-secondary, #9ca3af);
		font-style: italic;
	}

	.consequence-warning {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 0.375rem;
		color: var(--danger-color, #ef4444);
	}

	.warning-icon {
		font-size: 1.5rem;
	}

	.description-text {
		line-height: 1.6;
		color: var(--text-primary, #e5e7eb);
	}
</style>
