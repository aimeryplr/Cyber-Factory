import Entity from "./entity";
import {RessourceType, getRessourceFromString } from "./ressourceEnum";

class Ressource extends Entity {
    ressourceType: RessourceType

    constructor(name: string, ressourceType?: RessourceType) {
        let calculatedSellPrice = 0;
        let speed = 0;
        if (!ressourceType) ressourceType = getRessourceFromString(name);

        // Le prix des ressources est fixe
        if (ressourceType === RessourceType.Plastic) {
            calculatedSellPrice = 5
            speed = 60
        }
        else if (ressourceType === RessourceType.Iron) {
            calculatedSellPrice = 7.5
            speed = 40
        }
        else if (ressourceType === RessourceType.Copper) {
            calculatedSellPrice = 10
            speed = 30
        }

        super(name, speed, calculatedSellPrice)
        this.ressourceType = ressourceType as RessourceType
    }

    copy(): Ressource {
        return new Ressource(this.name, this.ressourceType)
    }
}

export default Ressource