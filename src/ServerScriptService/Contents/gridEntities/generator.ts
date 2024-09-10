import Entity from "../Entities/entity";
import Ressource from "../Entities/ressource";
import RessourceType from "../Entities/ressourceEnum";
import Conveyer from "./conveyer";
import GridEntity from "./gridEntity";

// Settings
const MAX_INPUTS = 0;
const MAX_OUTPUTS = 1;

class Generator extends GridEntity {
    speed: number;
    ressource: RessourceType;
    ressourceCraftingProgress: number = 0;

    constructor(name: String, position: Vector3, speed: number) {
        super(name, position, MAX_INPUTS, MAX_OUTPUTS);
        this.speed = speed;
        this.ressource = RessourceType.Plastic;
    }

    tick(): void {
        /*
        if (this.ressourceCraftingProgress >= 100) {
            if (this.outPutTile) {
                if (this.outPutTile instanceof Conveyer) {
                    const addingSuccess = this.outPutTile.addEntity(new Ressource(this.ressource, this.ressource));
                    if (addingSuccess) {
                        print("Ressource added to conveyer");
                        this.ressourceCraftingProgress = 0;
                    } else {
                        print("Ressource not added to conveyer");
                    }
                }
            }
        } else {
            this.ressourceCraftingProgress += this.speed;
        }
        */
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    setRessourceType(ressource: RessourceType): void {
        this.ressource = ressource;
    }

    setAllNeighboursOutAndInTileEntity(gridEntities: Array<GridEntity>, touchedPart: Array<BasePart>, gridBasePosition: Vector3): void {
        return;
    }

    setInput(previousTileEntity: GridEntity): void {
        return
    }
}