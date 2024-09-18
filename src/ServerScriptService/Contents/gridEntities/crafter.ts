import Component from "../Entities/Components/component";
import Entity from "../Entities/entity";
import Ressource from "../Entities/ressource";
import TileEntity from "./tileEntity";

// Settings
const MAX_INPUTS = 3;
const MAX_OUTPUTS = 1;
const category: string = "crafter";

class Crafter extends TileEntity {
    // mettre type component
    currentCraft: Component | undefined;
    ressources = new Array<Ressource>()

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

export default Crafter;