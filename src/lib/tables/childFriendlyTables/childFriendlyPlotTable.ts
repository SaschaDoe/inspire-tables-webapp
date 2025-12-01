import { Table } from '../table';
import { TableEntry } from '../tableEntry';
import { TableTitles } from '../tableTitles';
import { TableType } from '../tableType';

/**
 * A child-friendly plot with a problem and 4 solution methods.
 * All content is complete and ready to use in play.
 */
export interface ChildFriendlyPlot {
	problem: string;
	talking: string;
	secretMaking: string;
	riddle: string;
	trading: string;
}

/**
 * All child-friendly plots - non-violent problems with 4 complete, playable solutions each.
 * Each solution includes all details needed to run it at the table.
 */
export const childFriendlyPlots: ChildFriendlyPlot[] = [
	{
		problem: 'A child named Mira has lost her orange cat named Pumpkin. The cat has been missing since yesterday morning. Mira is very sad and has been searching everywhere.',
		talking: 'Talk to the neighbors one by one. Old Mrs. Willowbrook at the blue house saw an orange cat near the old mill this morning. The baker Mr. Honeycrust heard meowing behind his shop. Farmer Greenleaf says cats often hide in his hay barn when scared. Following these clues leads to Pumpkin hiding in the warm hay barn, scared by yesterday\'s thunderstorm.',
		secretMaking: 'Pumpkin\'s favorite food is tuna. Leave a trail of small tuna pieces starting from the hay barn (where cats like to hide), going past the mill, through the garden, and ending at Mira\'s back door with a cozy blanket and bowl of tuna. Check back at sunset - Pumpkin will have followed the trail home and be curled up on the blanket.',
		riddle: 'An old cat-loving hermit knows where Pumpkin is but speaks only in riddles. He says: "I hide where farmers store their gold, but not the shiny kind - the kind that\'s rolled in bundles and keeps animals fed through winter." ANSWER: The hay barn - hay is "farmer\'s gold" stored in rolled bundles. Pumpkin is sleeping in the warm hay.',
		trading: 'Tommy, the miller\'s son, found Pumpkin but his own pet mouse ran away yesterday. Offer to help Tommy find his mouse (it\'s hiding in the flour sacks - you can see tiny footprints). Once you help Tommy reunite with his mouse Whiskers, he happily tells you Pumpkin is in the mill\'s warm engine room.'
	},
	{
		problem: 'The only bridge to Willowdale village has collapsed after the spring floods. The river is too deep and fast to wade across. Villagers on both sides cannot visit family, trade goods, or get to the doctor.',
		talking: 'Call a village meeting on both riverbanks (people can shout across). Convince everyone to work together: the carpenter from the east side has skills, the lumber mill is on the west side, the blacksmith can make nails. Create a work schedule where people take turns. Old Captain Riverstone remembers how the original bridge was built and can direct the work. In three days of cooperation, a new bridge stands.',
		secretMaking: 'The old ferry boat is hidden in Granny Moss\'s barn - she stopped using it years ago. At night, secretly repair the boat using supplies from your own shed: patch the holes with tar and canvas, replace the rotten oars with sturdy branches. Leave the fixed boat at the riverbank before dawn with a note: "For Willowdale - from a friend." The village can now cross safely while building a proper bridge.',
		riddle: 'The ancient stone at the riverside has an inscription that reveals where stepping stones were placed long ago, now hidden under mud. The inscription reads: "Start where the willow weeps, take seven giant steps toward the morning sun, then five toward the north star. Repeat until you reach the other side." ANSWER: Following these directions reveals large flat stones just under the water surface - an old ford crossing that works when the river calms.',
		trading: 'The wealthy merchant Mr. Goldsworth has enough lumber to build a bridge but won\'t share it freely. However, he desperately wants the special honey from the Sweetmeadow bees on the other side (it cures his winter cough). Arrange a trade: villagers from both sides contribute honey, herbs, and preserved fruits. Mr. Goldsworth happily provides all the lumber needed.'
	},
	{
		problem: 'A giant named Grumbold has sat down on the mountain pass and refuses to move. He\'s not hurting anyone, but no one can travel through. When asked to move, he just sighs sadly and says "What\'s the point?"',
		talking: 'Sit with Grumbold and ask about his troubles. He reveals his only friend, a giant from the northern mountains, stopped visiting years ago because "the path is too dangerous with all those rock slides." Grumbold is lonely and depressed. Offer to help clear the northern path so his friend can visit again. Once he has hope of seeing his friend, Grumbold happily moves aside and even offers to help carry heavy loads through the pass.',
		secretMaking: 'Giants love music but are embarrassed to admit it. Hide behind rocks and play a cheerful tune on a flute (or have someone play). Grumbold will start tapping his foot, then humming, then ask "Who plays such lovely music?" Reveal yourself and offer to play for him every week if he moves to a nice sunny spot nearby. He agrees enthusiastically and becomes the pass\'s friendly guardian who waves at travelers.',
		riddle: 'Grumbold\'s grandmother was a riddling giant. He\'ll move if you can answer his favorite riddle: "I have cities but no houses, forests but no trees, and water but no fish. What am I?" ANSWER: A map! Grumbold claps with delight and says his grandmother would have liked you. He moves aside and gives you a smooth stone "for luck."',
		trading: 'Grumbold mentions his favorite thing was his mother\'s boulder soup, but he lost the recipe and can\'t remember it. The village elder has a book of old giant recipes from when giants and humans were friends. Offer to copy the boulder soup recipe for Grumbold. In exchange, he promises to move to the meadow nearby and only sit in the pass during terrible storms to shelter travelers.'
	},
	{
		problem: 'The village garden, which provides vegetables for everyone, has started wilting. The flowers droop, the tomatoes won\'t ripen, and the herbs are turning yellow. Nobody knows why.',
		talking: 'The oldest gardener, Sage Thornberry, is too proud to admit she needs help but knows exactly what\'s wrong. Approach her kindly and ask to learn from her wisdom. She\'ll eventually explain: "The underground spring that feeds the garden has been blocked by something - I\'m too old to investigate." Follow the spring to find a beaver dam. Talk to the beavers - they\'ll move if you help them find a better spot (there\'s a perfect pond location just downstream).',
		secretMaking: 'Wake before dawn and investigate. The water channel is blocked by an old fallen tree. Each night, secretly dig a new channel around the blockage, a little bit at a time. Hide your shovel under leaves when you hear others coming. After four nights, water flows again. When villagers wake to a thriving garden, they\'ll call it "a miracle" - you can smile quietly knowing the truth.',
		riddle: 'A garden sprite lives in the old well and knows what\'s wrong, but will only tell someone who proves they truly care about growing things. She asks: "What grows when you give it away, dies if you keep it to yourself, and makes everything around it flourish?" ANSWER: Knowledge (or Love). The sprite, pleased, reveals that someone accidentally dropped a big sack of salt near the water source while making preserved meats. Dig up the contaminated soil and the garden will recover.',
		trading: 'The herbalist has a special growth potion that could save the garden, but she needs three things: blue mushrooms from the dark forest (scary but harmless - they glow!), honey from the meadow hives (just ask the beekeeper politely), and morning dew collected in a silver cup (the old widow has one she\'ll lend). Gather these ingredients and trade them for enough potion to revive the entire garden overnight.'
	},
	{
		problem: 'An old treasure chest was found in Grandfather Oak\'s attic. It\'s beautifully carved with stars and moons, but firmly locked. Grandfather Oak has no memory of the key, and the chest has been in the family for generations.',
		talking: 'Great-Aunt Marigold, who is 97 years old and lives in the next village, might remember. Visit her with some of her favorite lavender tea. She tells a story: "That chest belonged to my grandmother. She always said the key is where the family\'s heart is." Ask what that means. After more tea and cookies, she remembers: "The family meeting spot - the old stone bench under the apple tree." Dig gently near the bench and find a small metal box with the key inside.',
		secretMaking: 'There\'s a tiny hole in the back of the chest, hidden under carved leaves. Using a thin wire or hairpin, you can feel a mechanism inside. The trick is to press up, then left, then up again - like climbing stairs. This was a secret escape mechanism for the lock. With patient fiddling (takes about an hour of careful work), the chest clicks open revealing old family photographs, a beautiful music box, and a letter from an ancestor.',
		riddle: 'The chest itself has a riddle carved along its inner frame: "Count my stars and multiply by moons, subtract the trees carved on my face. This number shows which floorboard hides what you seek." Count: 7 stars × 2 moons = 14, minus 3 trees = 11. ANSWER: The 11th floorboard from the attic door (counting from left). Pry it up gently to find a small velvet pouch containing an ornate brass key.',
		trading: 'The locksmith can pick the lock but refuses payment - "That chest is special, shouldn\'t be forced." However, he mentions he\'s searching for a specific old book about lock-making that belonged to his mentor. Grandfather Oak\'s attic has many old books! Search through them to find "The Art of the Key" by Master Ironfingers. Give it to the locksmith and he\'ll carefully, respectfully open the chest without damaging it.'
	},
	{
		problem: 'Two neighbors, the Brambleberrys and the Applebottoms, are quarreling loudly about a tree. The apple tree grows on the property line and both families claim the apples that fall. They\'ve stopped speaking to each other.',
		talking: 'Invite both families to tea at a neutral location - the village green. Let each side explain why the apples matter (Brambleberrys: grandmother planted the seed; Applebottoms: grandfather watered it daily for 20 years). Help them see they both have valid claims and shared history. Suggest they both harvest together and make apple cider to sell at the festival - splitting the profits. They agree and end up becoming business partners and friends again.',
		secretMaking: 'At night, secretly gather fallen apples and bake two beautiful apple pies - one for each family. Leave them on their doorsteps before dawn with a note: "Life is sweeter when shared. Your neighbor." Both families, touched by the anonymous gift, start wondering who was so kind. When they both bring pie to church that Sunday and realize they received the same gift, they start laughing about the silly coincidence and begin talking again.',
		riddle: 'The village wise woman says she\'ll solve the dispute if both families can answer together: "I am the child of two enemies who, when joined, create something neither could alone. I\'m made in fall but enjoyed in winter. What am I?" Both families must work together to solve it. ANSWER: Apple cider (or apple pie/preserves) - apples and time are "enemies" (apples rot over time) but together make cider. Working on the riddle together reminds them how to cooperate.',
		trading: 'Each family has something the other needs: Brambleberrys have an excellent pie recipe but no cinnamon; Applebottoms have spices but their pie recipe was lost when grandmother passed. Propose a fair exchange: share the recipe and the spices, then split the harvest - Brambleberrys get enough for pies, Applebottoms get enough for cider. Both families end up better off than before the argument.'
	},
	{
		problem: 'The baker has lost her grandmother\'s secret bread recipe that made the village famous. The annual Bread Festival is in five days, and without that special bread, the village will lose the competition to Milltown for the first time in forty years.',
		talking: 'Interview everyone who ever tasted the bread: "It had a hint of honey and something earthy." "My mother said there were seven ingredients." "The baker\'s grandmother hummed while she kneaded - maybe the rhythm matters?" Compile all the clues. The oldest villager remembers the grandmother muttering "rosemary from the hill, honey from the dell, flour from the ancient mill." Visit each location and gather ingredients from the specific sources - the bread turns out perfect.',
		secretMaking: 'The grandmother kept a garden behind the bakery, now overgrown. Secretly clear the weeds at night to reveal the original herb garden, still alive after all these years. Discover the grandmother pressed a copy of the recipe into a clay garden marker "so the earth would remember." Clean off the marker to reveal the recipe etched into the clay. Leave it where the baker will find it during her morning garden visit.',
		riddle: 'The grandmother was playful and left the recipe as a riddle in her journal: "Three cups of the miller\'s gift, one spoon of the bee\'s treasure, two pinches of the sea\'s tears, a whisper of the hilltop\'s needle-leaves. Wake the tiny helpers with warm water and sweet feeding. Let rest until doubled, shape with love, bake until golden voices sing." ANSWER: 3 cups flour, 1 spoon honey, 2 pinches salt, rosemary, yeast activated in warm water with a little sugar. "Golden voices" = the crust crackles when ready.',
		trading: 'An old traveling merchant has a copy of the recipe - he bought a handwritten cookbook at an estate sale years ago. He won\'t sell it but desperately needs his wagon wheel fixed before he can continue traveling. The village wheelwright can fix it, the blacksmith can forge new bolts, and you can provide labor. Help fix the wagon and the grateful merchant not only shares the recipe but stays for the festival.'
	},
	{
		problem: 'A young dragon named Ember is stuck in the valley. She flew down from the mountains chasing a pretty butterfly but is now too afraid to fly back up. Her worried mother Cindra is calling from the mountain peaks.',
		talking: 'Sit with Ember and talk about her fear. She admits she\'s never flown so high alone - she was always following her mother. Remind her she already flew all the way down, which is just as hard. Suggest she fly in short bursts: "See that ledge? Just fly there. Then the next one." Stay on the path and wave encouragingly at each ledge. With patient support, Ember reaches her mother, gaining confidence with each small success.',
		secretMaking: 'Dragons feel brave when they\'re helping others. Secretly place a "lost lamb" (a stuffed toy) on a high ledge with a note "Please help!" When Ember sees it, she\'ll want to rescue it. She\'ll fly up to the ledge without thinking about her fear. Place more "animals in need" on progressively higher ledges. By the time she reaches the peak carrying her rescued stuffed animals, she\'s forgotten she was scared at all.',
		riddle: 'Ember\'s family has a tradition: a young dragon earns their wings by answering the Mountain Riddle. Her mother calls down: "What can fly without wings, climb without legs, and reach the peak while staying in the valley?" Ember is stuck. Help her think... ANSWER: Smoke (or one\'s voice/a thought). Ember realizes bravery is in her heart, not her wings. Understanding this gives her courage to fly.',
		trading: 'Ember collects pretty stones. She has a whole pouch full. Offer her a trade: for every ten wingbeats higher she flies, you\'ll trade her a new interesting stone you found in the valley (colorful pebbles, crystals, etc.). She gets so excited collecting new stones that she forgets to be scared, and soon she\'s trading you a ruby from the mountain peak in exchange for a piece of river jade.'
	},
	{
		problem: 'The magical music box that plays the village lullaby each night has stopped working. For generations, children have fallen asleep to its sweet melody. Now babies are fussy and children have nightmares without it.',
		talking: 'The music box was made by Harmonius the Tinkerer, who lives in the Echoing Caves. He\'s reclusive but kind. Bring him a gift of honey cakes (his favorite) and explain the children\'s troubles. He\'s touched that his creation mattered so much. He explains the box needs new moonpetals for its mechanism - they grow only on the Silver Meadow at midnight. He gives you a special jar to collect them, and once installed, the music box plays sweeter than ever.',
		secretMaking: 'While the music box is broken, the children still need their lullaby. Organize a secret rotation: each night, a different parent or older child hides outside windows and hums the lullaby softly (everyone knows the tune by heart). The children never know the music box isn\'t working - they sleep peacefully. Meanwhile, secretly take the music box to the traveling tinker who can fix it within a week.',
		riddle: 'The music box has a hidden repair mechanism for emergencies. Three buttons are concealed as decorative flowers. A tiny inscription reads: "To wake the sleeping song, press us in the order we bloom: first opens with the sun, second drinks the rain, third closes with the moon." ANSWER: Sunflower (opens toward sun) → Lily (cup shape catches rain) → Moon Blossom (night-blooming flower). Press the buttons in this order and the music box resets itself.',
		trading: 'The gnome repair expert can fix any musical device but needs three things: a drop of morning dew from a spider\'s web (brings clarity), a child\'s genuine laugh captured in a crystal bottle (the toy shop sells them), and a silver coin given freely by someone who has little (ask the kind beggar). Gather these with care and respect, and the gnome fixes the music box, adding a new harmony as thanks.'
	},
	{
		problem: 'The village painter is creating a grand mural for the Harvest Festival, but all his paint has dried up. The art supply wagon won\'t arrive for three weeks, long after the festival. Without the mural, the town square will look bare.',
		talking: 'Ask around about alternative paint sources. The herbalist knows recipes for plant-based dyes. The potter has mineral pigments. The weaver has berry stains. Grandma Rose remembers how pioneers made paint "from the land itself." Organize a village effort where everyone contributes their knowledge: beetroot red, blueberry blue, spinach green, turmeric yellow, charcoal black, clay white. The painter creates a unique "natural mural" that becomes the village\'s new tradition.',
		secretMaking: 'The painter\'s birthday is tomorrow - perfect excuse for a secret gift! Coordinate with villagers: quietly collect materials, follow old paint recipes from the library, and work through the night in the barn. Create a complete set of homemade paints in jars decorated with ribbons. Leave them on the painter\'s doorstep at dawn with a card: "From the Village, With Love." The surprised and grateful painter works double-time and finishes the mural beautifully.',
		riddle: 'The old library has a book of "Lost Arts" with a paint-making chapter. But the page is damaged and parts are missing. What survives is a riddle: "For red, seek what makes the rabbit\'s eyes. For yellow, find the healer\'s sunrise spice. For blue, crush the flower that shares its name. Mix all with egg and oil to claim." ANSWER: Carrots (rabbit\'s eyes = orange-red), Turmeric (healing spice, yellow), Bluebells (flower called blue). The egg yolk and oil make tempera paint.',
		trading: 'The wealthy family on the hill has imported paints but their daughter\'s portrait was never finished. The painter offers a trade: he\'ll complete the portrait (he\'s been feeling guilty about leaving it unfinished anyway) in exchange for enough paint to do the mural. The family happily agrees, the daughter finally sees her portrait completed, and the festival has its beautiful mural.'
	},
	{
		problem: 'A peculiar cloud has parked itself directly over Farmer Greenfield\'s farm. It rains only on his land, constantly, while everywhere else is sunny. His crops are drowning and his chickens are miserable.',
		talking: 'Look up and talk to the cloud (its name is Nimbus). Clouds can hear if you speak from a hilltop. Nimbus explains he\'s lost - he was supposed to water the Drywood Desert but got confused. Give clear directions: "Follow the sun until you see sand, then rain as much as you want!" Nimbus is grateful for the help and apologizes to the farmer. Before leaving, he gives one perfect gentle rain for the farm\'s future needs.',
		secretMaking: 'Clouds love the smell of certain flowers. Plant a trail of cloud-attracting silver sage flowers (get seeds from the herbalist) from the farm toward the desert, one patch every mile. At night, the flowers bloom and release their scent. Nimbus smells the trail and follows it like a butterfly follows nectar, naturally drifting toward the desert over the course of a week, thinking it was his own idea.',
		riddle: 'Clouds are ancient and love riddles. Float up a message by balloon: "Answer this and I\'ll show you where you\'re meant to be: I have no mouth but I can roar, I have no hands but I can knock down doors, I can whisper in the trees and carry ships across the seas. What am I?" ANSWER: The Wind. When Nimbus guesses correctly, the wind itself arrives and says "Follow me, brother cloud," guiding Nimbus to the proper place.',
		trading: 'Nimbus is fascinated by the colorful flags and pinwheels in the village - clouds rarely see such things. Offer to give him a special wind chime that plays music when clouds pass by (the tinker can make one) in exchange for moving to a better location. Hang the wind chime on a tall pole in the desert. Nimbus moves there happily, visiting his musical wind chime whenever he passes by.'
	},
	{
		problem: 'All the books in the village library have been scrambled - covers mixed with wrong pages, chapters scattered between books, index cards everywhere. The librarian is overwhelmed and nobody can find anything.',
		talking: 'Organize a "Library Rescue Party." Post notices and talk to villagers: "Free lunch for all helpers!" Assign teams: children sort index cards alphabetically (make it a game!), teenagers match pages to covers by checking page numbers, adults repair damaged books. The retired teacher supervises with her experience. Make it fun with snacks and music. In one big community day, the library is organized better than before, and everyone feels proud.',
		secretMaking: 'Notice the library cat seems to know where everything goes - she keeps lying on specific books and meowing. Follow her hints: she sits on books that belong together. She was the librarian\'s helper for years and remembers the system! Spend several nights secretly following her guidance, making piles of books that belong together. Each morning, the librarian finds mysteriously organized sections and the work goes faster and faster.',
		riddle: 'The original librarian, now passed on, built a secret organizing system into the building itself. A plaque reads: "When chaos reigns, look to where the morning light falls first, where the noon light rests, and where the evening light says goodbye. Begin there." ANSWER: The east window (morning), center reading tables (noon), and west window (evening) each have colored dots painted long ago - these colors match a color-coding system marked on the shelves. Follow the dots to know which books go where.',
		trading: 'The traveling book merchant offers to help organize (she knows book systems from many lands) but needs something in return: she\'s searching for a rare book of poems her grandmother wrote, which might be in this very library. Promise to search the disorganized books for it while sorting. You find it in a mislabeled box! She weeps with joy and spends three days helping restore perfect order to the library.'
	},
	{
		problem: 'The fairy Luminara, who lights the village lanterns each night with her magic glow, has fallen into a deep sleep on a mushroom and will not wake. Without her, the village is dark and people are afraid to go out at night.',
		talking: 'Visit the Fairy Queen in the old oak grove (bring a gift of cream and wildflowers). She explains that fairies fall into "restoration sleep" when they\'ve given too much light. "She must hear that her work matters - that she is loved, not just useful." Organize villagers to come to the mushroom and speak their thanks: children tell how the lights let them play longer, elders share how the glow keeps them safe. Surrounded by genuine gratitude, Luminara stirs and wakes, glowing brighter than ever.',
		secretMaking: 'While Luminara sleeps, the village still needs light. Secretly teach villagers to make paper lanterns with candles inside. Work through the day making dozens of them. At dusk, position them along all the paths and squares. When Luminara finally wakes (fairies naturally wake at the new moon, three days away), she finds the villagers have learned to make their own light but still treasure her because her light is magical and warm. She feels valued, not obligated.',
		riddle: 'Fairy sleep is broken by answering the question their heart is asking. Luminara murmurs in her sleep: "Why do I glow?" She\'s having a crisis of purpose. Whisper the answer in her ear: "You glow because light is your gift, not your duty. You glow because darkness fears love, and you ARE love, little light." ANSWER: This philosophical answer addresses her exhausted heart. She wakes, realizing she was giving out of obligation rather than joy, and chooses to light the village because she wants to.',
		trading: 'The fairy needs dream-honey to restore her energy - it only comes from enchanted bees in the Whispering Glen. The bees will trade dream-honey for pollen from the Moon Orchid (get it from the greenhouse), nectar of the Laughing Daisy (grows by the giggling brook), and a promise spoken aloud to protect wild bees (say it sincerely). Once gathered, dab the dream-honey on Luminara\'s lips - she wakes within the hour.'
	},
	{
		problem: 'A big storm knocked down fruit trees throughout the forest. The squirrels, bears, birds, and deer who depend on that fruit are worried about the coming winter. They\'ve started entering the village looking for food, which scares some people.',
		talking: 'Arrange a meeting between village and forest (yes, really). The wise owl can translate. Explain to the villagers: "The animals aren\'t invading, they\'re desperate." Ask the animals what they need. Create an agreement: the village will share windfall fruit and plant new trees; the animals will help by spreading seeds and fertilizing soil. This partnership makes both village and forest stronger. Post signs explaining the agreement so visitors understand.',
		secretMaking: 'Each night, secretly gather food that would otherwise be thrown away: bruised apples, stale bread, vegetable scraps. Fill hidden caches throughout the forest: hollow logs, rock crevices, the base of trees. Mark them with a special scratch so animals learn to look for that sign. Over several weeks, establish a secret feeding network. The animals stop coming to the village because they have enough, and nobody knows why except you and the grateful creatures.',
		riddle: 'The oldest bear, Great Elder Bark, says there\'s an ancient orchard, planted by forest spirits, that still bears fruit in winter - but its location is hidden in a riddle: "Walk toward the sunrise until the water sings, then follow the song until the land rises without hills. There, the trees remember when animals and spirits were friends." ANSWER: Go east to the waterfall (singing water), then follow the stream to where steam rises (hot springs = land rises without hills). The hot spring\'s warmth keeps this orchard producing year-round.',
		trading: 'The village has more food than it can store, but preservation is hard. The bears know ancient honey-caves that keep food fresh all winter. Propose a trade: the village shares surplus food, the animals show humans the preservation caves, and everyone stores food together. This new partnership means plenty for all - and the "Community Caves" become a village tradition, managed by a human-animal council.'
	},
	{
		problem: 'A young mermaid named Pearl found a sailor\'s compass that fell into the sea. She knows it\'s important but is terrified of humans. She watches from afar, holding the compass, wanting to return it but too shy to approach.',
		talking: 'Come to the shore alone at dawn, when Pearl feels safest. Sit quietly and speak to the water: "We know you\'re there. We\'re grateful you found it. You don\'t have to come close - we can leave a waterproof box at the tide line and you can put it in there. But if you ever want to talk, we\'d like that." Come back daily, always gentle. Eventually Pearl responds with shell-messages. Over a week, a friendship forms, and Pearl shyly returns the compass herself.',
		secretMaking: 'Pearl loves human music but is afraid to ask for it. She\'s been seen peeking at windows when people play instruments. Arrange for musicians to play at the cove each sunset - not looking at the water, just playing beautiful music as if for themselves. Leave a music box as a gift at the tide line with a note: "For the Friend in the Water - Thank You." Pearl, touched by the kindness without expectation, leaves the compass beside the music box.',
		riddle: 'Mermaids communicate through shell-mail. Send a message in a bottle with a riddle Pearl must solve: "I belong to you but others use me more. The sailor who lost me calls me by this name. What am I?" ANSWER: Your name - the sailor has been calling out for his compass (which he named "Northstar" after his daughter). Include this in the riddle solution explanation. Pearl, delighted by the riddle and story, writes back asking to hear more about the sailor. A shell-mail friendship begins, and she returns the compass.',
		trading: 'Pearl collects human artifacts that fall into the sea - buttons, bottles, coins. She has a wonderful collection. The sailor, it turns out, has a box of his grandmother\'s old jewelry that he\'d donate to anyone who found his compass - it\'s worthless to him but full of shiny treasures. Arrange a trade through the hermit who speaks fish-language: the jewelry collection for the compass. Pearl is thrilled with her new treasures.'
	},
	{
		problem: 'A child\'s beloved kite, a red dragon kite made by her grandfather who has since passed away, is tangled in the very top of the tallest oak tree. Climbing that high is too dangerous.',
		talking: 'Talk to old Windmaster Willem, who has trained messenger birds for fifty years. His smartest crow, Ink, can untangle simple knots if shown what to do. Willem agrees to help. He sends Ink up with careful instructions (Willem uses a special whistle language). Ink works at the tangle for an hour, sometimes flying back for guidance. Finally, the kite floats down gently. The child hugs the kite, and Willem smiles knowing his birds helped preserve a memory.',
		secretMaking: 'Build a secret rescue device: attach a long lightweight pole to another pole, then another, creating a super-long but light extending arm. Add a hook wrapped in soft cloth at the end. Practice extending it against your own roof first. On a windless night, quietly extend the device up the tree, hook the kite string gently, and lift the kite away from the branches. Leave the rescued kite on the child\'s doorstep with a note: "From the Wind itself."',
		riddle: 'The oak is home to a scholarly owl named Professor Hoot who speaks human language. He\'ll help if you answer his challenge: "Complete this pattern: Red, Orange, Yellow, __, Blue, __, Violet. And tell me - what do I describe, and where in your kite might you find me?" ANSWER: Green and Indigo (rainbow colors). The rainbow appears in the dragon kite\'s scales! Professor Hoot, impressed, flies up and uses his beak and talons to free the kite, delivering it with a proud "hmph."',
		trading: 'The acrobatic twin squirrels, Flip and Twist, could easily rescue the kite - they dance in treetops for fun. But they want something: their favorite hazelnut tree was cut down last month and they miss it terribly. Promise to plant three new hazelnut trees in the forest (get saplings from the nursery) and care for them for one full year. The squirrels agree instantly, rescue the kite in minutes, and become the child\'s friends forever.'
	},
	{
		problem: 'The village wizard Zephyrus has completely forgotten the spell to make the old well produce clean water. He remembers it starts with "Aqua" and involves gestures, but the rest is gone. The well water is now murky and unsafe.',
		talking: 'Help Zephyrus remember through conversation. Ask about when he first learned the spell: "My master Tide-Turner taught me by the seashore... we practiced until moonrise..." Ask what each gesture meant: "The first motion calls to water spirits, the second thanks the earth, the third asks permission..." As he talks through each memory, the spell reassembles itself. Finally he remembers: "Aqua Pura, Terra Gratia, Spiritus Benevolent!" with a spiral motion, a bow, and hands raised. The well clears instantly.',
		secretMaking: 'The spell is written in Zephyrus\'s own spellbook, but he\'s lost track of which one - he has hundreds. Sneak into his tower while he naps (he always naps after lunch) and carefully search the books. Look for water stains and dog-eared pages. Find the right book (blue cover, silver water drops painted on it) and leave it open on his desk with a bookmark on the right page and a note: "Perhaps you forgot where you put this?"',
		riddle: 'The spell is encoded in a magical riddle that Zephyrus himself wrote as a memory aid, but forgot he wrote it. It\'s engraved on the well\'s rim: "Say the pure water\'s Latin name, thank the earth that holds the vein, ask the spirits to be kind - then spiral, bow, and lift your mind." ANSWER: Aqua Pura (pure water Latin), Terra Gratia (earth thanks Latin), Spiritus Benevolent (spirits be kind Latin). Motions: spiral hand, bow to earth, raise hands to sky. Reading the riddle aloud helps Zephyrus remember everything.',
		trading: 'Another wizard, Cascade, knows the spell but owes Zephyrus a grudge from years ago over a borrowed book never returned. That book, "Weather Patterns of the Eastern Isles," is actually in the village library (misfiled!). Find it and return it to Cascade with a full apology on Zephyrus\'s behalf. Cascade, honor satisfied, visits Zephyrus and they reconcile over tea - she happily re-teaches him the spell and they become friends again.'
	},
	{
		problem: 'The village thinks the troll under the bridge is dangerous and mean. They throw stones and shout at him. But you\'ve noticed he only comes out when he hears children laughing, and he looks sad, not angry.',
		talking: 'Approach the bridge alone and call out kindly: "Hello under the bridge! My name is [name]. Would you like to talk?" The troll, Mossy, is shocked anyone is kind. He explains he used to play with village children long ago until adults became scared. He misses friendship. Help Mossy prepare a speech for the village meeting where he explains his story. When villagers hear him speak gently about loneliness, their fear transforms to sympathy. He becomes the village\'s bridge guardian and friend.',
		secretMaking: 'Mossy looks sad and has no decorations under his bridge. Over several nights, secretly hang cheerful things: wind chimes, a flower pot, a small painted sign saying "Mossy\'s Home." Leave small treats and a blanket. Each morning Mossy finds new gifts and his mood lifts. When children notice the decorations and ask about them, explain Mossy just wants friends. The children write him welcoming letters, which they leave on the bridge. Mossy emerges one day crying happy tears.',
		riddle: 'Trolls love riddles - it\'s how they make friends. Approach the bridge and call out a riddle: "I run but never walk, I have a mouth but never talk, I have a bed but never sleep. What am I?" Wait for Mossy to answer. ANSWER: A river! Mossy laughs delightedly (nobody has riddled with him in years). Ask him for a riddle in return. This exchange of riddles becomes a daily ritual, and soon children gather to hear the riddling - Mossy becomes the village\'s beloved "Riddle Troll."',
		trading: 'Mossy is cold under the bridge at night but is afraid to ask for help. Offer a trade: you\'ll bring him warm blankets, a pillow, and a lantern (gather these with help from kind villagers who want to help when they understand). In exchange, Mossy will maintain the bridge - fixing loose stones, clearing debris, helping anyone who needs to cross at night. This useful role gives Mossy dignity and purpose, earning the village\'s respect.'
	},
	{
		problem: 'The songbirds who live in the village trees have forgotten their beautiful morning melody. They chirp and tweet randomly, but the traditional song that used to wake the village is gone. Mornings feel empty without it.',
		talking: 'Seek out the eldest bird, a wise ancient thrush named Maestro, who lives in the clock tower. He\'s nearly deaf now and thought everyone forgot him. Shout up to him with respect: "Great Maestro, the village needs your wisdom!" He\'s moved that anyone remembers him. He can\'t sing anymore, but he can conduct. Build him a tiny podium where young birds can see him. When he waves his wings in the old patterns, the young birds follow, and the song returns - led by the honored Maestro.',
		secretMaking: 'The song is actually written on an old music sheet in the abandoned schoolhouse, labeled "The Morning Song of Willowdale - Traditional." Birds can\'t read music, but they can copy sounds. Learn to play the melody on a flute (take lessons from the music teacher for a week). Each dawn, play the song from your window. Birds will start to copy it, bit by bit. After a month, the birds are singing it themselves, thinking they\'ve always known it.',
		riddle: 'The birds lost the song when the great bronze bell was removed from the tower - the bell\'s morning ring reminded them how the song started. The bell is now in the mayor\'s garden as decoration. The riddle to convince the mayor: "What rings without being asked, calls without voice, and wakes the village without speaking? Return it to its home and see what answers." ANSWER: The bell. When the mayor rehears it in the tower and it rings at dawn, the birds instantly remember: the bell was their conductor! The song returns naturally.',
		trading: 'The birds are distracted by hunger - there aren\'t enough insects this year because of a cold spring. Trade with the herbalist for special bird-feed that attracts insects (crushed eggshells, dried berries, specific herbs). Create feeding stations around the village. Well-fed and happy birds naturally start singing more. Once they\'re strong and content, offer a trade: "We\'ll keep feeding you special treats if you\'ll teach your children the old morning song." The birds eagerly agree.'
	},
	{
		problem: 'Old fisherman Barnaby\'s little boat is stuck on a sandbar in the bay. The tide went out while he was repairing his net, and now he\'s stranded. He can\'t reach the shore, and his boat is too heavy to push alone.',
		talking: 'Gather the fishing community - they understand the sea. Call out to Barnaby about his situation. Captain Saltwind checks the tide tables: "High tide in four hours will be strong enough." Organize a plan: when the tide rises, six strong fishermen will wade out (the water will only be waist-deep at that point) and help push while Barnaby rows. Meanwhile, have someone bring him food, water, and a book to wait comfortably. The community rescue succeeds easily.',
		secretMaking: 'At low tide tonight, wade out to the sandbar (safe with boots and a staff). Dig a channel from the boat toward deeper water - about twenty feet long and one foot deep. Cover your tracks with scattered sand so it looks natural. When the morning tide comes in, water will flow through the channel first, lifting the boat earlier than expected. Barnaby will think it\'s luck, but you know the truth. Leave a good-luck charm in his boat as a secret signature.',
		riddle: 'Old Barnaby\'s grandfather carved a riddle into every family boat for emergencies like this. Check the inside of the hull: "When stuck between tides, remember - remove half the problem to solve it all. The heaviest thing is not always solid." ANSWER: The water inside the boat! Barnaby has been taking on small leaks. Bail out all the water (about 200 pounds worth), and the boat becomes light enough to push free even at low tide. The riddle was grandfather\'s wisdom for this exact situation.',
		trading: 'Young Tom has a team of strong donkeys who could pull the boat free with ropes at low tide. But Tom needs help: his family\'s vegetting garden is overgrown and his parents are sick. Organize a work trade: you and three friends will clear Tom\'s garden today if he and his donkeys will pull the boat tomorrow morning. Tom agrees gratefully. The garden is cleared, the donkeys pull the boat free, and Barnaby gives everyone fresh fish in thanks.'
	}
];

