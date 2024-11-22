import { EncodedTileEntity, TileEntity } from "../tileEntity";
import { moveItemsInArray, shiftOrder } from "../Utils/conveyerUtils";
import Conveyor from "./conveyor";
import type { TileGrid } from "ReplicatedStorage/Scripts/TileGrid/tileGrid";
import { decodeVector2, decodeVector3, decodeVector3Array, encodeArray, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/Utils/encoding";
import { CONTENT_SIZE } from "ReplicatedStorage/constants";
import { type Entity } from "ReplicatedStorage/Scripts/Entities/entity";

// Settings
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 3;
const category: string = "splitter";

export interface EncodedSplitter extends EncodedTileEntity {
    content: Array<Entity | undefined>
}

class Splitter extends TileEntity {
    content = new Array<Entity | undefined>(CONTENT_SIZE, undefined);

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number, gridBase: BasePart) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS, gridBase);
    }

    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            // send the item to the next gridEntity
            if (this.content[0]) {
                for (const outputTile of this.outputTiles) {
                    const canOutpoutEntity = outputTile instanceof Conveyor && outputTile.content[CONTENT_SIZE - 1] === undefined && this.content[0] !== undefined;
                    if (!canOutpoutEntity) continue;
                    shiftOrder(this.outputTiles);

                    this.content[0] = this.outputTiles[0].addEntity(this.content[0]);
                    break;
                }
            }

            // move all the items by the speed amount
            moveItemsInArray(this.content, CONTENT_SIZE);
        }
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entity: Entity): Entity | undefined {
        if (this.content[CONTENT_SIZE - 1] !== undefined) return entity;
        this.content[CONTENT_SIZE - 1] = entity;
        return
    }

    encode(): {} {
        return {
            ...super.encode(),
            "content": encodeArray(this.content, CONTENT_SIZE)
        }
    }

    static decode(decoded: unknown, gridBase: BasePart): Splitter {
        const data = decoded as EncodedSplitter;
        const splitter = new Splitter(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), data.speed, gridBase);
        splitter.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        splitter.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        return splitter;
    }

    setAllConnectedNeighboursTileEntity(tileGrid: TileGrid): void {
        for (const [neighbourTile, direction] of this.getAllNeighbours(tileGrid)) {
            if (this.direction === direction.mul(-1)) {
                this.connectInput(neighbourTile, direction);
            } else {
                this.connectOutput(neighbourTile, direction);
            }
        }
    };

    canConnectOutput(neighbourTile: TileEntity, neighbourTileDirection: Vector2): boolean {
        return neighbourTile.direction !== this.direction.mul(-1)
    }

    getNewShape(): BasePart | undefined {
        return;
    }

    private getBasepartName(): string {
        return "splitter_" + (this.name as string).split("_")[1];
    }
}

export default Splitter