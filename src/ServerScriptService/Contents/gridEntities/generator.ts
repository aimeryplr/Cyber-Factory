import Entity from "../Entities/entity";
import Ressource from "../Entities/ressource";
import RessourceType from "../Entities/ressourceEnum";
import Conveyer from "./conveyer";
import TileEntity from "./tileEntity";

// Settings
const MAX_INPUTS = 0;
const MAX_OUTPUTS = 1;
const category: string = "generator";

class Generator extends TileEntity {
    ressource: RessourceType | undefined;
    ressourceCraftingProgress: number = 0;

    constructor(name: String, position: Vector3, size: Vector2, speed: number, direction: Vector2) {
        super(name, position, size, direction, speed, MAX_INPUTS, MAX_OUTPUTS, category);
        this.ressource = RessourceType.Gold;
    }

    tick(): void {
        if(!this.ressource) return;

        // send the ressource if the item is not full
        if (this.ressourceCraftingProgress >= 20) {
            if (this.outputTiles[0] !== undefined) {
                const ressource = new Ressource(this.ressource, this.ressource);
                const outpoutedRessource = this.outputTiles[0].addEntity([ressource]);
                if (outpoutedRessource[0] === undefined) {
                    this.ressourceCraftingProgress = 0;
                }
            }
        } else {
            this.ressourceCraftingProgress += this.speed;
        }
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    setRessourceType(ressource: RessourceType): void {
        this.ressource = ressource;
    }
}

export default Generator;