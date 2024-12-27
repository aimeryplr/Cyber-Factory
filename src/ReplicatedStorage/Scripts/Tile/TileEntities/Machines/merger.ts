import { EncodedTileEntity, TileEntity } from "../tileEntity";
import { moveItemsInArray, shiftOrder, transferItemToArray } from "../Utils/conveyerUtils";
import { decodeVector2, decodeVector3, decodeVector3Array, encodeArray, EncodedArray, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/Utils/encoding";
import { CONTENT_SIZE } from "ReplicatedStorage/constants";
import { Entity } from "ReplicatedStorage/Scripts/Entities/entity";

//Setings
const MAX_INPUTS = 3;
const MAX_OUTPUTS = 1;
const category: string = "merger";

export interface EncodedMerger extends EncodedTileEntity {
    content: EncodedArray<Entity>,
}

class Merger extends TileEntity {
    //new array fill with undifined
    content = new Array<Entity | undefined>(CONTENT_SIZE, undefined);

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, gridBase: BasePart, speed: number) {
        super(name, position, size, direction, gridBase, speed, category, MAX_INPUTS, MAX_OUTPUTS);
    }

    /**
     * move all items on the conveyer
     */
    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            // send the item to the next gridEntity
            if (this.outputTiles[0] !== undefined && this.content[0] !== undefined) {
                this.content[0] = this.outputTiles[0].addEntity(this.content[0]);
            };

            // move all the items by the speed amount
            moveItemsInArray(this.content, CONTENT_SIZE);
        }
        this.lastProgress = this.getProgress(progress);
    }

    /**
     * Adds entity to the content array and choose a free place depending of the number of connected tile entities
     */
    addEntity(entity: Entity): Entity | undefined {
        const transferdEntities = transferItemToArray(entity, this.content, this.inputTiles.size(), CONTENT_SIZE) as Entity | undefined;
        if (transferdEntities) return transferdEntities;

        shiftOrder(this.inputTiles)
    }

    encode(): EncodedMerger {
        return {
            ...super.encode(),
            "content": encodeArray(this.content, CONTENT_SIZE)
        }
    }

    static decode(decoded: unknown, gridBase: BasePart): Merger {
        const data = decoded as EncodedMerger;
        const merger = new Merger(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), gridBase as BasePart, data.speed);

        merger.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        merger.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        return merger;
    }

    getNewMesh(): BasePart | undefined {
        return;
    }
}

export default Merger;
