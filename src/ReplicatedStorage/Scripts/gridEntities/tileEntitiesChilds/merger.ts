import type Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import { addBackContent, moveItemsInArray, removeSegment, shiftOrder, transferArrayContentToArrayPart } from "../conveyerUtils";
import { findBasepartByName } from "../tileEntityUtils";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";

//Setings
const MAX_CONTENT = 6;
const MAX_INPUTS = 3;
const MAX_OUTPUTS = 1;
const category: string = "merger";

class Merger extends TileEntity {
    //new array fill with undifined
    content = new Array<Entity | undefined>(MAX_CONTENT, undefined);

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
    }

    /**
     * move all items on the conveyer
     */
    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            // send the item to the next gridEntity
            if (this.outputTiles[0] !== undefined) {
                const arrayToAddBack = this.outputTiles[0].addEntity(removeSegment(this.content, 0, 0) as Array<Entity | undefined>);
                addBackContent(arrayToAddBack, this.content, MAX_CONTENT);
            };

            // move all the items by the speed amount
            moveItemsInArray(this.content, MAX_CONTENT);
            shiftOrder(this.inputTiles);
        }
        this.lastProgress = this.getProgress(progress);
    }

    /**
     * Adds entity to the content array and choose a free place depending of the number of connected tile entities
     */
    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        const transferdEntities = transferArrayContentToArrayPart(entities, this.content, this.inputTiles.size(), MAX_CONTENT) as Array<Entity | undefined>;
        return transferdEntities;
    }

    updateShape(gridBase: BasePart): void {
        const currentPart = this.findThisPartInWorld(gridBase);
        const basepartName = this.getBasepartName();

        const isAlreadyMerger = currentPart?.Name === basepartName;
        if (!isAlreadyMerger) {
            currentPart?.Destroy();
            const newPart = findBasepartByName((basepartName) as string, this.category)
            setupObject(newPart, this.getGlobalPosition(gridBase), this.getOrientation(), gridBase);
        }
    }

    private getBasepartName(): string {
        return "merger_" + (this.name as string).split("_")[1];
    }
}

export default Merger;
