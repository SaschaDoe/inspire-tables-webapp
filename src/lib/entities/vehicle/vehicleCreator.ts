import { Creator } from '../base/creator';
import { Vehicle } from './vehicle';
import { SizeTable } from '$lib/tables/otherTables/sizeTable';
import { QualityTable } from '$lib/tables/otherTables/qualityTable';
import { MaterialsTable } from '$lib/tables/artefactTables/materialsTable';

export class VehicleCreator extends Creator<Vehicle> {
	create(): Vehicle {
		const vehicle = new Vehicle();

		// Generate vehicle details
		vehicle.type = this.generateVehicleType();
		vehicle.name = this.generateVehicleName(vehicle.type);
		vehicle.size = new SizeTable().roleWithCascade(this.dice).text;
		vehicle.quality = new QualityTable().roleWithCascade(this.dice).text;
		vehicle.speed = this.generateSpeed();
		vehicle.capacity = this.generateCapacity();
		vehicle.propulsion = this.generatePropulsion(vehicle.type);
		vehicle.material = new MaterialsTable().roleWithCascade(this.dice).text;

		// Generate 0-3 special features
		const featureCount = this.dice.rollInterval(0, 3);
		for (let i = 0; i < featureCount; i++) {
			const feature = this.generateSpecialFeature();
			if (!vehicle.specialFeatures.includes(feature)) {
				vehicle.specialFeatures.push(feature);
			}
		}

		// Generate description
		vehicle.description = this.generateDescription(vehicle);

		return vehicle;
	}

	private generateVehicleType(): string {
		const types = [
			'cart',
			'wagon',
			'carriage',
			'chariot',
			'ship',
			'boat',
			'galley',
			'airship',
			'flying carpet',
			'sleigh',
			'palanquin',
			'howdah',
			'sedan chair',
			'flying mount saddle',
			'war wagon',
			'merchant vessel',
			'longship',
			'raft',
			'canoe',
			'submersible'
		];
		const index = this.dice.rollInterval(0, types.length - 1);
		return types[index];
	}

	private generateVehicleName(type: string): string {
		const adjectives = [
			'Swift',
			'Mighty',
			'Golden',
			'Iron',
			'Silver',
			'Storm',
			'Thunder',
			'Lightning',
			'Dragon',
			'Phoenix',
			'Wandering',
			'Noble',
			'Royal',
			'Blessed',
			'Cursed',
			'Ancient',
			'Enchanted',
			'Mystic'
		];

		const nouns = [
			'Voyager',
			'Trader',
			'Runner',
			'Seeker',
			'Wanderer',
			'Chariot',
			'Pride',
			'Wind',
			'Star',
			'Dream',
			'Hope',
			'Fortune',
			'Glory',
			'Destiny'
		];

		if (this.dice.random() > 0.3) {
			const adj = adjectives[this.dice.rollInterval(0, adjectives.length - 1)];
			const noun = nouns[this.dice.rollInterval(0, nouns.length - 1)];
			return `The ${adj} ${noun}`;
		} else {
			return this.capitalize(type);
		}
	}

	private generateSpeed(): string {
		const speeds = ['very slow', 'slow', 'moderate', 'fast', 'very fast', 'lightning fast'];
		const index = this.dice.rollInterval(0, speeds.length - 1);
		return speeds[index];
	}

	private generateCapacity(): string {
		const capacities = [
			'1-2 passengers',
			'3-5 passengers',
			'6-10 passengers',
			'11-20 passengers',
			'21-50 passengers',
			'50+ passengers',
			'small cargo',
			'medium cargo',
			'large cargo',
			'massive cargo'
		];
		const index = this.dice.rollInterval(0, capacities.length - 1);
		return capacities[index];
	}

	private generatePropulsion(type: string): string {
		const waterTypes = ['ship', 'boat', 'galley', 'longship', 'merchant vessel', 'submersible'];
		const airTypes = ['airship', 'flying carpet', 'flying mount saddle'];

		if (waterTypes.includes(type)) {
			const waterPropulsion = ['sail', 'oars', 'magical current', 'steam engine', 'elemental power'];
			return waterPropulsion[this.dice.rollInterval(0, waterPropulsion.length - 1)];
		} else if (airTypes.includes(type)) {
			const airPropulsion = ['magical levitation', 'elemental air', 'enchanted fabric', 'rune-powered', 'spirit-bound'];
			return airPropulsion[this.dice.rollInterval(0, airPropulsion.length - 1)];
		} else {
			const landPropulsion = ['horse-drawn', 'oxen-drawn', 'magical', 'self-propelled', 'pushed/pulled', 'steam-powered'];
			return landPropulsion[this.dice.rollInterval(0, landPropulsion.length - 1)];
		}
	}

	private generateSpecialFeature(): string {
		const features = [
			'reinforced armor',
			'concealed compartment',
			'comfortable seating',
			'weather protection',
			'defensive spikes',
			'elegant decoration',
			'hidden weapons',
			'magical wards',
			'speed enchantment',
			'feather fall enchantment',
			'self-repair mechanism',
			'dimensional storage',
			'climate control',
			'invisible mode',
			'amphibious capability',
			'fortified hull',
			'luxurious interior',
			'ram or battering mechanism'
		];
		const index = this.dice.rollInterval(0, features.length - 1);
		return features[index];
	}

	private capitalize(text: string): string {
		if (!text) return '';
		return text.charAt(0).toUpperCase() + text.slice(1);
	}

	private generateDescription(vehicle: Vehicle): string {
		let desc = `${vehicle.name} is a ${vehicle.size} ${vehicle.type} `;
		desc += `made of ${vehicle.material} with ${vehicle.quality} craftsmanship. `;

		desc += `It is ${vehicle.propulsion} and travels at ${vehicle.speed} speed, `;
		desc += `with a capacity of ${vehicle.capacity}. `;

		if (vehicle.specialFeatures.length > 0) {
			desc += `Special features include: ${vehicle.specialFeatures.join(', ')}.`;
		}

		return desc;
	}
}
