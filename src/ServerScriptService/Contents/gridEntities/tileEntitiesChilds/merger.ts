import Entity from "../../Entities/entity";
import { TileEntity } from "../tileEntity";
import { addSegment, moveItemsInArray, removeSegment, transferArrayContentToArrayPart } from "../conveyerUtils";
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
                this.outputTiles[0].addEntity(removeSegment(this.content, 0, 0) as Array<Entity | undefined>);
            };

            // move all the items by the speed amount
            moveItemsInArray(this.content);
        }
        this.lastProgress = this.getProgress(progress);
    }

    /**
     * Adds entity to the content array and choose a free place depending of the number of connected tile entities
     */
    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        const transferdEntities = transferArrayContentToArrayPart(entities, this.content, this.inputTiles.size(), 6) as Array<Entity | undefined>;
        return transferdEntities;
    }

    updateShape(gridBase: BasePart): void {
        const newTileName = this.getBasepartName();
        const partToChange = this.findThisPartInWorld(gridBase);
        if (partToChange && partToChange.Name === newTileName) return;

        const mergerPart = findBasepartByName(newTileName, this.category);
        partToChange?.Destroy();
        setupObject(mergerPart, this.getGlobalPosition(gridBase), this.getOrientation(), gridBase);
    }

    private getBasepartName(): string {
        const mergerPartName = "merger_" + (this.name as string).split("_")[1];
        if (this.inputTiles.size() === 3) return mergerPartName + "+";
        if (this.inputTiles.filter((neighbourTile) => neighbourTile.direction === this.direction).size() === 0) return mergerPartName + "T";

        const sideConveyer = this.inputTiles.filter((neighbourTile) => neighbourTile.direction !== this.direction)[0];
        if (sideConveyer.direction.X === -this.direction.Y && sideConveyer.direction.Y === this.direction.X) return mergerPartName + "L";
        return mergerPartName + "LR";
    }
}

export default Merger;
