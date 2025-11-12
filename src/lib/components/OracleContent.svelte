<script lang="ts">
	import { parseOracleText, type ParsedOracle } from '$lib/utils/oracleTextParser';

	interface Props {
		description: string;
		showTitle?: boolean;
		showGeneral?: boolean;
	}

	let { description, showTitle = true, showGeneral = true }: Props = $props();

	let parsed = $derived(parseOracleText(description));
</script>

<div class="oracle-content">
	<!-- Title Section -->
	{#if showTitle}
		<div class="title-section">
			<div class="oracle-number">#{parsed.number}</div>
			<h2 class="oracle-title">{parsed.title}</h2>
		</div>
	{/if}

	<!-- General Section -->
	{#if showGeneral}
		<div class="section general-section">
		<h3 class="section-header">
			<span class="icon">📝</span>
			General
		</h3>
		<div class="general-grid">
			<div class="word-card">
				<span class="word-type">Noun</span>
				<span class="word-value">{parsed.general.noun}</span>
			</div>
			<div class="word-card">
				<span class="word-type">Verb</span>
				<span class="word-value">{parsed.general.verb}</span>
			</div>
			<div class="word-card">
				<span class="word-type">Adjective</span>
				<span class="word-value">{parsed.general.adjective}</span>
			</div>
			<div class="word-card">
				<span class="word-type">Adverb</span>
				<span class="word-value">{parsed.general.adverb}</span>
			</div>
		</div>
		<div class="qa-section">
			<div class="question-card">
				<span class="qa-label">Question</span>
				<span class="qa-value">{parsed.general.question}</span>
			</div>
			<div class="answer-card">
				<span class="qa-label">Detailed Answer</span>
				<p class="qa-text">{parsed.general.detailedAnswer}</p>
			</div>
		</div>
	</div>
	{/if}

	<!-- Social Sections -->
	{#if parsed.social.length > 0}
		<div class="section social-section">
			<h3 class="section-header">
				<span class="icon">💬</span>
				Social {parsed.social.length > 1 ? `(${parsed.social.length})` : ''}
			</h3>
			{#each parsed.social as social, idx}
				<div class="content-card">
					{#if parsed.social.length > 1}
						<div class="card-number">Social {idx + 1}</div>
					{/if}
					<p class="card-description">{social.description}</p>

					{#if social.role || social.context || social.choice || social.result}
						<div class="attributes-grid">
							{#if social.role}
								<div class="attribute">
									<span class="attr-label">Role:</span>
									<span class="attr-value">{social.role}</span>
								</div>
							{/if}
							{#if social.context}
								<div class="attribute">
									<span class="attr-label">Context:</span>
									<span class="attr-value">{social.context}</span>
								</div>
							{/if}
							{#if social.choice}
								<div class="attribute">
									<span class="attr-label">Choice:</span>
									<span class="attr-value">{social.choice}</span>
								</div>
							{/if}
							{#if social.result}
								<div class="attribute">
									<span class="attr-label">Result:</span>
									<span class="attr-value">{social.result}</span>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Combat Sections -->
	{#if parsed.combat.length > 0}
		<div class="section combat-section">
			<h3 class="section-header">
				<span class="icon">⚔️</span>
				Combat {parsed.combat.length > 1 ? `(${parsed.combat.length})` : ''}
			</h3>
			{#each parsed.combat as combat, idx}
				<div class="content-card">
					{#if parsed.combat.length > 1}
						<div class="card-number">Combat {idx + 1}</div>
					{/if}
					<p class="card-description">{combat.description}</p>

					{#if combat.randomEncounter}
						<div class="subsection">
							<div class="subsection-header">Random Encounter</div>
							<p class="subsection-text">{combat.randomEncounter}</p>
						</div>
					{/if}

					{#if combat.outcome || combat.targeting || combat.role || combat.roleSize || combat.stance}
						<div class="attributes-grid">
							{#if combat.outcome}
								<div class="attribute">
									<span class="attr-label">Outcome:</span>
									<span class="attr-value">{combat.outcome}</span>
								</div>
							{/if}
							{#if combat.targeting}
								<div class="attribute">
									<span class="attr-label">Targeting:</span>
									<span class="attr-value">{combat.targeting}</span>
								</div>
							{/if}
							{#if combat.role}
								<div class="attribute">
									<span class="attr-label">Role:</span>
									<span class="attr-value">{combat.role}</span>
								</div>
							{/if}
							{#if combat.roleSize}
								<div class="attribute">
									<span class="attr-label">Role Size:</span>
									<span class="attr-value">{combat.roleSize}</span>
								</div>
							{/if}
							{#if combat.stance}
								<div class="attribute">
									<span class="attr-label">Stance:</span>
									<span class="attr-value">{combat.stance}</span>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Quest & Encounter Section -->
	{#if parsed.questEncounter.newQuest || parsed.questEncounter.questDevelopment || parsed.questEncounter.reward || parsed.questEncounter.penalty}
		<div class="section quest-encounter-section">
			<h3 class="section-header">
				<span class="icon">🗺️</span>
				Quest & Encounter
			</h3>

			{#if parsed.questEncounter.newQuest}
				<div class="quest-card new-quest">
					<div class="quest-card-header">🎯 New Quest</div>
					<p class="quest-card-text">{parsed.questEncounter.newQuest}</p>
				</div>
			{/if}

			{#if parsed.questEncounter.questDevelopment}
				<div class="quest-card development">
					<div class="quest-card-header">📈 Quest Development</div>
					<p class="quest-card-text">{parsed.questEncounter.questDevelopment}</p>
				</div>
			{/if}

			{#if parsed.questEncounter.reward}
				<div class="quest-card reward">
					<div class="quest-card-header">🎁 Reward</div>
					<p class="quest-card-text">{parsed.questEncounter.reward}</p>
				</div>
			{/if}

			{#if parsed.questEncounter.penalty}
				<div class="quest-card penalty">
					<div class="quest-card-header">⚠️ Penalty</div>
					<p class="quest-card-text">{parsed.questEncounter.penalty}</p>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Quest Section -->
	{#if parsed.quest.archetype || parsed.quest.sub}
		<div class="section quest-section">
			<h3 class="section-header">
				<span class="icon">🎲</span>
				Quest Type
			</h3>
			<div class="quest-type-badges">
				{#if parsed.quest.archetype}
					<div class="quest-badge archetype">
						<span class="badge-label">Archetype:</span>
						<span class="badge-value">{parsed.quest.archetype}</span>
					</div>
				{/if}
				{#if parsed.quest.sub}
					<div class="quest-badge sub">
						<span class="badge-label">Sub:</span>
						<span class="badge-value">{parsed.quest.sub}</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.oracle-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding: 0.5rem;
	}

	/* Title Section */
	.title-section {
		text-align: center;
		padding: 1.5rem;
		background: linear-gradient(135deg, rgb(168 85 247 / 0.2), rgb(192 132 252 / 0.1));
		border-radius: 0.75rem;
		border: 2px solid rgb(168 85 247 / 0.3);
	}

	.oracle-number {
		font-size: 0.875rem;
		color: rgb(216 180 254 / 0.8);
		font-weight: 600;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.oracle-title {
		font-size: 2rem;
		font-weight: bold;
		color: white;
		margin: 0;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	/* Section Styles */
	.section {
		background: rgb(30 27 75 / 0.3);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.75rem;
		padding: 1.5rem;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 1.25rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin: 0 0 1rem 0;
		padding-bottom: 0.75rem;
		border-bottom: 2px solid rgb(168 85 247 / 0.2);
	}

	.icon {
		font-size: 1.5rem;
	}

	/* General Section */
	.general-section {
		background: linear-gradient(135deg, rgb(59 130 246 / 0.1), rgb(30 27 75 / 0.3));
		border-color: rgb(59 130 246 / 0.3);
	}

	.general-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.word-card {
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(59 130 246 / 0.3);
		border-radius: 0.5rem;
		text-align: center;
	}

	.word-type {
		font-size: 0.75rem;
		color: rgb(147 197 253);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.25rem;
	}

	.word-value {
		font-size: 1.125rem;
		color: white;
		font-weight: 500;
	}

	.qa-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.question-card,
	.answer-card {
		padding: 1rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(59 130 246 / 0.3);
		border-radius: 0.5rem;
	}

	.qa-label {
		display: block;
		font-size: 0.75rem;
		color: rgb(147 197 253);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.5rem;
	}

	.qa-value {
		font-size: 1.125rem;
		color: white;
		font-weight: 500;
	}

	.qa-text {
		color: rgb(216 180 254);
		line-height: 1.6;
		margin: 0;
	}

	/* Social Section */
	.social-section {
		background: linear-gradient(135deg, rgb(34 197 94 / 0.1), rgb(30 27 75 / 0.3));
		border-color: rgb(34 197 94 / 0.3);
	}

	/* Combat Section */
	.combat-section {
		background: linear-gradient(135deg, rgb(239 68 68 / 0.1), rgb(30 27 75 / 0.3));
		border-color: rgb(239 68 68 / 0.3);
	}

	/* Content Cards */
	.content-card {
		padding: 1rem;
		background: rgb(30 27 75 / 0.4);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.content-card:last-child {
		margin-bottom: 0;
	}

	.card-number {
		font-size: 0.875rem;
		color: rgb(216 180 254 / 0.7);
		font-weight: 600;
		margin-bottom: 0.75rem;
	}

	.card-description {
		color: rgb(216 180 254);
		line-height: 1.6;
		margin: 0 0 1rem 0;
	}

	.subsection {
		margin-top: 1rem;
		padding: 1rem;
		background: rgb(30 27 75 / 0.6);
		border-left: 3px solid rgb(168 85 247);
		border-radius: 0.25rem;
	}

	.subsection-header {
		font-size: 0.875rem;
		color: rgb(216 180 254);
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	.subsection-text {
		color: rgb(216 180 254 / 0.9);
		line-height: 1.6;
		margin: 0;
		font-size: 0.875rem;
	}

	.attributes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 0.5rem;
	}

	.attribute {
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		background: rgb(30 27 75 / 0.6);
		border-radius: 0.25rem;
	}

	.attr-label {
		font-size: 0.75rem;
		color: rgb(216 180 254 / 0.7);
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.attr-value {
		color: white;
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Quest & Encounter Section */
	.quest-encounter-section {
		background: linear-gradient(135deg, rgb(251 146 60 / 0.1), rgb(30 27 75 / 0.3));
		border-color: rgb(251 146 60 / 0.3);
	}

	.quest-card {
		padding: 1rem;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.quest-card:last-child {
		margin-bottom: 0;
	}

	.quest-card.new-quest {
		background: rgb(59 130 246 / 0.15);
		border: 1px solid rgb(59 130 246 / 0.3);
	}

	.quest-card.development {
		background: rgb(168 85 247 / 0.15);
		border: 1px solid rgb(168 85 247 / 0.3);
	}

	.quest-card.reward {
		background: rgb(34 197 94 / 0.15);
		border: 1px solid rgb(34 197 94 / 0.3);
	}

	.quest-card.penalty {
		background: rgb(239 68 68 / 0.15);
		border: 1px solid rgb(239 68 68 / 0.3);
	}

	.quest-card-header {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin-bottom: 0.5rem;
	}

	.quest-card-text {
		color: rgb(216 180 254 / 0.9);
		line-height: 1.6;
		margin: 0;
		font-size: 0.875rem;
	}

	/* Quest Section */
	.quest-section {
		background: linear-gradient(135deg, rgb(168 85 247 / 0.1), rgb(30 27 75 / 0.3));
		border-color: rgb(168 85 247 / 0.3);
	}

	.quest-type-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.quest-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgb(168 85 247 / 0.2);
		border: 1px solid rgb(168 85 247 / 0.4);
		border-radius: 9999px;
	}

	.badge-label {
		font-size: 0.75rem;
		color: rgb(216 180 254 / 0.7);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.badge-value {
		font-size: 0.875rem;
		color: white;
		font-weight: 500;
	}
</style>
