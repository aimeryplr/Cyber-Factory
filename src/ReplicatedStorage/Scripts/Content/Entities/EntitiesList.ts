import {Component} from "./component";
import {RessourceType} from "./ressourceEnum";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";

const Iron = new Ressource("Iron", RessourceType.Iron);
const Copper = new Ressource("Copper", RessourceType.Copper);
const Plastic = new Ressource("Plastic", RessourceType.Plastic);

// 
const componentsList: Map<string, { name: string, buildRessources: Map<Component | Ressource, number>, speed: number, tier: number, img: string}> = new Map([
    ["Iron Plate", {
        name: "Iron Plate",
        speed: 10,
        tier: 1,
        buildRessources: new Map([[Iron, 1]]),
        img: "rbxasset://textures/ui/GuiImagePlaceholder.png"
    }],
    ["Copper Wire", {
        name: "Copper Wire",
        speed: 10,
        tier: 1,
        buildRessources: new Map([[Copper, 1]]),
        img: "rbxasset://textures/ui/GuiImagePlaceholder.png"
    }]
]);

export {componentsList, Iron, Copper, Plastic};