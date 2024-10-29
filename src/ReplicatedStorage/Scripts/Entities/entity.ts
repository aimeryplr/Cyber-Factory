/**
 * entities goind on the conveyer and crafted by machines
 * @param sellPrice the price of the entity
 * @param speed production speed
 */

export interface Entity {
	price: number;
	name: string;
	speed: number;
	img: string;
	tier: number;
	type: EntityType;

	id?: number; // used to identify the entity in the conveyer
}

export interface Component extends Entity {
	buildRessources: Map<string, number>;
	tier: number;
	amount: number;
}


export enum EntityType {
	RESOURCE = "Resource",
	COMPONENT = "Component",
	MODULE = "Module"
}
