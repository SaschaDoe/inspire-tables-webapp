const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/stores/storyboardStore.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix the updateNode function - remove the broken lines and add proper logging
content = content.replace(
	/const node = board\.nodes\.find\(\(n\) => n\.id === nodeId\);[\s\S]*?if \(node\) \{[\s\S]*?saveToStorage\(state\);[\s\S]*?\}/m,
	`const node = board.nodes.find((n) => n.id === nodeId);
			if (node) {
				console.log('[Store] updateNode BEFORE:', { nodeId, bridgeLinksSpawned: node.bridgeLinksSpawned, updates });
				Object.assign(node, updates);
				console.log('[Store] updateNode AFTER:', { nodeId, bridgeLinksSpawned: node.bridgeLinksSpawned });
				node.metadata.updatedAt = new Date();
				board.metadata.updatedAt = new Date();
				saveToStorage(state);
			}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed updateNode function with debug logging');
