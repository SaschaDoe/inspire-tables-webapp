const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/components/storyboard/StoryBoardNode.svelte');
let content = fs.readFileSync(filePath, 'utf8');

// Strategy: Replace all instances of node.bridgeLinksSpawned with currentNode.bridgeLinksSpawned
// And add the currentNode fetching logic at the start

// First, find the handleSpawnBridgeLink function and add currentNode fetching
content = content.replace(
	/(async function handleSpawnBridgeLink\(e: MouseEvent, link: DetectedBridgeLink\) \{\s*e\.stopPropagation\(\);\s*if \(!.*activeBoard\) return;\s*try \{)/,
	`$1
		// Get fresh node data from store (prop may be stale)
		const currentNode = $activeBoard.nodes.find(n => n.id === node.id);
		if (!currentNode) return;
`
);

// Replace all node.bridgeLinksSpawned with currentNode.bridgeLinksSpawned in handleSpawnBridgeLink
// We'll do this carefully to only affect this function
const funcStart = content.indexOf('async function handleSpawnBridgeLink');
const funcEnd = content.lastIndexOf('\t}\n', content.indexOf('async function', funcStart + 100)); // Find the matching closing brace

if (funcStart !== -1 && funcEnd !== -1) {
	const before = content.substring(0, funcStart);
	let funcBody = content.substring(funcStart, funcEnd + 3);
	const after = content.substring(funcEnd + 3);

	// Replace within function body only
	funcBody = funcBody.replace(/node\.bridgeLinksSpawned/g, 'currentNode.bridgeLinksSpawned');

	// Generate node ID before each addNode call - handle both lore-master and world-builder
	// We need to:
	// 1. Add newNodeId = crypto.randomUUID() before nodeData
	// 2. Pass id: newNodeId in nodeData
	// 3. Use newNodeId in tracking instead of newNode.id

	// For lore-master case
	funcBody = funcBody.replace(
		/(if \(link\.targetDeck === 'lore-master'\) \{[\s\S]*?)(const nodeData = \{)/,
		`$1const newNodeId = crypto.randomUUID();\n\t\t\t\t$2\n\t\t\t\t\tid: newNodeId,`
	);

	// For world-builder case
	funcBody = funcBody.replace(
		/(else if \(link\.targetDeck === 'world-builder'\) \{[\s\S]*?)(const nodeData = \{)/,
		`$1const newNodeId = crypto.randomUUID();\n\t\t\t\t$2\n\t\t\t\t\tid: newNodeId,`
	);

	// Remove the const newNode = part since addNode doesn't return anything
	funcBody = funcBody.replace(/const newNode = storyboardStore\.addNode/g, 'storyboardStore.addNode');

	// Replace tracking logic to use newNodeId
	funcBody = funcBody.replace(
		/console\.log\('\[Bridge Link\] Spawning new node for:'[\s\S]*?\/\/ Track this spawned link\s*if \(newNode\) \{\s*const updatedTracking = \{ \.\.\.currentNode\.bridgeLinksSpawned, \[link\.linkText\]: newNode\.id \};\s*storyboardStore\.updateNode/g,
		`console.log('[Bridge Link] Spawning new node for:', link.linkText);\n\t\t\t\t// Track this spawned link with the new node ID\n\t\t\t\tconst updatedTracking = { ...currentNode.bridgeLinksSpawned, [link.linkText]: newNodeId };\n\t\t\t\tstoryboardStore.updateNode`
	);

	content = before + funcBody + after;
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed bridge link tracking to use fresh node data from store');
