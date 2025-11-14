/**
 * Seeded Noise Generator using Mersenne Twister PRNG
 * Provides consistent procedural noise generation for planet/star textures
 */
export class SeededNoise {
	private seed: number;
	private MT: number[];
	private index: number;

	constructor(seed = 0) {
		this.seed = seed;
		this.MT = this.initGenerator(seed);
		this.index = 625;
	}

	/**
	 * Initialize Mersenne Twister generator with seed
	 */
	private initGenerator(seed: number): number[] {
		const MT = new Array(624);
		MT[0] = seed >>> 0;
		for (let i = 1; i < 624; i++) {
			MT[i] = ((1812433253 * (MT[i - 1] ^ (MT[i - 1] >>> 30)) + i) >>> 0);
		}
		return MT;
	}

	/**
	 * Generate 624 new random numbers
	 */
	private generateNumbers(): void {
		for (let i = 0; i < 624; i++) {
			let y = (this.MT[i] & 0x80000000) >>> 0;
			y += (this.MT[(i + 1) % 624] & 0x7fffffff) >>> 0;
			this.MT[i] = this.MT[(i + 397) % 624] ^ (y >>> 1);
			if (y % 2 !== 0) {
				this.MT[i] = this.MT[i] ^ 0x9908b0df;
			}
		}
	}

	/**
	 * Generate next random number
	 */
	public random(): number {
		if (this.index >= 624) {
			this.generateNumbers();
			this.index = 0;
		}
		let y = this.MT[this.index++];
		y = y ^ (y >>> 11);
		y = y ^ ((y << 7) & 0x9d2c5680);
		y = y ^ ((y << 15) & 0xefc60000);
		y = y ^ (y >>> 18);
		return y >>> 0;
	}

	/**
	 * Generate noise value between -1 and 1
	 * @param x - X coordinate (unused in current implementation, but kept for API compatibility)
	 * @param y - Y coordinate (unused in current implementation, but kept for API compatibility)
	 * @param z - Z coordinate (unused in current implementation, but kept for API compatibility)
	 */
	public noise(x: number, y: number, z: number): number {
		// Use the seeded pseudorandom number generator to get a value
		const val = this.random() / 0xffffffff;
		return val * 2 - 1;
	}
}
