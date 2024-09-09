import Ressource from "../Entities/ressource";
import RessourceType from "../Entities/ressourceEnum";
import Conveyer from "./conveyer";
import GridEntity from "./gridEntity";

class Generator extends GridEntity {
    speed: number;
    ressource: RessourceType;
    ressourceCraftingProgress: number = 0;
    outPutTile: GridEntity | undefined;

    constructor(name: String, position: Vector3, speed: number) {
        super(name, position);
        this.speed = speed;
        this.ressource = RessourceType.Plastic;
    }

    tick(): void {
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
            
    }

    setRessourceType(ressource: RessourceType): void {
        this.ressource = ressource;
    }

    setAllNeighboursOutAndInTileEntity(gridEntities: Array<GridEntity>, touchedPart: Array<BasePart>, gridBasePosition: Vector3): void {
        return;
    }

    setOutput(nextTileEntity: GridEntity): void {
        this.outPutTile = nextTileEntity;
    }
}