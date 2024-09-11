import Entity from "../Entities/entity";
import Ressource from "../Entities/ressource";
import GridEntity from "./gridEntity";

// Settings
const MAX_INPUTS = 0;
const MAX_OUTPUTS = 2;
const category: string = "splitter";

class Splitter extends GridEntity {
    //Settings
    speed: number;
    maxCapacity: number;

    constructor(name: String, position: Vector3, speed: number, maxCapacity: number) {
        super(name, position, MAX_INPUTS, MAX_OUTPUTS, category);
        this.speed = speed;
        this.maxCapacity = maxCapacity;
    }

    tick(): void {
        return;
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    setInput(previousTileEntity: GridEntity): void {
        return;
    }

    setOutput(nextTileEntity: GridEntity): void {
        return;
    }
}

export default Splitter