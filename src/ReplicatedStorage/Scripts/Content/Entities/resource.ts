import Entity from "./entity";
import { ResourceType, getResourceFromString } from "./resourceEnum";

class Resource extends Entity {
    resourceType: ResourceType

    constructor(name: string, ressourceType?: ResourceType) {
        let calculatedSellPrice = 0;
        let speed = 0;
        if (!ressourceType) ressourceType = getResourceFromString(name);

        // Le prix des ressources est fixe
        if (ressourceType === ResourceType.Polymer) {
            calculatedSellPrice = 10
            speed = 30
        }
        else if (ressourceType === ResourceType.Copper) {
            calculatedSellPrice = 7.5
            speed = 40
        }
        else if (ressourceType === ResourceType.Carbon) {
            calculatedSellPrice = 5
            speed = 60
        }

        super(name, speed, calculatedSellPrice)
        this.resourceType = ressourceType as ResourceType
    }

    copy(): Resource {
        const newRessource = new Resource(this.name, this.resourceType)
        newRessource.id = this.id
        return newRessource
    }
}

export default Resource