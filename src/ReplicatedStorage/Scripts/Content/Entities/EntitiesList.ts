import Component from "./component";
import {RessourceType} from "./ressourceEnum";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";

const Iron = new Ressource("Iron", RessourceType.Iron);
const Copper = new Ressource("Copper", RessourceType.Copper);
const Plastic = new Ressource("Plastic", RessourceType.Plastic);

const componentsList: Map<number, Map<string, { name: string, buildRessources: Map<Component | Ressource, number>, speed: number, tier: number}>> = new Map([
    [1, new Map([
        ["Iron Plate", {
            name: "Iron Plate",
            speed: 10,
            tier: 1,
            buildRessources: new Map([[Iron, 1]])
        }]
    ])]
]);

export {componentsList, Iron, Copper, Plastic};