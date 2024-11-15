import { Component, Entity, EntityType } from "./entity";

const entitiesList: Map<string, Entity> = new Map([
    ["Carbon", {
        name: "Carbon",
        type: EntityType.RESOURCE,
        price: 5,
        speed: 60,
        tier: 1,
        img: "93301290863222"
    }],
    ["Copper", {
        name: "Copper",
        type: EntityType.RESOURCE,
        price: 7.5,
        speed: 40,
        tier: 1,
        img: "118964977749377"
    }],
    ["Polymer", {
        name: "Polymer",
        type: EntityType.RESOURCE,
        price: 10,
        speed: 30,
        tier: 1,
        img: "77850599598548"
    }],
    ["Carbon Plate", {
        name: "Carbon Plate",
        type: EntityType.COMPONENT,
        price: 0,
        speed: 60,
        tier: 2,
        amount: 1,
        buildRessources: new Map([["Carbon", 1]]),
        img: "137293900370769"
    }],
    ["Carbon Tube", {
        name: "Carbon Tube",
        type: EntityType.COMPONENT,
        price: 25,
        speed: 30,
        tier: 2,
        amount: 1,
        buildRessources: new Map([["Carbon", 1]]),
        img: "121133500136214"
    }],
    ["Graphene", {
        name: "Graphene",
        type: EntityType.COMPONENT,
        price: 25,
        speed: 20,
        tier: 3,
        amount: 2,
        buildRessources: new Map([["Carbon Tube", 1]]),
        img: "121133500136214"
    }],
    ["Copper Wire", {
        name: "Copper Wire",
        type: EntityType.COMPONENT,
        price: 75,
        speed: 30,
        tier: 2,
        amount: 1,
        buildRessources: new Map([["Copper", 2]]),
        img: "132068672463196"
    }],
    ["Cable", {
        name: "Cable",
        type: EntityType.COMPONENT,
        price: 75,
        speed: 60,
        tier: 3,
        amount: 1,
        buildRessources: new Map([["Copper Wire", 1]]),
        img: "83365248520022"
    }],
    ["Polymer Plate", {
        name: "Polymer Plate",
        type: EntityType.COMPONENT,
        price: 200,
        speed: 30,
        tier: 2,
        amount: 3,
        buildRessources: new Map([["Polymer", 1]]),
        img: "117139242770582"
    }],
    ["Reinforced Plate", {
        name: "Reinforced Plate",
        type: EntityType.MODULE,
        price: 200,
        speed: 15,
        tier: 4,
        amount: 4,
        buildRessources: new Map([["Polymer Plate", 4], ["Carbon Plate", 1]]),
        img: "72135719150285"
    }],
    ["Reinforced Tube", {
        name: "Reinforced Tube",
        type: EntityType.MODULE,
        price: 500,
        speed: 30,
        tier: 4,
        amount: 1,
        buildRessources: new Map([["Copper Wire", 1], ["Carbon Tube", 1]]),
        img: "80960427076344"
    }],
    ["Reinforced Wire", {
        name: "Reinforced Wire",
        type: EntityType.MODULE,
        price: 1000,
        speed: 30,
        tier: 4,
        amount: 1,
        buildRessources: new Map([["Carbon Tube", 1], ["Copper Wire", 1]]),
        img: "99029709439290"
    }],
    // ["Transistor", {
    //     name: "Transistor",
    //     type: EntityType.MODULE,
    //     price: 500,
    //     speed: 20,
    //     tier: 5,
    //     amount: 1,
    //     buildRessources: new Map([["Copper Wire", 1], ["Graphene", 2]]),
    //     img: "78163969660914"
    // }],
]);

function calculateBalancedPrice(entity: Entity): number {
    if (entity.type === EntityType.RESOURCE) return entity.price;
	if (entity.type === EntityType.COMPONENT) {
		let price = 0;
        const [resource] = (entity as Component).buildRessources;
        price += resource[1] * calculateBalancedPrice(entitiesList.get(resource[0])!);
        price *= 60 / (entity as Component).speed;
        price /= (entity as Component).amount; 
		return price
	}
    if (entity.type === EntityType.MODULE) {
        let price = 0;
        const [resourceOne, resourceTwo] = (entity as Component).buildRessources;
        price += resourceOne[1] * calculateBalancedPrice(entitiesList.get(resourceOne[0])!);
        price += resourceTwo[1] * calculateBalancedPrice(entitiesList.get(resourceTwo[0])!);
        price *= 60 / (entity as Component).speed;
        price /= (entity as Component).amount; 
		return price;
    };
    error(`Entity ${entity.name} not found`);
}

function calculatePrice(entity: Entity): number {
	return math.round(calculateBalancedPrice(entity) * entity.tier*10)/10;
}

for (const [name, entity] of entitiesList) {
    entity.price = calculatePrice(entity);
    entitiesList.set(name, entity);
}

export { entitiesList };