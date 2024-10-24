/**
 * entities goind on the conveyer and crafted by machines
 * @param sellPrice the price of the entity
 * @param speed production speed
 */

class Entity {
	sellPrice: number;
	name: string;
	speed: number = 0;

	id: number | undefined; // used to identify the entity in the conveyer


	constructor(name: string, speed: number, sellPrice: number, id?: number) {
		this.sellPrice = sellPrice;
		this.name = name;
		this.speed = speed;
		this.id = id;
	}

	copy(): Entity {
		return new Entity(this.name, this.speed, this.sellPrice, this.id);
	}
}

export default Entity;
