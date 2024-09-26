import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import Entity from "../../Entities/entity";
import { TileEntity } from "../tileEntity";
import { findBasepartByName } from "../tileEntityUtils";
import { moveItemsInArray, removeSegment, transferArrayContent } from "../conveyerUtils";

// Settings
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 3;
const category: string = "splitter";
const MAX_CONTENT: number = 6;

class Splitter extends TileEntity {
    content: Array<Array<Entity | undefined>>;
    flip = 0;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);

        this.content = new Array(3)
        for (let i = 0; i < 3; i++) {
            this.content[i] = new Array<Entity | undefined>(MAX_CONTENT, undefined);
        }
    }

    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            // send the item to the next gridEntity
            for (let i = 0; i < this.outputTiles.size(); i++) {
                if (this.outputTiles[i] !== undefined) {
                    this.outputTiles[i].addEntity(removeSegment(this.content[i], 0, 0) as Array<Entity | undefined>);
                };
            }

            // move all the items by the speed amount
            for (let i = 0; i < 3; i++) {
                moveItemsInArray(this.content[i]);
            }
        }
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entities: Array<Entity>): Array<Entity | undefined> {
        const transferdEntities = transferArrayContent(entities, this.content[this.flip], MAX_CONTENT) as Array<Entity | undefined>;
        this.incrementFlip();
        return transferdEntities;
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

    private incrementFlip() {
        this.flip = (this.flip + 1) % this.outputTiles.size();
    }
}

export default Splitter