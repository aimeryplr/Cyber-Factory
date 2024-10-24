import Entity from "./entity";
import { RessourceType, getRessourceFromString } from "./ressourceEnum";

class Ressource extends Entity {
    ressourceType: RessourceType

    constructor(name: string, ressourceType?: RessourceType) {
        let calculatedSellPrice = 0;
        let speed = 0;
        if (!ressourceType) ressourceType = getRessourceFromString(name);

        // Le prix des ressources est fixe
        if (ressourceType === RessourceType.Polymer) {
            calculatedSellPrice = 10
            speed = 30
        }
        else if (ressourceType === RessourceType.Copper) {
            calculatedSellPrice = 7.5
            speed = 40
        }
        else if (ressourceType === RessourceType.Carbon) {
            calculatedSellPrice = 5
            speed = 60
        }

        super(name, speed, calculatedSellPrice)
        this.ressourceType = ressourceType as RessourceType
    }

    copy(): Ressource {
        const newRessource = new Ressource(this.name, this.ressourceType)
        newRessource.id = this.id
        return newRessource
    }
}

export default Ressource