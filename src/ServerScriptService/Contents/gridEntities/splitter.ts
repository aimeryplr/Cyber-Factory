import Entity from "../Entities/entity";
import Ressource from "../Entities/ressource";
import TileEntity from "./tileEntity";

// Settings
const MAX_INPUTS = 0;
const MAX_OUTPUTS = 2;
const category: string = "splitter";
const maxCapacity: number = 2;

class Splitter extends TileEntity {
    //Settings

    constructor(name: String, position: Vector3, size: Vector2, speed: number, direction: Vector2) {
        super(name, position, size, direction, speed, MAX_INPUTS, MAX_OUTPUTS, category);
    }

    tick(): void {
        return;
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    setInput(previousTileEntity: TileEntity): void {
        return;
    }

    setOutput(nextTileEntity: TileEntity): void {
        return;
    }
}

export default Splitter