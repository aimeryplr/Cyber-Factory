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
    public buildRessources: Map<Ressource, number>;
    public tier: number;
    public category: string;

    constructor(name: string, buildRessources: Map<Ressource, number>, tier: number, category: string) {
        super(name, calculateSellPrice(buildRessources, tier));
        this.buildRessources = buildRessources;
        this.tier = tier;
        this.category = category;
    }
}

function calculateSellPrice(buildRessources: Map<Ressource, number>, tier: number): number {
    let price = 0;
    for (const [ressource, quantity] of buildRessources) {
        price += ressource.sellPrice * quantity;
    }
    return price * MONEY_COEF * math.pow(10, tier) ;
}

export default Module;