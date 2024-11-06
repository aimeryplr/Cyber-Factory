import { ReplicatedStorage } from "@rbxts/services";
import { Component, Entity, EntityType } from "./entity";
import { entitiesList } from "./EntitiesList";

/**
*Function that find the roblox component from it information (get it with getComponentInformation)
* @param componentInformation : { name: string, category: string, tier: number, buildRessources: Map<RessourceType, number> }
*/
export function getEntityModel(entity: Entity): BasePart {
    const model = ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild(string.lower(entity.type))?.FindFirstChild(string.lower(entity.name))?.Clone();
    if (!model) error(`Component ${entity.name} not found`);
    return model as BasePart;
}

export function getEntitiesListName(): string[] {
    const entitiesName: string[] = [];
    entitiesList.forEach((entity, name) => {
        entitiesName.push(name);
    });
    return entitiesName;
}

export function calculatePrice(entity: Entity): number {
	if (entity.type === EntityType.RESOURCE) return entity.price;
	if (entity.type === EntityType.COMPONENT) {
		let price = 0;
        const [resource] = (entity as Component).buildRessources;
        price += resource[1] * calculatePrice(entitiesList.get(resource[0])!);
        price *= 60 / (entity as Component).speed;
        price /= (entity as Component).amount; 
		return price;
	}
    if (entity.type === EntityType.MODULE) return entity.price;
    error(`Entity ${entity.name} not found`);
}
