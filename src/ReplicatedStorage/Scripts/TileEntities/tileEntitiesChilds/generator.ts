import { Entity, EntityType } from "ReplicatedStorage/Scripts/Entities/entity";
import { EncodedTileEntity, TileEntity } from "../tileEntity";
import { decodeVector2, decodeVector3, decodeVector3Array, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/Utils/encoding";
import { entitiesList } from "ReplicatedStorage/Scripts/Entities/EntitiesList";
import tileEntitiesList from "../tileEntitiesList";
import { Efficiency } from "../Utils/efficiency";

// Settings
const MAX_INPUTS = 0;
const MAX_OUTPUTS = 1;
const category: string = "generator";
const EFFICIENCY_HISTORY_SIZE = 10;

export interface EncodedGenerator extends EncodedTileEntity {
    ressource: string | undefined,
    lastProgress: number,
    efficiency: { efficiency: number, successHistory: boolean[], successHistorySize: number; },
}

class Generator extends TileEntity {
    ressource: Entity | undefined;
    private efficiency = new Efficiency(EFFICIENCY_HISTORY_SIZE);

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number, gridBase: BasePart) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS, gridBase);
    }

    tick(progress: number): void {
        if (!this.ressource) return;

        // send the ressource if the item is not full
        if (this.getProgress(progress) < this.lastProgress) {
            if (this.outputTiles[0]) {
                const ressourceToTransfer = table.clone(this.ressource);
                this.efficiency.addSuccess(this.outputTiles[0].addEntity(ressourceToTransfer) === undefined);
            }
        }
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entity: Entity): Entity | undefined {
        return entity;
    }

    setRessource(ressource: Entity): void {
        assert(ressource.type === EntityType.RESOURCE, "The entity is not a ressource");

        this.ressource = ressource;
        this.ressource.id = 0;
        this.speed = ressource.speed;
    }

    getNewShape(): BasePart | undefined {
        return;
    }

    public encode(): {} {
        return {
            ...super.encode(),
            "ressource": this.ressource?.name,
            "lastProgress": this.lastProgress,
            "efficiency": this.efficiency.encode(),
        }
    }

    static decode(decoded: unknown, gridBase: BasePart): Generator {
        const data = decoded as EncodedGenerator;
        const generator = new Generator(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), 1, gridBase);
        generator.lastProgress = data.lastProgress;
        if (data.ressource) generator.setRessource(entitiesList.get(data.ressource) as Entity);
        generator.efficiency = data.efficiency ? Efficiency.decode(data.efficiency) : new Efficiency(EFFICIENCY_HISTORY_SIZE);
        generator.outputTiles = decodeVector3Array(data.outputTiles) as Array<TileEntity>;
        return generator;
    }

    static getPrice(timesPlaced: number): number {
        return tileEntitiesList.get("generator")!.price * math.pow(2, timesPlaced);
    }

    public getEfficiency(): number {
        return this.efficiency.getEfficiency();
    }
}

export default Generator;