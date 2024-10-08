import componentList from "ReplicatedStorage/Scripts/Content/Entities/componentsList";
import { ReplicatedStorage } from "@rbxts/services";
import Module from "./module";

/*
Function that return a map with the name, tier, buildRessources of a component :
- name : string
- category : string

return : { name: string, category: string, tier: number, buildRessources: Map<RessourceType, number> }
*/
function getComponentInformation(name: string, category?: string) {
    const AllComponentList = componentList;
    let component;

    if (category) {
        component = AllComponentList.get(category)?.get(name);
    } else {
        for (const [_, components] of AllComponentList) {
            component = components.get(name);
            if (component) {
                return component;
            }
        }
    }

    if (component) {
        return new Module(component.name, component.buildRessources, component.tier, component.category);
    } else {
        return undefined;
    }
}

/**
*Function that find the roblox component from it information (get it with getComponentInformation)
* @param componentInformation : { name: string, category: string, tier: number, buildRessources: Map<RessourceType, number> }
*/
function getComponent(componentInformation: Module): BasePart | undefined {
    const model = ReplicatedStorage.FindFirstChild("components")?.FindFirstChild("pcComponents")?.FindFirstChild(componentInformation.category)?.FindFirstChild(componentInformation.name)?.Clone();
    return model as BasePart;
}