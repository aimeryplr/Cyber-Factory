import Entity from "../../Entities/entity";
import { TileEntity } from "../tileEntity";

// Settings
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 3;
const category: string = "splitter";
const maxCapacity: number = 2;

class Splitter extends TileEntity {
    content = new Array<Entity | undefined>(maxCapacity, undefined);

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
    }

    tick(): void {
        return;
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }
    
    updateShape(gridBase: BasePart): void {
        return;
    }
}

export default Splitter