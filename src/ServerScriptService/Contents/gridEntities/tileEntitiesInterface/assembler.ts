import Entity from "../../Entities/entity";
import { TileEntity, TileEntityInterface } from "../tileEntity";

// Settings
const MAX_INPUTS = 2;
const MAX_OUTPUTS = 1;
const category: string = "assembler";


class Assembler implements TileEntityInterface {
    tick(): void {
        return;
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    getMaxInputs(): number {
        return MAX_INPUTS;
    }
    getMaxOutputs(): number {
        return MAX_OUTPUTS;
    }

    getCategory(): string {
        return category;
    }

    updateShape(tile: TileEntity, gridBase: BasePart): void {
        return;
    }
}

export default Assembler;