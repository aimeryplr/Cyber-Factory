import Ressource from "../ressource";
import Entity from "../entity";

/*
    PC Component got name, tier, ressource to craft:
    - name : string
    - sellPrice : number
    - buildRessources : Array<Ressource>
    - tier : number
*/
class Component extends Entity {
    public buildRessources: Map<Ressource, number>;
    public tier: number;
    public category: string;

    constructor(name: string, buildRessources: Map<Ressource, number>, tier: number, category: string) {
        let calculatedSellPrice = 0;

        /* Higher is the quantity of ressources, higher is the price */
        const coefChiantitude: number = 1.5;
        let chiantitude: number = 0; 

        /* Higher is the tier of the component, higher is the price */
        const coefTier: number = 10;

        for (const [ressource, quantity] of buildRessources) {
            chiantitude += quantity;
            calculatedSellPrice += ressource.sellPrice * quantity;
        }

        /* Higher is the quantity of ressources, higher is the price */
        chiantitude = chiantitude * coefChiantitude;
        calculatedSellPrice = calculatedSellPrice * chiantitude;

        /* Higher is the tier of the component, higher is the price */
        if (tier > 0) {
            // only if the tier is higher than 0
            calculatedSellPrice = calculatedSellPrice * tier * coefTier;
        }

        super(name, calculatedSellPrice);
        this.buildRessources = buildRessources;
        this.tier = tier;
        this.category = name;
    }
}


export default Component;