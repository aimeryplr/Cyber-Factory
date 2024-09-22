import Component from "../../Entities/Components/component";
import Entity from "../../Entities/entity";
import Ressource from "../../Entities/ressource";
import { TileEntity, TileEntityInterface } from "../tileEntity";

// Settings
const MAX_INPUTS = 3;
const MAX_OUTPUTS = 1;
const category: string = "crafter";

class Crafter implements TileEntityInterface {
    // mettre type component
    currentCraft: Component | undefined;
    ressources = new Array<Ressource>()

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

export default Crafter;