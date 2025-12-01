/**
 * Registry for AI providers
 * Allows registering and accessing different AI providers
 */

import type { AIProvider, ModelInfo } from './types';
import { geminiProvider } from './providers/gemini';

class AIProviderRegistry {
	private providers: Map<string, AIProvider> = new Map();

	constructor() {
		// Register default providers
		this.register(geminiProvider);
	}

	register(provider: AIProvider): void {
		this.providers.set(provider.id, provider);
	}

	get(providerId: string): AIProvider | undefined {
		return this.providers.get(providerId);
	}

	getAll(): AIProvider[] {
		return Array.from(this.providers.values());
	}

	getAllConfigured(): AIProvider[] {
		return this.getAll().filter((p) => p.isConfigured());
	}

	async listAllModels(): Promise<{ providerId: string; providerName: string; models: ModelInfo[] }[]> {
		const results: { providerId: string; providerName: string; models: ModelInfo[] }[] = [];

		for (const provider of this.getAllConfigured()) {
			try {
				const models = await provider.listModels();
				results.push({
					providerId: provider.id,
					providerName: provider.name,
					models
				});
			} catch (error) {
				console.error(`Failed to list models for ${provider.name}:`, error);
			}
		}

		return results;
	}
}

export const aiProviderRegistry = new AIProviderRegistry();

// Convenience function to get the default image generation provider
export function getImageProvider(): AIProvider | undefined {
	// For now, default to Gemini
	return aiProviderRegistry.get('gemini');
}
