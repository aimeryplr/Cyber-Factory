import { ReplicatedStorage } from "@rbxts/services";
import { Entity } from "./entity";
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
