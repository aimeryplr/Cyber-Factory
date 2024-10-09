import Entity from "./entity";
import RessourceType from "./ressourceEnum";

class Ressource extends Entity {
    ressourceType: RessourceType

    constructor(name: string, ressourceType: RessourceType) {
        let calculatedSellPrice = 0;
        let speed = 0;

        // Le prix des ressources est fixe
        if (ressourceType === RessourceType.Plastic) {
            calculatedSellPrice = 5
            speed = 60
        }
        else if (ressourceType === RessourceType.Copper) {
            calculatedSellPrice = 7.5
            speed = 40
        }
        else if (ressourceType === RessourceType.Gold) {
            calculatedSellPrice = 10
            speed = 30
        }

        super(name, speed, calculatedSellPrice)
        this.ressourceType = ressourceType
    }
}

export default Ressource