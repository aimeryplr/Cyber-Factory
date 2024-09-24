import Entity from "../../Entities/entity";
import { TileEntity } from "../tileEntity";

// Settings
const MAX_INPUTS = 2;
const MAX_OUTPUTS = 1;
const category: string = "assembler";


class Assembler extends TileEntity {
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

export default Assembler;