import Ressource from "./ressource";
import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";

/*
    - name : string
    - sellPrice : number
    - buildRessources : Array<Ressource>
    - tier : number
*/
const MONEY_COEF: number = 1.2;

class Component extends Entity {
    public buildRessources: Map<Component | Ressource, number>;
    public tier: number;

    constructor(name: string, buildRessources: Map<Component | Ressource, number>, tier: number, speed: number) {
        super(name, speed, calculateComponentSellPrice(buildRessources, tier));
        this.buildRessources = buildRessources;
        this.tier = tier;
    }

    copy(): Component {
        return new Component(this.name, this.buildRessources, this.tier, this.speed);
    }
}

function calculateComponentSellPrice(buildRessources: Map<Component | Ressource, number>, tier: number): number {
    for (const [ressource, quantity] of buildRessources) {
        return (ressource as Entity).sellPrice * quantity * MONEY_COEF * math.pow(10, tier);
    }
    return 0;
}


export {Component, calculateComponentSellPrice};