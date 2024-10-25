import { Component } from "./component";
import { ResourceType } from "./resourceEnum";
import Resource from "ReplicatedStorage/Scripts/Content/Entities/resource";

const Carbon = new Resource("Carbon", ResourceType.Carbon);
const Copper = new Resource("Copper", ResourceType.Copper);
const Polymer = new Resource("Polymer", ResourceType.Polymer);


const componentsList: Map<string, { name: string, price: number, buildRessources: Map<Component | Resource, number>, speed: number, tier: number, amount: number, img: string }> = new Map([
    ["Nanotube", {
        name: "Nanotube",
        price: 25,
        speed: 60,
        tier: 1,
        amount: 2,
        buildRessources: new Map([[Carbon, 1]]),
        img: "rbxasset://textures/ui/GuiImagePlaceholder.png"
    }],
    ["Copper Wire", {
        name: "Copper Wire",
        price: 75,
        speed: 40,
        tier: 1,
        amount: 1,
        buildRessources: new Map([[Copper, 1]]),
        img: "rbxasset://textures/ui/GuiImagePlaceholder.png"
    }],
    ["Polymer Plate", {
        name: "Polymer Plate",
        price: 200,
        speed: 7.5,
        tier: 1,
        amount: 1,
        buildRessources: new Map([[Polymer, 2]]),
        img: "rbxasset://textures/ui/GuiImagePlaceholder.png"
    }]
]);

export { componentsList, Carbon, Copper, Polymer };