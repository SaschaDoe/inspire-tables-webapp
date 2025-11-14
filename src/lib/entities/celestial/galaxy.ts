import { Entity } from '../base/entity';
import type { SolarSystem } from './solarSystem';

export class Galaxy extends Entity {
	name = '';
	type = '';
	imagePath = '';
	color = '';
	rotationVelocity = 0;
	size = '';
	sizeInLightyears = 0;
	mass = '';
	massInSolarMasses = '';
	hasActiveGalacticNucleus = false;
	age = '';
	ageInYears = 0;
	anomalies: string[] = [];
	isAlreadyScannedForAnomalies = false;
	solarSystems: SolarSystem[] = [];
	parentId = ''; // Reference to parent Sphere
}
