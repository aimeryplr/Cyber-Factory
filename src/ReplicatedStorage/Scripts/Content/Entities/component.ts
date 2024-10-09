import Ressource from "./ressource";
import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";

/*
    PC Component got name, tier, ressource to craft:
    - name : string
    - sellPrice : number
    - buildRessources : Array<Ressource>
    - tier : number
*/
const MONEY_COEF: number = 1.2;

class Component extends Entity {
    public buildRessources: LuaTuple<Array<Component | Ressource | number>>;
    public tier: number;
    public category: string;

    constructor(name: string, buildRessources: any, tier: number, speed: number, category: string) {
        super(name, speed, calculateSellPrice(buildRessources, tier));
        this.buildRessources = buildRessources;
        this.tier = tier;
        this.category = category;
    }
}

function calculateSellPrice(buildRessources: LuaTuple<Array<Component | Ressource | number>>, tier: number) {
    const [ressource, quantity] = buildRessources
    return (ressource as Entity).sellPrice * (quantity as number) * MONEY_COEF * math.pow(10, tier);
}


export default Component;