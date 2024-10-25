import { componentsList } from "ReplicatedStorage/Scripts/Content/Entities/EntitiesList";
import { ReplicatedStorage } from "@rbxts/services";
import { Component } from "./component";
import { ResourceType } from "./resourceEnum";
import Module from "./module";

/*
Function that return a map with the name, tier, buildRessources of a component :
- name : string
- category : string

return : { name: string, category: string, tier: number, buildRessources: Map<RessourceType, number> }
*/
function getComponent(name: string): Component | Module {
    const AllComponentList = componentsList;
    const component = AllComponentList.get(name);

    if (component) {
        return new Component(component.name, component.price, component.buildRessources, component.tier, component.speed, component.amount);
    } else {
        error(`Component ${name} not found`);
    }
}

/**
*Function that find the roblox component from it information (get it with getComponentInformation)
* @param componentInformation : { name: string, category: string, tier: number, buildRessources: Map<RessourceType, number> }
*/
function getComponentModel(componentInformation: Component): BasePart {
    const model = ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild(componentInformation.name)?.Clone();
    if (!model) error(`Component ${componentInformation.name} not found`);
    return model as BasePart;
}

function getRessource(ressourceType: ResourceType): BasePart {
    const model = ReplicatedStorage.FindFirstChild("ressources")?.FindFirstChild(ressourceType.lower())?.Clone();
    if (!model) error(`Ressource ${ressourceType} not found`);
    return model as BasePart;
}

export { getComponent, getComponentModel };