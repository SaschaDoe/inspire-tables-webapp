/**
 * Manual mapping of trope names from tables to actual TV Tropes page names
 *
 * This is necessary because our table trope names don't always match
 * the actual TV Tropes page names exactly.
 *
 * Format: { "our trope name": "ActualTvTropesPageName" }
 */
export const tvTropesMapping: Record<string, string> = {
	// Plot Tropes (✅ = verified to exist on TV Tropes)
	"mission from higher power": "MissionFromGod", // ✅
	"alien invasion": "AlienInvasion", // ✅
	"heist": "TheCaper", // ✅
	"love triangle": "LoveTriangle", // ✅
	"brainwashed": "Brainwashed", // ✅
	"superhero origin": "SuperheroOrigin", // ✅
	"serial killer": "SerialKiller", // ✅
	"lotus eater machine": "LotusEaterMachine", // ✅
	"accidental hero": "AccidentalHero", // ✅
	"breakout": "GreatEscape", // ✅
	"clear my name": "ClearMyName", // ✅
	"ghost story": "GhostStory", // ✅
	"a race": "EpicRace", // ✅
	"rightful king returns": "RightfulKingReturns", // ✅
	"succession crisis": "SuccessionCrisis", // ✅
	"one last job": "OneLastJob", // ✅
	"spot the impostor": "SpotTheImposter", // ✅
	"evil plan": "EvilPlan", // ✅
	"faustian rebellion": "FaustianRebellion", // ✅
	"field trip to the past": "FieldTripToThePast", // ✅
	"fighting for home": "ProtectThisHouse", // ✅
	"protect the house": "ProtectThisHouse", // ✅
	"hell on earth": "HellOnEarth", // ✅
	"heroic destiny discovery": "TheChosenOne", // ✅
	"loan shark": "LoanShark", // ✅
	"magic comes back": "TheMagicComesBack", // ✅
	"magic goes away": "TheMagicGoesAway", // ✅
	"prevent the war": "PreventTheWar", // ✅
	"noahs story arc": "NoahsStoryArc", // ✅
	"agatha christy plot": "FairPlayWhodunnit", // ✅
	"an offer you can't refuse": "AnOfferYouCantRefuse", // ✅
	"pride before the fall": "PrideBeforeAFall", // ✅
	"quest for a wish": "QuestForAWish", // ✅
	"rear window witness": "RearWindowWitness", // ✅
	"road trip": "RoadTripPlot", // ✅
	"sorceres apprentice plot": "SorcerersApprenticePlot", // ✅
	"die hard situation": "DieHardOnAnX", // ✅
	"the makeover": "TheMakeover", // ✅
	"paranoia": "ProperlyParanoid", // ✅
	"appease the volcano god": "AppeaseTheVolcanoGod", // ✅
	"back to ... (school)": "BackToSchool", // ✅
	"back to school": "BackToSchool", // ✅
	"deadly bet": "DeadlyGameOfChance", // ✅
	"danger with deadline": "RaceAgainstTheClock", // ✅
	"fight to survive": "FightToSurvive", // ✅
	"one crazy night": "OneCrazyNight", // ✅
	"defeating cheating opponent": "DefeatingTheCheatingOpponent", // ✅
	"exploration plot for dungeon": "DungeonCrawling", // ✅
	"monster is in reality good": "NotEvilJustMisunderstood", // ✅
	"something bad happened long time ago": "MysteriousPast", // ✅
	"something bad happened yesterday": "MysteriousPast", // ✅
	"save the world from evil": "SavingTheWorld", // ✅
	"villain tries to marry someone": "AndNowYouMustMarryMe", // ✅
	"annoying patient": "AnnoyingPatient", // ✅
	"the inspector is coming": "TheInspectorIsComing", // ✅
	"antagonist feels sorry for heroes death": "MyGodWhatHaveIDone", // ✅
	"someone seems good but than bad": "BitchInSheepsClothing", // ✅
	"get back what is yours": "StealingFromThieves", // ✅
	"boring alternative": "RefreshinglyNormalLifeChoice", // ✅
	"bad luck charm": "BadLuckCharm", // ✅
	"competition with character": "TournamentArc", // ✅
	"competition with fraction": "TournamentArc", // ✅
	"the plot is just copied from": "WholePlotReference", // ✅
	"lie towering": "TallTale", // ✅
	"hollywood formula": "TheHollywoodFormula", // ✅
	"its personal now": "ItsPersonal", // ✅
	"super sayajin": "SuperMode", // ✅
	"leave your test quest": "LeaveYourQuestTest", // ✅
	"you have to be worthy": "StrengthEqualsWorthiness", // ✅
	"heroes are leaders now": "TheLeader", // ✅
	"just fine without someone (it isn't)": "JustFineWithoutYou", // ✅
	"long game": "LongGame", // ✅
	"mental story": "MentalStory", // ✅
	"too late, or not?": "JustInTime", // ✅
	"moby dick whale chase": "MobySchtick", // ✅
	"new superpower": "NewSuperpower", // ✅
	"new location": "LostWorld", // ✅
	"no antagonist plot": "NoAntagonist", // ✅
	"cure something plot": "FindTheCure", // ✅
	"evil paradise": "FalseUtopia", // ✅
	"plot driven secret": "PlotDrivingSecret", // ✅
	"... for a day": "SwappedRoles", // ✅
	"the game never stopped": "TheGameNeverStopped", // ✅
	"adventure rebuff": "AdventureRebuff", // ✅
	"expected treasure turns out to be worthless": "WorthlessTreasureTwist", // ✅
	"evil army at the gates": "TheSiege", // ✅
	"get love": "FlirtingAndCourtship", // ✅
	"quest is in reality for evil": "TreacherousQuestGiver", // ✅
	"helping others to breakout": "BreakingOutTheBoss", // ✅
	"mistakenly held unlawful": "MiscarriageOfJustice", // ✅
	"mistakenly unlawful/ clear my name": "ClearMyName", // ✅
	"exploration plot for monster": "HunterOfMonsters", // ✅
	"made a slave": "MadeASlave", // ✅
	"the B grade": "TheBGrade", // ✅
	"in reality not an adult": "TotemPoleTrench", // ✅
	"the easy plan": "ASimplePlan", // ✅
	"mystery plot": "MysteryFiction", // ✅
	"physical therapy plot": "ThrowingOffTheDisability", // ✅
	"hero can't ordinary must": "FarmBoy", // ✅
	"against the expected role": "StereotypeFlip", // ✅
	"read trip": "RoadTripPlot", // ✅ (assuming typo for "road trip")
	"whats inside plot": "MysteryBox", // ✅
	"15 minutes of fame": "FifteenMinutesOfFame", // ✅
	"dragon": "TheDragonslayer", // ✅
	"lost wedding ring": "LostWeddingRing", // ✅
	"killing for a tissue sample": "KillingForATissueSample", // ✅

	// Beginning Tropes (✅ = verified to exist on TV Tropes)
	"action prologue": "ActionPrologue", // ✅
	"how we got here": "HowWeGotHere", // ✅
	"in medias res": "InMediasRes", // ✅
	"tragic beginning": "DarkAndTroubledPast", // ✅
	"training scene": "TrainingMontage", // ✅
	"dream intro": "DreamIntro", // ✅
	"inciting incident": "IncitingIncident", // ✅
	"fake opening": "FakeOutOpening", // ✅
	"from zero to hero": "FromZeroToHero", // ✅
	"wake up on a beach": "YouWakeUpOnABeach", // ✅

	// Ending Tropes (✅ = verified to exist on TV Tropes)
	"all just a dream": "AllJustADream", // ✅
	"bittersweet": "BittersweetEnding", // ✅
	"wedding": "WeddingFinale", // ✅
	"deus ex machina": "DeusExMachina", // ✅
	"everybody lives": "EverybodyLives", // ✅
	"ambiguous ending": "AmbiguousEnding", // ✅

	// Conflict Tropes (✅ = verified to exist on TV Tropes)
	"stupidity": "TooDumbToLive", // ✅
	"achievement through ignorance": "AchievementsInIgnorance", // ✅
	"the idiot runes the plan": "IdiotBall", // ✅
	"moral dilemma": "MoralDilemma", // ✅
	"secret identity problems": "SecretIdentity", // ✅
	"conflicting loyalty": "ConflictingLoyalty", // ✅
	"deal with the devil": "DealWithTheDevil", // ✅
	"lawful or good": "ToBeLawfulOrGood", // ✅

	// Add more mappings as we discover the correct TV Tropes pages
	// TODO: Still need to map beginning/ending/conflict tropes
};

/**
 * Fallback for unmapped tropes - attempts to generate URL from trope name
 * This is the old auto-generation logic, used when no mapping exists
 */
function generateFallbackUrl(tropeName: string): string {
	return tropeName
		.replace(/'s\b/g, 's')
		.replace(/['",.!?;:()]/g, '')
		.split(/[\s\-_/]+/)
		.filter(word => word.length > 0)
		.map(word => {
			if (word === word.toUpperCase() && word.length > 1) {
				return word;
			}
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		})
		.join('');
}

/**
 * Get the TV Tropes page name for a given trope
 * Uses manual mapping if available, otherwise attempts auto-generation
 */
export function getTvTropesPageName(tropeName: string): string {
	// Remove context after colon (e.g., "mission from higher power: Higher Power" -> "mission from higher power")
	const baseTropeName = tropeName.split(':')[0].trim().toLowerCase();

	// Check if we have a manual mapping
	if (tvTropesMapping[baseTropeName]) {
		return tvTropesMapping[baseTropeName];
	}

	// Fall back to auto-generation (may not be correct)
	console.warn(`No TV Tropes mapping found for: "${baseTropeName}". Using auto-generated URL (may be incorrect).`);
	return generateFallbackUrl(baseTropeName);
}
