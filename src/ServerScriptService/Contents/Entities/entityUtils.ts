import ComponentList from "ServerScriptService/Contents/Entities/Components/componentsList";
import { ReplicatedStorage } from "@rbxts/services";
import Component from "./Components/component";

/*
Function that return a map with the name, tier, buildRessources of a component :
- name : string
- category : string

return : { name: string, category: string, tier: number, buildRessources: Map<RessourceType, number> }
*/
function getComponentInformation(name: string, category?: string) {
    const AllComponentList = new ComponentList().componentsList;
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
        return new Component(component.name, component.buildRessources, component.tier, component.category);
    } else {
        return null;
    }
}

/*
Function that find the roblox component from it information (get it with getComponentInformation)
- componentInformation : { name: string, category: string, tier: number, buildRessources: Map<RessourceType, number> }

return : Model
*/
function getComponent(componentInformation: Component) {
    const model = ReplicatedStorage.FindFirstChild("components")?.FindFirstChild("pcComponents")?.FindFirstChild(componentInformation.category)?.FindFirstChild(componentInformation.name)?.Clone();
    return model;
}
