/**
 * Abstract types for LLM/AI provider system
 */

export type ImageStyle = 'realistic' | 'drawn-color' | 'drawn-ink';

export interface ImageGenerationOptions {
	prompt: string;
	style: ImageStyle;
	additionalPrompt?: string;
	aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
}

export interface ImageGenerationResult {
	success: boolean;
	imageData?: string; // Base64 encoded image
	mimeType?: string;
	error?: string;
}

export interface ModelInfo {
	id: string;
	name: string;
	description?: string;
	supportsImageGeneration: boolean;
	supportsTextGeneration: boolean;
}

export interface ProviderConfig {
	apiKey: string;
	baseUrl?: string;
}

export interface AIProvider {
	readonly name: string;
	readonly id: string;

	configure(config: ProviderConfig): void;
	isConfigured(): boolean;

	listModels(): Promise<ModelInfo[]>;
	generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult>;
}

export interface StoredApiKey {
	id: string;
	providerId: string;
	apiKey: string;
	createdAt: Date;
	updatedAt: Date;
}
