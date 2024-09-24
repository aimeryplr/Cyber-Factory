import Entity from "../../Entities/entity";
import Ressource from "../../Entities/ressource";
import RessourceType from "../../Entities/ressourceEnum";
import { TileEntity, TileEntityInterface } from "../tileEntity";

// Settings
const MAX_INPUTS = 0;
const MAX_OUTPUTS = 1;
const category: string = "generator";

class Generator implements TileEntityInterface {
    ressource: RessourceType | undefined;
    ressourceCraftingProgress: number = 0;

    constructor() {
        this.setRessourceType(RessourceType.Copper);
    }

    tick(tileEntity: TileEntity): void {
        if (!this.ressource) return;

        // send the ressource if the item is not full
        if (this.ressourceCraftingProgress >= 20) {
            if (tileEntity.outputTiles[0] !== undefined) {
                const ressource = new Ressource(this.ressource, this.ressource);
                const outpoutedRessource = tileEntity.outputTiles[0].interface.addEntity([ressource]);
                if (outpoutedRessource[0] === undefined) {
                    this.ressourceCraftingProgress = 0;
                }
            }
        } else {
            this.ressourceCraftingProgress += tileEntity.speed;
        }
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    setRessourceType(ressource: RessourceType): void {
        this.ressource = ressource;
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

export default Generator;