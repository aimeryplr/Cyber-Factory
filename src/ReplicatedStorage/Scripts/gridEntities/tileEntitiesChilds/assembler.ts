import type Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import Module from "ReplicatedStorage/Scripts/Content/Entities/module";
import { ResourceType } from "ReplicatedStorage/Scripts/Content/Entities/resourceEnum";
import Resource from "ReplicatedStorage/Scripts/Content/Entities/resource";
import { decodeVector3Array, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/encoding";

// Settings
const MAX_INPUTS = 2;
const MAX_OUTPUTS = 1;
const MAX_CAPACITY = 10;
const category: string = "assembler";


class Assembler extends TileEntity {
    // mettre type component
    currentCraft: Module | undefined;
    ressources = new Map<ResourceType, number>();

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
        if (!(entity instanceof Resource)) return arrayToReturn;
        // if (!this.isRessourceNeeded(entity.ressourceType)) return arrayToReturn;

        if (this.ressources.size() < MAX_CAPACITY) {
            this.ressources.set(entity.resourceType, (this.ressources?.get(entity.resourceType) ?? 0) + 1);
            return arrayToReturn;
        }
        arrayToReturn.push(entity);
        return arrayToReturn;
    }

    encode(): {} {
        return {
            "name": this.name,
            "category": this.category,
            "position": encodeVector3(this.position),
            "direction": encodeVector2(this.direction),
            "inputTiles": this.inputTiles.map((tile) => encodeVector3(tile.position)),
            "outputTiles": this.outputTiles.map((tile) => encodeVector3(tile.position)),
            "currentCraft": this.currentCraft?.name
        }
    }

    static decode(decoded: unknown): Assembler {
        const data = decoded as { name: string, position: { x: number, y: number, z: number }, size: { x: number, y: number }, direction: { x: number, y: number }, speed: number, inputTiles: Array<{ x: number, y: number, z: number }>, outputTiles: Array<{ x: number, y: number, z: number }> };
        const assembler = new Assembler(data.name, new Vector3(data.position.x, data.position.y, data.position.z), new Vector2(data.size.x, data.size.y), new Vector2(data.direction.x, data.direction.y), data.speed);
        assembler.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        assembler.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        return assembler;
    }

    getNewShape(): BasePart | undefined {
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