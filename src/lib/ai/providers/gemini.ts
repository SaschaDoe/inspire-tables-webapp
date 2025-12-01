/**
 * Google Gemini AI Provider
 * Implements image generation using gemini-3-pro-image-preview (Nano Banana Pro)
 */

import type {
	AIProvider,
	ProviderConfig,
	ModelInfo,
	ImageGenerationOptions,
	ImageGenerationResult,
	ImageStyle
} from '../types';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const IMAGE_MODEL = 'gemini-3-pro-image-preview'; // Nano Banana Pro (requires paid tier)

// Style prompts to prepend based on selected style
// All prompts explicitly request NO TEXT in the image
const STYLE_PROMPTS: Record<ImageStyle, string> = {
	realistic:
		'Create a highly realistic, photorealistic portrait image with natural lighting and detailed textures. Do NOT include any text, labels, titles, or words in the image. ',
	'drawn-color':
		'Create a colorful hand-drawn illustration with vibrant colors, artistic brush strokes, and a painterly style. Do NOT include any text, labels, titles, or words in the image. ',
	'drawn-ink':
		'Create a black and white ink drawing with fine line work, cross-hatching, and elegant pen strokes. No color, only black ink on white paper. Do NOT include any text, labels, titles, or words in the image. '
};

export class GeminiProvider implements AIProvider {
	readonly name = 'Google Gemini';
	readonly id = 'gemini';

	private apiKey: string | null = null;

	configure(config: ProviderConfig): void {
		this.apiKey = config.apiKey;
	}

	isConfigured(): boolean {
		return this.apiKey !== null && this.apiKey.length > 0;
	}

	async listModels(): Promise<ModelInfo[]> {
		if (!this.apiKey) {
			throw new Error('Gemini API key not configured');
		}

		try {
			const response = await fetch(`${GEMINI_API_BASE}/models?key=${this.apiKey}`);

			if (!response.ok) {
				throw new Error(`Failed to list models: ${response.statusText}`);
			}

			const data = await response.json();
			const models: ModelInfo[] = [];

			for (const model of data.models || []) {
				const supportedMethods = model.supportedGenerationMethods || [];
				models.push({
					id: model.name?.replace('models/', '') || model.name,
					name: model.displayName || model.name,
					description: model.description,
					supportsImageGeneration: supportedMethods.includes('generateContent'),
					supportsTextGeneration: supportedMethods.includes('generateContent')
				});
			}

			return models;
		} catch (error) {
			console.error('Failed to list Gemini models:', error);
			throw error;
		}
	}

	async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
		if (!this.apiKey) {
			return { success: false, error: 'Gemini API key not configured' };
		}

		const stylePrompt = STYLE_PROMPTS[options.style];
		const fullPrompt = `${stylePrompt}${options.prompt}${options.additionalPrompt ? ' ' + options.additionalPrompt : ''}`;

		try {
			const response = await fetch(
				`${GEMINI_API_BASE}/models/${IMAGE_MODEL}:generateContent`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'x-goog-api-key': this.apiKey
					},
					body: JSON.stringify({
						contents: [
							{
								role: 'user',
								parts: [{ text: fullPrompt + ' Portrait orientation, vertical format.' }]
							}
						],
						generationConfig: {
							responseModalities: ['TEXT', 'IMAGE']
						}
					})
				}
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				const errorMessage = errorData.error?.message || response.statusText;
				return { success: false, error: `API Error: ${errorMessage}` };
			}

			const data = await response.json();

			// Extract image from response
			const candidates = data.candidates || [];
			for (const candidate of candidates) {
				const parts = candidate.content?.parts || [];
				for (const part of parts) {
					if (part.inlineData) {
						return {
							success: true,
							imageData: part.inlineData.data,
							mimeType: part.inlineData.mimeType || 'image/png'
						};
					}
				}
			}

			return { success: false, error: 'No image generated in response' };
		} catch (error) {
			console.error('Failed to generate image:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}
}

// Singleton instance
export const geminiProvider = new GeminiProvider();
