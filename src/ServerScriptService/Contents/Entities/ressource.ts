import Entity from "./entity";
import RessourceType from "./ressourceEnum";

class Ressource extends Entity {
    ressourceType: RessourceType

    constructor(name: string, ressourceType: RessourceType) {
        let calculatedSellPrice = 0;

        // Le prix des ressources est fixe
        if (ressourceType == RessourceType.Plastic) {
            calculatedSellPrice = 5
        }
        else if (ressourceType == RessourceType.Copper) {
            calculatedSellPrice = 10
        }
        else if (ressourceType == RessourceType.Gold) {
            calculatedSellPrice = 15
        }

        super(name, calculatedSellPrice)
        this.ressourceType = ressourceType
    }
}

export default Ressource