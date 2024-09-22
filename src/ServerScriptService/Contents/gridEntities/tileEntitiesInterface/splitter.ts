import Entity from "../../Entities/entity";
import Ressource from "../../Entities/ressource";
import { TileEntity, TileEntityInterface } from "../tileEntity";

// Settings
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 3;
const category: string = "splitter";
const maxCapacity: number = 2;

class Splitter implements TileEntityInterface {
    content = new Array<Entity | undefined>(maxCapacity, undefined);

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
}

export default Splitter