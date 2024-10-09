import type Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import Module from "ReplicatedStorage/Scripts/Content/Entities/module";
import RessourceType from "ReplicatedStorage/Scripts/Content/Entities/ressourceEnum";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";

// Settings
const MAX_INPUTS = 2;
const MAX_OUTPUTS = 1;
const MAX_CAPACITY = 10;
const category: string = "assembler";


class Assembler extends TileEntity {
    // mettre type component
    currentCraft: Module | undefined;
    ressources = new Map<RessourceType, number>();

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
    }

    tick(progress: number): void {
        if (this.getProgress(progress) >= this.lastProgress) return;
        if (!this.currentCraft) return;

        // if (this.canCraft()) {
        //     this.outputTiles[0].addEntity([this.craft() as Entity]);
        // }
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        const arrayToReturn = new Array<Entity>();
        if (!entities[0]) return arrayToReturn;
        const entity = entities[0];
        if (!(entity instanceof Ressource)) return arrayToReturn;
        // if (!this.isRessourceNeeded(entity.ressourceType)) return arrayToReturn;

        if (this.ressources.size() < MAX_CAPACITY) {
            this.ressources.set(entity.ressourceType, (this.ressources?.get(entity.ressourceType) ?? 0) + 1);
            return arrayToReturn;
        }
        arrayToReturn.push(entity);
        return arrayToReturn;
    }

    updateShape(gridBase: BasePart): void {
        return;
    }

    private setCraft(craft: Module) {
        this.currentCraft = craft;
    }

    // private isRessourceNeeded(ressourceType: RessourceType): boolean {
    //     if (!this.currentCraft) return false;
    //     for (const [ressource, quantity] of this.currentCraft.buildRessources) {
    //         if (ressourceType === ressource.ressourceType) return true;
    //     }
    //     return false;
    // }

    // private canCraft(): boolean {
    //     if (!this.currentCraft) return false;
    //     for (const [ressourceToHave, quantity] of this.currentCraft.buildRessources) {
    //         if (!this.ressources.has(ressourceToHave.ressourceType)) return false;
    //         if ((this.ressources.get(ressourceToHave.ressourceType) ?? 0) <= quantity) return false;
    //     }
    //     return true;
    // }

    // private craft(): Module | undefined {
    //     if (!this.currentCraft) return;
    //     for (const [ressourceToHave, quantity] of this.currentCraft.buildRessources) {
    //         this.ressources.set(ressourceToHave.ressourceType, (this.ressources.get(ressourceToHave.ressourceType) ?? 0) - quantity);
    //     }
    //     return this.currentCraft;
    // }
}


export default Assembler;