/**
 * Formats a complete plot as a single readable text block for table display.
 */
function formatPlotEntry(plot: ChildFriendlyPlot): string {
	return `PROBLEM: ${plot.problem}

★ TALKING SOLUTION: ${plot.talking}

★ SECRET-MAKING SOLUTION: ${plot.secretMaking}

★ RIDDLE SOLUTION: ${plot.riddle}

★ TRADING SOLUTION: ${plot.trading}`;
}

/**
 * Child-Friendly Plot Table
 *
 * A table of 20 non-violent adventure plots suitable for children.
 * Each entry contains a complete problem with 4 different solution methods:
 * - Talking: Communication, diplomacy, asking for help
 * - Secret-Making: Secretly doing something helpful, surprises
 * - Riddle: Puzzles, logic, clever thinking (includes actual riddles with answers!)
 * - Trading: Fair exchanges, helping each other
 *
 * All solutions are complete and ready to play - no additional preparation needed.
 */
export class ChildFriendlyPlotTable extends Table {
	constructor() {
		const entries: TableEntry[] = childFriendlyPlots.map(
			(plot) => new TableEntry(formatPlotEntry(plot))
		);

		super(entries, TableTitles.ChildFriendlyProblem);
		this.tableType = TableType.ChildFriendly;
	}

	/**
	 * Get a random complete plot object (for programmatic use).
	 */
	getRandomPlot(): ChildFriendlyPlot {
		const index = Math.floor(Math.random() * childFriendlyPlots.length);
		return childFriendlyPlots[index];
	}

	/**
	 * Get a specific plot by index (0-based).
	 */
	getPlotByIndex(index: number): ChildFriendlyPlot | undefined {
		if (index >= 0 && index < childFriendlyPlots.length) {
			return childFriendlyPlots[index];
		}
		return undefined;
	}

	/**
	 * Get all plots as objects.
	 */
	getAllPlots(): ChildFriendlyPlot[] {
		return [...childFriendlyPlots];
	}
}
