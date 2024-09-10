import Entity from "../Entities/entity";
import Ressource from "../Entities/ressource";
import GridEntity from "./gridEntity";

// Settings
const MAX_INPUTS = 3;
const MAX_OUTPUTS = 1;

class Crafter extends GridEntity {
    //Settings
    speed: number;
    maxCapacity: number;

    // mettre type component
    currentCraft = undefined;
    ressources = new Array<Ressource>()

    constructor(name: String, position: Vector3, speed: number, maxCapacity: number) {
        super(name, position, MAX_INPUTS, MAX_OUTPUTS);
        this.speed = speed;
        this.maxCapacity = maxCapacity;
    }

    tick(): void {
        return;
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    setAllNeighboursOutAndInTileEntity(gridEntities: Array<GridEntity>, touchedPart: Array<BasePart>, gridBasePosition: Vector3): void {
        return;
    }

    setInput(previousTileEntity: GridEntity): void {
        return;
    }
}

export default Crafter;