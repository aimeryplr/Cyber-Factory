import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import type Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import { findBasepartByName } from "../tileEntityUtils";
import { addBackContent, moveItemsInArray, removeSegment, shiftOrder, transferArrayContent } from "../conveyerUtils";
import Conveyer from "./conveyer";
import TileGrid from "ServerScriptService/plot/gridTile";
import { decodeVector2, decodeVector3, decodeVector3Array, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/encoding";

// Settings
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 3;
const category: string = "splitter";
const MAX_SIZE: number = 6;

class Splitter extends TileEntity {
    content: Array<Entity | undefined>;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
        this.content = new Array<Entity | undefined>(MAX_SIZE, undefined);
    }

    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            // send the item to the next gridEntity
            for (const outputTile of this.outputTiles) {
                const canOutpoutEntity = outputTile instanceof Conveyer && outputTile.content[outputTile.getMaxContentSize() - 1] === undefined && this.content[0] !== undefined;
                if (!canOutpoutEntity) continue;
                shiftOrder(this.outputTiles);

                const arrayToAddBack = outputTile.addEntity(removeSegment(this.content, 0, 0) as Array<Entity | undefined>);
                addBackContent(arrayToAddBack, this.content, MAX_SIZE);
                break;
            }

            // move all the items by the speed amount
            moveItemsInArray(this.content, MAX_SIZE);
        }
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entities: Array<Entity>): Array<Entity | undefined> {
        const transferdEntities = transferArrayContent(entities, this.content, MAX_SIZE) as Array<Entity | undefined>;
        return transferdEntities;
    }

    encode(): {} {
        return {
            "name": this.name,
            "category": this.category,
            "position": encodeVector3(this.position),
            "size": encodeVector2(this.size),
            "direction": encodeVector2(this.direction),
            "speed": this.speed,
            "inputTiles": this.inputTiles.map((tile) => encodeVector3(tile.position)),
            "outputTiles": this.outputTiles.map((tile) => encodeVector3(tile.position)),
        }
    }

    static decode(decoded: unknown): Splitter {
        const data = decoded as { name: string, position: { x: number, y: number, z: number }, size: { x: number, y: number }, direction: { x: number, y: number }, speed: number, inputTiles: Array<{x: number, y: number, z: number}>, outputTiles: Array<{x: number, y: number, z: number}> };
        const splitter = new Splitter(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), data.speed);
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

    updateShape(gridBase: BasePart): void {
        const currentPart = this.findThisPartInWorld(gridBase);
        const basepartName = this.getBasepartName();

        const isAlreadySplitter = currentPart?.Name === basepartName;
        if (!isAlreadySplitter) {
            currentPart?.Destroy();
            const newPart = findBasepartByName((basepartName) as string, this.category)
            setupObject(newPart, this.getGlobalPosition(gridBase), this.getOrientation(), gridBase);
        }
    }

    private getBasepartName(): string {
        return "splitter_" + (this.name as string).split("_")[1];
    }
}

export default Splitter