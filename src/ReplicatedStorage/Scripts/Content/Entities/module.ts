import {Component} from "./component";
import Ressource from "./ressource";
import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";

/**
PC Component got name, tier, ressource to craft:
- name : string
- sellPrice : number
- buildRessources : Array<Ressource>
- tier : number
*/

const MONEY_COEF: number = 1.5;

class Module extends Entity {
    public buildRessources: Map<Ressource | Component, number>;
    public tier: number;

    constructor(name: string, speed: number, buildRessources: Map<Ressource | Component, number>, tier: number) {
        super(name, speed, calculateSellPrice(buildRessources, tier));
        this.buildRessources = buildRessources;
        this.tier = tier;
    }

    copy(): Module {
        return new Module(this.name, this.speed, this.buildRessources, this.tier);
    }
}

function calculateSellPrice(buildRessources: Map<Ressource | Component, number>, tier: number): number {
    let price = 0;
    for (const [ressource, quantity] of buildRessources) {
        price += ressource.sellPrice * quantity;
    }
    return price * MONEY_COEF * math.pow(10, tier) ;
}

export default Module;