import type Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";
import RessourceType from "ReplicatedStorage/Scripts/Content/Entities/ressourceEnum";
import { TileEntity } from "../tileEntity";

// Settings
const MAX_INPUTS = 0;
const MAX_OUTPUTS = 1;
const category: string = "generator";

class Generator extends TileEntity {
    ressource: RessourceType | undefined;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
        this.ressource = RessourceType.Copper;
    }

    tick(progress: number): void {
        if (!this.ressource) return;

        // send the ressource if the item is not full
        if (this.getProgress(progress) < this.lastProgress) {
            if (this.outputTiles[0] !== undefined) {
                const ressource = new Ressource(this.ressource, this.ressource);
                const ressourceToTransfer = new Array<Entity>(1, ressource);
                this.outputTiles[0].addEntity(ressourceToTransfer);
            }
        }
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    setRessourceType(ressource: RessourceType): void {
        this.ressource = ressource;
    }

    updateShape(gridBase: BasePart): void {
        return;
    }
}

export default Generator;