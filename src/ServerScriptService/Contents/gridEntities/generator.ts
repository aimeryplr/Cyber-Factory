import Entity from "../Entities/entity";
import Ressource from "../Entities/ressource";
import RessourceType from "../Entities/ressourceEnum";
import Conveyer from "./conveyer";
import GridEntity from "./gridEntity";

// Settings
const MAX_INPUTS = 0;
const MAX_OUTPUTS = 1;
const category: string = "generator";

class Generator extends GridEntity {
    speed: number;
    ressource: RessourceType;
    ressourceCraftingProgress: number = 0;

    constructor(name: String, position: Vector3, speed: number) {
        super(name, position, MAX_INPUTS, MAX_OUTPUTS, category);
        this.speed = speed;
        this.ressource = RessourceType.Plastic;
    }

    tick(): void {
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

    setInput(previousTileEntity: GridEntity): void {
        return
    }

    setOutput(nextTileEntity: GridEntity): void {
        this.outputTiles.push(nextTileEntity);
    }

    flowEntities(gridEntity: GridEntity): void {
        this.setOutput(gridEntity);
        gridEntity.setInput(this);
    }
}

export default Generator;