<script lang="ts">
	import type { Character } from '$lib/entities/character/character';
	import type { Villain } from '$lib/entities/character/villain';
	import type { Artefact } from '$lib/entities/artefact/artefact';
	import type { Dungeon } from '$lib/entities/dungeon/dungeon';
	import type { Monster } from '$lib/entities/monster/monster';
	import type { Scene } from '$lib/entities/scene/scene';
	import type { Clue } from '$lib/entities/clue/clue';
	import type { Adventure } from '$lib/entities/adventure/adventure';
	import type { Region } from '$lib/entities/location/region';
	import type { Building } from '$lib/entities/location/building';
	import type { Settlement } from '$lib/entities/location/settlement';
	import type { HexTile } from '$lib/entities/location/hexTile';
	import type { Talent } from '$lib/entities/talent/talent';
	import type { Trap } from '$lib/entities/dungeon/trap';
	import type { StoryBeat } from '$lib/entities/adventure/storyBeat';
	import type { Faction } from '$lib/entities/faction/faction';
	import type { Quest } from '$lib/entities/quest/quest';
	import type { Event } from '$lib/entities/event/event';
	import type { Rumor } from '$lib/entities/rumor/rumor';
	import type { Prophecy } from '$lib/entities/prophecy/prophecy';
	import type { Illness } from '$lib/entities/illness/illness';
	import type { Spell } from '$lib/entities/spell/spell';
	import type { God } from '$lib/entities/god/god';
	import type { Ritual } from '$lib/entities/ritual/ritual';
	import type { Entrance } from '$lib/entities/dungeon/entrance';
	import type { Treasure } from '$lib/entities/dungeon/treasure';
	import type { Sign } from '$lib/entities/other/sign';
	import type { InitialMeeting } from '$lib/entities/adventure/initialMeeting';
	import type { Nation } from '$lib/entities/location/nation';
	import type { Continent } from '$lib/entities/location/continent';
	import type { Organization } from '$lib/entities/faction/organization';
	import type { Vehicle } from '$lib/entities/vehicle/vehicle';
	import type { WeatherEvent } from '$lib/entities/event/weatherEvent';

	interface Props {
		entity: any;
		entityType: string;
	}

	let { entity, entityType }: Props = $props();
</script>

