import { ReplicatedStorage } from "@rbxts/services";
import { Entity } from "./entity";

/**
*Function that find the roblox component from it information (get it with getComponentInformation)
* @param componentInformation : { name: string, category: string, tier: number, buildRessources: Map<RessourceType, number> }
*/
function getEntityModel(entity: Entity): BasePart {
    const model = ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild(string.lower(entity.type))?.FindFirstChild(string.lower(entity.name))?.Clone();
    if (!model) error(`Component ${entity.name} not found`);
    return model as BasePart;
}

export { getEntityModel };