import { Component } from "./component";
import { RessourceType } from "./ressourceEnum";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";

const Carbon = new Ressource("Carbon", RessourceType.Carbon);
const Copper = new Ressource("Copper", RessourceType.Copper);
const Polymer = new Ressource("Polymer", RessourceType.Polymer);


const componentsList: Map<string, { name: string, buildRessources: Map<Component | Ressource, number>, speed: number, tier: number, amount: number, img: string }> = new Map([
    ["Nanotube", {
        name: "Nanotube",
        speed: 60,
        tier: 1,
        buildRessources: new Map([[Carbon, 1]]),
        amount: 1,
        img: "rbxasset://textures/ui/GuiImagePlaceholder.png"
    }],
    ["Copper Wire", {
        name: "Copper Wire",
        speed: 20,
        tier: 1,
        buildRessources: new Map([[Copper, 2]]),
        amount: 3,
        img: "rbxasset://textures/ui/GuiImagePlaceholder.png"
    }],
    ["Polymer Plate", {
        name: "Polymer Plate",
        speed: 15,
        tier: 1,
        buildRessources: new Map([[Polymer, 2]]),
        amount: 1,
        img: "rbxasset://textures/ui/GuiImagePlaceholder.png"
    }]
]);

export { componentsList, Carbon, Copper, Polymer };