<div class="entity-viewer">
	{#if entityType === 'character'}
		{@const char = entity as Character}
		<div class="section">
			<h3 class="section-title">Basic Information</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{char.name || 'Unnamed'}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Race:</span>
					<span class="info-value">{char.race}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Gender:</span>
					<span class="info-value">{char.gender}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Profession:</span>
					<span class="info-value">{char.profession}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Alignment:</span>
					<span class="info-value">{char.alignment}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Nobility:</span>
					<span class="info-value">{char.nobility}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Attributes</h3>
			<div class="attributes-grid">
				<div class="attribute">
					<span class="attr-name">STR</span>
					<span class="attr-value">{char.attributes.strength}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">DEX</span>
					<span class="attr-value">{char.attributes.dexterity}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">CON</span>
					<span class="attr-value">{char.attributes.constitution}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">INT</span>
					<span class="attr-value">{char.attributes.intelligence}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">WIS</span>
					<span class="attr-value">{char.attributes.intuition}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">CHA</span>
					<span class="attr-value">{char.attributes.charisma}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">WIL</span>
					<span class="attr-value">{char.attributes.willpower}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">AGI</span>
					<span class="attr-value">{char.attributes.agility}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Personality (Big Five)</h3>
			<div class="personality-grid">
				<div class="personality-trait">
					<span class="trait-name">Conscientiousness:</span>
					<span class="trait-value">{char.bigFive.conscientiousness}</span>
				</div>
				<div class="personality-trait">
					<span class="trait-name">Agreeableness:</span>
					<span class="trait-value">{char.bigFive.agreeableness}</span>
				</div>
				<div class="personality-trait">
					<span class="trait-name">Neuroticism:</span>
					<span class="trait-value">{char.bigFive.neuroticism}</span>
				</div>
				<div class="personality-trait">
					<span class="trait-name">Openness:</span>
					<span class="trait-value">{char.bigFive.openness}</span>
				</div>
				<div class="personality-trait">
					<span class="trait-name">Extraversion:</span>
					<span class="trait-value">{char.bigFive.extraversion}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Special Features</h3>
			<div class="info-grid">
				{#if char.advantage}
					<div class="info-item">
						<span class="info-label">Advantage:</span>
						<span class="info-value positive">{char.advantage}</span>
					</div>
				{/if}
				{#if char.disadvantage}
					<div class="info-item">
						<span class="info-label">Disadvantage:</span>
						<span class="info-value negative">{char.disadvantage}</span>
					</div>
				{/if}
				{#if char.curse}
					<div class="info-item">
						<span class="info-label">Curse:</span>
						<span class="info-value negative">{char.curse}</span>
					</div>
				{/if}
				<div class="info-item">
					<span class="info-label">Motivation:</span>
					<span class="info-value">{char.motivation}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Device:</span>
					<span class="info-value">{char.device}</span>
				</div>
			</div>
		</div>
	{:else if entityType === 'villain'}
		{@const villain = entity as Villain}
		<div class="section">
			<h3 class="section-title">Villain Profile</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{villain.name || 'Unnamed'}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Race:</span>
					<span class="info-value">{villain.race}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Gender:</span>
					<span class="info-value">{villain.gender}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Profession:</span>
					<span class="info-value">{villain.profession}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Alignment:</span>
					<span class="info-value">{villain.alignment}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Shadow Archetype:</span>
					<span class="info-value negative">{villain.archetype}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Evil Scheme</h3>
			<p class="scheme-text">{villain.scheme}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Attributes</h3>
			<div class="attributes-grid">
				<div class="attribute">
					<span class="attr-name">STR</span>
					<span class="attr-value">{villain.attributes.strength}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">DEX</span>
					<span class="attr-value">{villain.attributes.dexterity}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">CON</span>
					<span class="attr-value">{villain.attributes.constitution}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">INT</span>
					<span class="attr-value">{villain.attributes.intelligence}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">WIS</span>
					<span class="attr-value">{villain.attributes.intuition}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">CHA</span>
					<span class="attr-value">{villain.attributes.charisma}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">WIL</span>
					<span class="attr-value">{villain.attributes.willpower}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">AGI</span>
					<span class="attr-value">{villain.attributes.agility}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Personality (Big Five)</h3>
			<div class="personality-grid">
				<div class="personality-trait">
					<span class="trait-name">Conscientiousness:</span>
					<span class="trait-value">{villain.bigFive.conscientiousness}</span>
				</div>
				<div class="personality-trait">
					<span class="trait-name">Agreeableness:</span>
					<span class="trait-value">{villain.bigFive.agreeableness}</span>
				</div>
				<div class="personality-trait">
					<span class="trait-name">Neuroticism:</span>
					<span class="trait-value">{villain.bigFive.neuroticism}</span>
				</div>
				<div class="personality-trait">
					<span class="trait-name">Openness:</span>
					<span class="trait-value">{villain.bigFive.openness}</span>
				</div>
				<div class="personality-trait">
					<span class="trait-name">Extraversion:</span>
					<span class="trait-value">{villain.bigFive.extraversion}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Special Features</h3>
			<div class="info-grid">
				{#if villain.advantage}
					<div class="info-item">
						<span class="info-label">Advantage:</span>
						<span class="info-value positive">{villain.advantage}</span>
					</div>
				{/if}
				{#if villain.disadvantage}
					<div class="info-item">
						<span class="info-label">Disadvantage:</span>
						<span class="info-value negative">{villain.disadvantage}</span>
					</div>
				{/if}
				{#if villain.curse}
					<div class="info-item">
						<span class="info-label">Curse:</span>
						<span class="info-value negative">{villain.curse}</span>
					</div>
				{/if}
				<div class="info-item">
					<span class="info-label">Motivation:</span>
					<span class="info-value">{villain.motivation}</span>
				</div>
			</div>
		</div>
	{:else if entityType === 'artefact'}
		{@const art = entity as Artefact}
		<div class="section">
			<h3 class="section-title">Artefact Details</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{art.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{art.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Quality:</span>
					<span class="info-value">{art.quality}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Material:</span>
					<span class="info-value">{art.material}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Rarity:</span>
					<span class="info-value">{art.rarity}</span>
				</div>
			</div>
		</div>

		{#if art.talents && art.talents.length > 0}
			<div class="section">
				<h3 class="section-title">Magical Properties</h3>
				<ul class="talent-list">
					{#each art.talents as talent}
						<li class="talent-item">{talent}</li>
					{/each}
				</ul>
			</div>
		{/if}
	{:else if entityType === 'monster'}
		{@const mon = entity as Monster}
		<div class="section">
			<h3 class="section-title">Monster Profile</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{mon.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Race(s):</span>
					<span class="info-value">{mon.races.join(', ')}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Gender:</span>
					<span class="info-value">{mon.gender}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Age:</span>
					<span class="info-value">{mon.age}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Number:</span>
					<span class="info-value">{mon.number}</span>
				</div>
				{#if mon.curse}
					<div class="info-item">
						<span class="info-label">Curse:</span>
						<span class="info-value negative">{mon.curse}</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Attributes</h3>
			<div class="attributes-grid">
				<div class="attribute">
					<span class="attr-name">STR</span>
					<span class="attr-value">{mon.attributes.strength}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">DEX</span>
					<span class="attr-value">{mon.attributes.dexterity}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">CON</span>
					<span class="attr-value">{mon.attributes.constitution}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">INT</span>
					<span class="attr-value">{mon.attributes.intelligence}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">WIS</span>
					<span class="attr-value">{mon.attributes.intuition}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">CHA</span>
					<span class="attr-value">{mon.attributes.charisma}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">WIL</span>
					<span class="attr-value">{mon.attributes.willpower}</span>
				</div>
				<div class="attribute">
					<span class="attr-name">AGI</span>
					<span class="attr-value">{mon.attributes.agility}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Behavior & Ecology</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Diet:</span>
					<span class="info-value">{mon.eaterType}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Reproduction:</span>
					<span class="info-value">{mon.reproduction}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Encounter Type:</span>
					<span class="info-value">{mon.encounterType}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Movement:</span>
					<span class="info-value">{mon.movementType}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Tracks:</span>
					<span class="info-value">{mon.tracks}</span>
				</div>
			</div>
		</div>

		{#if mon.talents && mon.talents.length > 0}
			<div class="section">
				<h3 class="section-title">Special Abilities</h3>
				<ul class="talent-list">
					{#each mon.talents as talent}
						<li class="talent-item">{talent}</li>
					{/each}
				</ul>
			</div>
		{/if}
	{:else if entityType === 'dungeon'}
		{@const dun = entity as Dungeon}
		<div class="section">
			<h3 class="section-title">Dungeon Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{dun.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Structure:</span>
					<span class="info-value">{dun.structure}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Entries:</span>
					<span class="info-value">{dun.entries}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Number of Rooms:</span>
					<span class="info-value">{dun.numberOfRooms}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Rooms</h3>
			<div class="rooms-list">
				{#each dun.rooms as room, index}
					<div class="room-card">
						<h4 class="room-title">{room.name}</h4>
						<div class="room-details">
							{#if room.furnishing}
								<div class="room-feature">
									<span class="feature-icon">🪑</span>
									<span class="feature-text">{room.furnishing}</span>
								</div>
							{/if}
							{#if room.obstacle}
								<div class="room-feature">
									<span class="feature-icon">⚠️</span>
									<span class="feature-text">{room.obstacle}</span>
								</div>
							{/if}
							{#if room.treasure}
								<div class="room-feature">
									<span class="feature-icon">💎</span>
									<span class="feature-text">{room.treasure}</span>
								</div>
							{/if}
							{#if room.trap}
								<div class="room-feature">
									<span class="feature-icon">🪤</span>
									<span class="feature-text">{room.trap}</span>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if entityType === 'scene'}
		{@const scene = entity as Scene}
		<div class="section">
			<h3 class="section-title">Scene Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{scene.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Location:</span>
					<span class="info-value">{scene.location}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Mood:</span>
					<span class="info-value">{scene.mood}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Purpose:</span>
					<span class="info-value">{scene.purpose}</span>
				</div>
			</div>
		</div>

		{#if scene.sensoryDetails && scene.sensoryDetails.length > 0}
			<div class="section">
				<h3 class="section-title">Sensory Details</h3>
				<ul class="talent-list">
					{#each scene.sensoryDetails as detail}
						<li class="talent-item">{detail}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{scene.description}</p>
		</div>
	{:else if entityType === 'clue'}
		{@const clue = entity as Clue}
		<div class="section">
			<h3 class="section-title">Clue Details</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{clue.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Source:</span>
					<span class="info-value">{clue.source}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Evidence Type:</span>
					<span class="info-value">{clue.object}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Truth Level:</span>
					<span class="info-value truth-level">{clue.truthLevel}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Conclusion:</span>
					<span class="info-value">{clue.conclusion}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Analysis</h3>
			<p class="description-text">{clue.description}</p>
		</div>
	{:else if entityType === 'adventure'}
		{@const adv = entity as Adventure}
		<div class="section">
			<h3 class="section-title">Adventure Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{adv.name}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Story Structure</h3>
			<div class="story-timeline">
				<div class="story-phase">
					<h4 class="phase-title">Beginning</h4>
					<p class="phase-content">{adv.beginning}</p>
				</div>

				<div class="story-phase">
					<h4 class="phase-title">Rising Action</h4>
					<ul class="phase-list">
						{#each adv.risingAction as event}
							<li class="phase-item">{event}</li>
						{/each}
					</ul>
				</div>

				<div class="story-phase climax-phase">
					<h4 class="phase-title">Climax</h4>
					<p class="phase-content">{adv.climax}</p>
				</div>

				<div class="story-phase">
					<h4 class="phase-title">Ending</h4>
					<p class="phase-content">{adv.ending}</p>
				</div>
			</div>
		</div>

		{#if adv.plotTropes && adv.plotTropes.length > 0}
			<div class="section">
				<h3 class="section-title">Plot Tropes</h3>
				<ul class="talent-list">
					{#each adv.plotTropes as trope}
						<li class="talent-item">{trope}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{adv.description}</p>
		</div>
	{:else if entityType === 'region'}
		{@const reg = entity as Region}
		<div class="section">
			<h3 class="section-title">Region Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{reg.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Landscape:</span>
					<span class="info-value">{reg.landscape}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Weather:</span>
					<span class="info-value">{reg.weather}</span>
				</div>
			</div>
		</div>

		{#if reg.resources && reg.resources.length > 0}
			<div class="section">
				<h3 class="section-title">Resources</h3>
				<ul class="talent-list">
					{#each reg.resources as resource}
						<li class="talent-item">{resource}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{reg.description}</p>
		</div>
	{:else if entityType === 'building'}
		{@const bld = entity as Building}
		<div class="section">
			<h3 class="section-title">Building Details</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{bld.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{bld.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Adjective:</span>
					<span class="info-value">{bld.adjective}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Quality:</span>
					<span class="info-value">{bld.quality}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{bld.description}</p>
		</div>
	{:else if entityType === 'settlement'}
		{@const set = entity as Settlement}
		<div class="section">
			<h3 class="section-title">Settlement Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{set.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Size:</span>
					<span class="info-value">{set.size}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Population:</span>
					<span class="info-value">{set.population.toLocaleString()}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Fame:</span>
					<span class="info-value">{set.fame}</span>
				</div>
			</div>
		</div>

		{#if set.events && set.events.length > 0}
			<div class="section">
				<h3 class="section-title">Recent Events</h3>
				<ul class="talent-list">
					{#each set.events as event}
						<li class="talent-item">{event}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{set.description}</p>
		</div>
	{:else if entityType === 'hexTile'}
		{@const hex = entity as HexTile}
		<div class="section">
			<h3 class="section-title">Hex Tile Information</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Coordinates:</span>
					<span class="info-value">({hex.coordinates.q}, {hex.coordinates.r})</span>
				</div>
				<div class="info-item">
					<span class="info-label">Terrain:</span>
					<span class="info-value">{hex.terrain}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Status:</span>
					<span class="info-value {hex.discovered ? 'positive' : ''}"
						>{hex.discovered ? 'Explored' : 'Unexplored'}</span
					>
				</div>
			</div>
		</div>

		{#if hex.features && hex.features.length > 0}
			<div class="section">
				<h3 class="section-title">Terrain Features</h3>
				<ul class="talent-list">
					{#each hex.features as feature}
						<li class="talent-item">{feature}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{hex.description}</p>
		</div>
	{:else if entityType === 'talent'}
		{@const tal = entity as Talent}
		<div class="section">
			<h3 class="section-title">Talent Information</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{tal.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Category:</span>
					<span class="info-value">{tal.category}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{tal.type}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{tal.description}</p>
		</div>
	{:else if entityType === 'trap'}
		{@const trp = entity as Trap}
		<div class="section">
			<h3 class="section-title">Trap Details</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{trp.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Trigger:</span>
					<span class="info-value negative">{trp.trigger}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Function:</span>
					<span class="info-value negative">{trp.function}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{trp.description}</p>
		</div>
	{:else if entityType === 'storyBeat'}
		{@const beat = entity as StoryBeat}
		<div class="section">
			<h3 class="section-title">Story Beat Information</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{beat.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Tension Level:</span>
					<span class="info-value">{beat.tension}/10</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Beat Description</h3>
			<p class="description-text">{beat.description}</p>
		</div>
	{:else if entityType === 'faction'}
		{@const fac = entity as Faction}
		<div class="section">
			<h3 class="section-title">Faction Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{fac.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Alignment:</span>
					<span class="info-value">{fac.alignment}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Size:</span>
					<span class="info-value">{fac.size}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Influence:</span>
					<span class="info-value">{fac.influence}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Wealth:</span>
					<span class="info-value">{fac.wealth}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Motivation:</span>
					<span class="info-value">{fac.motivation}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{fac.description}</p>
		</div>
	{:else if entityType === 'quest'}
		{@const qst = entity as Quest}
		<div class="section">
			<h3 class="section-title">Quest Details</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{qst.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{qst.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Difficulty:</span>
					<span class="info-value">{qst.difficulty}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Location:</span>
					<span class="info-value">{qst.location}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Quest Giver:</span>
					<span class="info-value">{qst.giver}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Reward:</span>
					<span class="info-value positive">{qst.reward}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Objective</h3>
			<p class="description-text">{qst.objective}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{qst.description}</p>
		</div>
	{:else if entityType === 'event'}
		{@const evt = entity as Event}
		<div class="section">
			<h3 class="section-title">Event Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{evt.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{evt.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Location:</span>
					<span class="info-value">{evt.location}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Impact:</span>
					<span class="info-value">{evt.impact}</span>
				</div>
			</div>
		</div>

		{#if evt.consequences && evt.consequences.length > 0}
			<div class="section">
				<h3 class="section-title">Consequences</h3>
				<ul class="talent-list">
					{#each evt.consequences as consequence}
						<li class="talent-item">{consequence}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Description</h3>
			<p class="description-text">{evt.description}</p>
		</div>
	{:else if entityType === 'rumor'}
		{@const rum = entity as Rumor}
		<div class="section">
			<h3 class="section-title">Rumor Information</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Source:</span>
					<span class="info-value">{rum.source}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Truth Level:</span>
					<span class="info-value truth-level">{rum.truthLevel}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Spread:</span>
					<span class="info-value">{rum.spread}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">The Rumor</h3>
			<p class="description-text">{rum.content}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Full Context</h3>
			<p class="description-text">{rum.description}</p>
		</div>
	{:else if entityType === 'prophecy'}
		{@const pro = entity as Prophecy}
		<div class="section">
			<h3 class="section-title">Prophecy Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Source:</span>
					<span class="info-value">{pro.source}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Timeframe:</span>
					<span class="info-value">{pro.timeframe}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Fulfillment:</span>
					<span class="info-value">{pro.fulfillment}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">The Prophecy</h3>
			<p class="scheme-text">{pro.text}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Interpretation</h3>
			<p class="description-text">{pro.interpretation}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{pro.description}</p>
		</div>
	{:else if entityType === 'illness'}
		{@const ill = entity as Illness}
		<div class="section">
			<h3 class="section-title">Illness Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{ill.adjective} {ill.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Duration:</span>
					<span class="info-value">{ill.time}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Age:</span>
					<span class="info-value">{ill.age}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Transmission & Origin</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Origin:</span>
					<span class="info-value">{ill.origin}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Transmission:</span>
					<span class="info-value">{ill.transmission}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Symptoms</h3>
			<div class="info-item">
				<span class="info-label">Initial Symptoms:</span>
				<div class="list-container">
					{#each ill.beginningSymptoms as symptom}
						<span class="list-item">{symptom}</span>
					{/each}
				</div>
			</div>
			<div class="info-item">
				<span class="info-label">Progressed Symptoms:</span>
				<div class="list-container">
					{#each ill.symptoms as symptom}
						<span class="list-item">{symptom}</span>
					{/each}
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Treatment & Effects</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Cure:</span>
					<span class="info-value">{ill.cure}</span>
				</div>
				<div class="info-item">
					<span class="info-label">World Effect:</span>
					<span class="info-value">{ill.worldEffect}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Lore</h3>
			<p class="description-text">{ill.lore}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{ill.description}</p>
		</div>
	{:else if entityType === 'spell'}
		{@const sp = entity as Spell}
		<div class="section">
			<h3 class="section-title">Spell Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Power:</span>
					<span class="info-value">{sp.power}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Complexity:</span>
					<span class="info-value">{sp.complexity}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Cost:</span>
					<span class="info-value">{sp.cost} mana</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Ability</h3>
			<p class="description-text">{sp.ability}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Casting Details</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Casting Time:</span>
					<span class="info-value">{sp.castingTime}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Duration:</span>
					<span class="info-value">{sp.duration}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Cooldown:</span>
					<span class="info-value">{sp.cooldown}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Range:</span>
					<span class="info-value">{sp.range}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Area of Effect:</span>
					<span class="info-value">{sp.areaOfEffect}</span>
				</div>
				{#if sp.additionalPreparation}
					<div class="info-item">
						<span class="info-label">Preparation:</span>
						<span class="info-value">{sp.additionalPreparation}</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Limitations & Counters</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Limitation:</span>
					<span class="info-value">{sp.limitation}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Counter:</span>
					<span class="info-value">{sp.counter}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Lore</h3>
			<p class="description-text">{sp.lore}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{sp.description}</p>
		</div>
	{:else if entityType === 'god'}
		{@const gd = entity as God}
		<div class="section">
			<h3 class="section-title">Divine Identity</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Byname:</span>
					<span class="info-value">{gd.byname}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Status:</span>
					<span class="info-value">{gd.status}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Habitat:</span>
					<span class="info-value">{gd.habitat}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Domains</h3>
			<div class="list-container">
				{#each gd.domains as domain}
					<span class="list-item">{domain}</span>
				{/each}
			</div>
		</div>

		{#if gd.character}
			<div class="section">
				<h3 class="section-title">Mortal Aspect</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="info-label">Name:</span>
						<span class="info-value">{gd.character.name}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Race:</span>
						<span class="info-value">{gd.character.race}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Profession:</span>
						<span class="info-value">{gd.character.profession}</span>
					</div>
					<div class="info-item">
						<span class="info-label">Alignment:</span>
						<span class="info-value">{gd.character.alignment}</span>
					</div>
				</div>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Sacred Symbols</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Sacred Animal:</span>
					<span class="info-value">{gd.sacredAnimal}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Place of Worship:</span>
					<span class="info-value">{gd.temple}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Words of the Faithful</h3>
			<p class="description-text">"{gd.quoteDisciple}"</p>
		</div>

		<div class="section">
			<h3 class="section-title">Words of the Skeptics</h3>
			<p class="scheme-text">"{gd.quoteCautionary}"</p>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{gd.description}</p>
		</div>
	{:else if entityType === 'ritual'}
		{@const rit = entity as Ritual}
		<div class="section">
			<h3 class="section-title">Ritual Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Time:</span>
					<span class="info-value">{rit.time}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Location:</span>
					<span class="info-value">{rit.location}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Participants:</span>
					<span class="info-value">{rit.exclusiveness}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Preparation</h3>
			<p class="description-text">{rit.preparation}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Ritual Ceremony</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Invocation:</span>
					<span class="info-value">{rit.invocation}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Action:</span>
					<span class="info-value">{rit.action}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Offering:</span>
					<span class="info-value">{rit.offering}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Culmination:</span>
					<span class="info-value">{rit.culmination}</span>
				</div>
			</div>
		</div>

		{#if rit.feast}
			<div class="section">
				<h3 class="section-title">Celebration</h3>
				<p class="description-text">After the ritual: {rit.feast}</p>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Magical Effect</h3>
			<p class="scheme-text">{rit.effect}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{rit.description}</p>
		</div>
	{:else if entityType === 'entrance'}
		{@const entr = entity as Entrance}
		<div class="section">
			<h3 class="section-title">Entrance Details</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{entr.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Condition:</span>
					<span class="info-value">{entr.adjective}</span>
				</div>
			</div>
		</div>

		{#if entr.traps && entr.traps.length > 0}
			<div class="section">
				<h3 class="section-title">Traps ({entr.traps.length})</h3>
				{#each entr.traps as trap, index}
					<div class="subsection">
						<h4 class="subsection-title">Trap {index + 1}</h4>
						<div class="info-grid">
							<div class="info-item">
								<span class="info-label">Trigger:</span>
								<span class="info-value">{trap.trigger}</span>
							</div>
							<div class="info-item">
								<span class="info-label">Function:</span>
								<span class="info-value">{trap.function}</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="section">
				<h3 class="section-title">Security</h3>
				<p class="description-text">No traps detected. The entrance appears safe.</p>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{entr.description}</p>
		</div>
	{:else if entityType === 'treasure'}
		{@const tres = entity as Treasure}
		<div class="section">
			<h3 class="section-title">Treasure Details</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Content:</span>
					<span class="info-value">{tres.content}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Quantity:</span>
					<span class="info-value">{tres.quantity}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Hidden:</span>
					<span class="info-value">{tres.isHidden ? 'Yes' : 'No'}</span>
				</div>
			</div>
		</div>

		{#if tres.isHidden}
			<div class="section">
				<h3 class="section-title">Hiding Method</h3>
				<p class="description-text">The treasure is {tres.hiddenDescription}.</p>
			</div>
		{:else}
			<div class="section">
				<h3 class="section-title">Location</h3>
				<p class="description-text">The treasure is left in the open, easily accessible.</p>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{tres.description}</p>
		</div>
	{:else if entityType === 'sign'}
		{@const sgn = entity as Sign}
		<div class="section">
			<h3 class="section-title">Heraldic Symbol</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Symbol:</span>
					<span class="info-value">{sgn.symbol}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Form:</span>
					<span class="info-value">{sgn.form}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Colors</h3>
			<div class="info-grid">
				{#each sgn.colors as color}
					<div class="info-item">
						<span class="info-value">{color}</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Meaning</h3>
			<p class="description-text">This symbol {sgn.meaning}.</p>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{sgn.description}</p>
		</div>
	{:else if entityType === 'initialMeeting'}
		{@const meet = entity as InitialMeeting}
		<div class="section">
			<h3 class="section-title">Meeting Details</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{meet.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Location:</span>
					<span class="info-value">{meet.location}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Circumstances:</span>
					<span class="info-value">{meet.circumstances}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Tone:</span>
					<span class="info-value">{meet.tone}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{meet.description}</p>
		</div>
	{:else if entityType === 'nation'}
		{@const nat = entity as Nation}
		<div class="section">
			<h3 class="section-title">Nation Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{nat.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Character:</span>
					<span class="info-value">{nat.adjective}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Government:</span>
					<span class="info-value">{nat.government}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Population:</span>
					<span class="info-value">{nat.population}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Geography & Resources</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Landscape:</span>
					<span class="info-value">{nat.landscape}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Primary Resource:</span>
					<span class="info-value">{nat.primaryResource}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Technology</h3>
			<p class="description-text">Technology Level: {nat.technologyLevel}</p>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{nat.description}</p>
		</div>
	{:else if entityType === 'continent'}
		{@const cont = entity as Continent}
		<div class="section">
			<h3 class="section-title">Continent Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{cont.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Size:</span>
					<span class="info-value">{cont.size}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Climate:</span>
					<span class="info-value">{cont.climate}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Geography</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Dominant Landscape:</span>
					<span class="info-value">{cont.dominantLandscape}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Primary Weather:</span>
					<span class="info-value">{cont.primaryWeather}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{cont.description}</p>
		</div>
	{:else if entityType === 'organization'}
		{@const org = entity as Organization}
		<div class="section">
			<h3 class="section-title">Organization Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{org.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{org.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Alignment:</span>
					<span class="info-value">{org.alignment}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Size:</span>
					<span class="info-value">{org.size}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Power & Influence</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Wealth:</span>
					<span class="info-value">{org.wealth}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Influence:</span>
					<span class="info-value">{org.influence}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Reputation:</span>
					<span class="info-value">{org.reputation}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Leadership & Goals</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Headquarters:</span>
					<span class="info-value">{org.headquarters}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Leader:</span>
					<span class="info-value">{org.leader}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Goals:</span>
					<span class="info-value">{org.goals}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{org.description}</p>
		</div>
	{:else if entityType === 'vehicle'}
		{@const veh = entity as Vehicle}
		<div class="section">
			<h3 class="section-title">Vehicle Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{veh.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{veh.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Size:</span>
					<span class="info-value">{veh.size}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Quality:</span>
					<span class="info-value">{veh.quality}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Performance</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Propulsion:</span>
					<span class="info-value">{veh.propulsion}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Speed:</span>
					<span class="info-value">{veh.speed}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Capacity:</span>
					<span class="info-value">{veh.capacity}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Material:</span>
					<span class="info-value">{veh.material}</span>
				</div>
			</div>
		</div>

		{#if veh.specialFeatures && veh.specialFeatures.length > 0}
			<div class="section">
				<h3 class="section-title">Special Features</h3>
				<ul class="features-list">
					{#each veh.specialFeatures as feature}
						<li class="feature-item">{feature}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{veh.description}</p>
		</div>
	{:else if entityType === 'weatherEvent'}
		{@const weather = entity as WeatherEvent}
		<div class="section">
			<h3 class="section-title">Weather Event Overview</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Name:</span>
					<span class="info-value">{weather.name}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Type:</span>
					<span class="info-value">{weather.type}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Severity:</span>
					<span class="info-value">{weather.severity}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Duration:</span>
					<span class="info-value">{weather.duration}</span>
				</div>
			</div>
		</div>

		<div class="section">
			<h3 class="section-title">Conditions</h3>
			<div class="info-grid">
				<div class="info-item">
					<span class="info-label">Weather:</span>
					<span class="info-value">{weather.weather}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Character:</span>
					<span class="info-value">{weather.adjective}</span>
				</div>
				<div class="info-item">
					<span class="info-label">Location:</span>
					<span class="info-value">{weather.location}</span>
				</div>
			</div>
		</div>

		{#if weather.effects && weather.effects.length > 0}
			<div class="section">
				<h3 class="section-title">Effects</h3>
				<ul class="features-list">
					{#each weather.effects as effect}
						<li class="feature-item">{effect}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<div class="section">
			<h3 class="section-title">Full Description</h3>
			<p class="description-text">{weather.description}</p>
		</div>
	{/if}
</div>

<style>
	.entity-viewer {
		padding: 1.5rem;
		color: white;
		max-height: 60vh;
		overflow-y: auto;
	}

	.section {
		margin-bottom: 2rem;
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid rgb(168 85 247 / 0.2);
	}

	.info-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.75rem;
	}

	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.info-label {
		font-size: 0.75rem;
		color: rgb(216 180 254 / 0.7);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 500;
	}

	.info-value {
		font-size: 0.875rem;
		color: white;
		font-weight: 500;
	}

	.info-value.positive {
		color: rgb(134 239 172);
	}

	.info-value.negative {
		color: rgb(252 165 165);
	}

	.attributes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 0.75rem;
	}

	.attribute {
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		padding: 0.75rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
	}

	.attr-name {
		font-size: 0.75rem;
		color: rgb(216 180 254 / 0.7);
		text-transform: uppercase;
		font-weight: 600;
		letter-spacing: 0.05em;
	}

	.attr-value {
		font-size: 1.5rem;
		color: white;
		font-weight: bold;
	}

	.personality-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.personality-trait {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.375rem;
	}

	.trait-name {
		font-size: 0.875rem;
		color: rgb(216 180 254);
	}

	.trait-value {
		font-size: 0.875rem;
		color: white;
		font-weight: 600;
	}

	.talent-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.talent-item {
		padding: 0.75rem;
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.375rem;
		color: rgb(216 180 254);
		font-size: 0.875rem;
	}

	.scheme-text {
		padding: 1rem;
		background: rgb(88 28 135 / 0.2);
		border-left: 4px solid rgb(220 38 38);
		border-radius: 0.5rem;
		color: rgb(252 165 165);
		font-size: 1rem;
		font-style: italic;
		margin: 0;
	}

	.rooms-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.room-card {
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.room-title {
		font-size: 1rem;
		font-weight: 600;
		color: white;
		margin: 0 0 0.75rem 0;
	}

	.room-details {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.room-feature {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.375rem;
	}

	.feature-icon {
		font-size: 1rem;
		flex-shrink: 0;
	}

	.feature-text {
		font-size: 0.875rem;
		color: rgb(216 180 254);
	}

	.description-text {
		font-size: 0.875rem;
		color: rgb(216 180 254);
		line-height: 1.6;
		margin: 0;
		padding: 1rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.5rem;
		border-left: 4px solid rgb(168 85 247);
	}

	.truth-level {
		font-weight: 600;
		color: rgb(250 204 21);
	}

	.story-timeline {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.story-phase {
		background: rgb(30 27 75 / 0.5);
		border: 1px solid rgb(168 85 247 / 0.2);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.climax-phase {
		border-color: rgb(220 38 38 / 0.5);
		background: rgb(88 28 135 / 0.2);
	}

	.phase-title {
		font-size: 1rem;
		font-weight: 600;
		color: rgb(216 180 254);
		margin: 0 0 0.75rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.climax-phase .phase-title {
		color: rgb(252 165 165);
	}

	.phase-content {
		font-size: 0.875rem;
		color: rgb(216 180 254);
		line-height: 1.6;
		margin: 0;
	}

	.phase-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.phase-item {
		font-size: 0.875rem;
		color: rgb(216 180 254);
		padding: 0.5rem 0.75rem;
		background: rgb(30 27 75 / 0.3);
		border-radius: 0.375rem;
		border-left: 3px solid rgb(168 85 247);
	}
</style>
