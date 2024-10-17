import type Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";
import { TileEntity } from "../tileEntity";
import { Iron } from "ReplicatedStorage/Scripts/Content/Entities/EntitiesList";
import { decodeVector2, decodeVector3, decodeVector3Array, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/encoding";

// Settings
const MAX_INPUTS = 0;
const MAX_OUTPUTS = 1;
const category: string = "generator";

class Generator extends TileEntity {
    ressource: Ressource | undefined;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
        this.setRessource(Iron)
    }

    tick(progress: number): void {
        if (!this.ressource) return;

        // send the ressource if the item is not full
        if (this.getProgress(progress) < this.lastProgress) {
            if (this.outputTiles[0] !== undefined) {
                const ressourceToTransfer = new Array<Entity>(1, this.ressource.copy());
                this.outputTiles[0].addEntity(ressourceToTransfer);
            }
        }
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    setRessource(ressource: Ressource): void {
        this.ressource = ressource;
        this.speed = ressource.speed;
    }

    updateShape(gridBase: BasePart): void {
        return;
    }

    public encode(): {} {
        return {
            "name": this.name,
            "category": this.category,
            "position": encodeVector3(this.position),
            "size": encodeVector2(this.size),
            "direction": encodeVector2(this.direction),
            "ressource": this.ressource?.ressourceType,
            "outputTiles": this.outputTiles.map((tile) => encodeVector3(tile.position)),
        }
    }

    static decode(decoded: unknown): Generator {
        const data = decoded as {name: string, category:string, position: {x: number, y:number, z:number}, size: {x: number, y:number}, direction:  {x: number, y:number}, ressource: string, outputTiles: Array<{x: number, y: number, z: number}>}
        const generator = new Generator(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), 1);
        generator.setRessource(new Ressource(data.ressource));
        generator.outputTiles = decodeVector3Array(data.outputTiles) as Array<TileEntity>;
        return generator;
    }
}

export default Generator;