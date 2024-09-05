import Entity from "./entities";
import RessourceType from "./ressourceEnum";

class Ressource extends Entity {
    ressourceType: RessourceType

    constructor(ressourceType: RessourceType, sellPrice: number) {
        super(sellPrice)
        this.ressourceType = ressourceType
    }
}

export default Ressource