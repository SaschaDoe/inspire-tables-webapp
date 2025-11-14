export interface Color {
	r: number;
	g: number;
	b: number;
	a?: number; // Alpha/transparency (0-1)
}

export class Ring {
	name: string;
	color: Color;
	innerRadius: number; // Inner radius in planet-radii units
	outerRadius: number; // Outer radius in planet-radii units

	constructor(name: string, color: Color, innerRadius: number, outerRadius: number) {
		this.name = name;
		this.color = color;
		this.innerRadius = innerRadius;
		this.outerRadius = outerRadius;
	}
}
