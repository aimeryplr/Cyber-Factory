import Entity from "../../Entities/entity";
import { TileEntity } from "../tileEntity";
import { addSegment, moveItemsInArray, transferContent } from "../conveyerUtils";
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
    tick(tileEntity: TileEntity): void {
        // send the item to the next gridEntity
        if (tileEntity.outputTiles[0] !== undefined) {
            addSegment(this.content, tileEntity.outputTiles[0].addEntity(this.content), MAX_CONTENT - tileEntity.speed);
        };

        // move all the items by the speed amount
        for (let i = MAX_CONTENT; i > 0; i--) {
            moveItemsInArray(this.content, i - tileEntity.speed, tileEntity.speed);
        }
    }

    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        const transferdEntities = transferContent(entities, this.content) as Array<Entity | undefined>;
        return transferdEntities;
    }

    updateShape(gridBase: BasePart): void {
        const newTileName = this.getNewTileName();
        const partToChange = this.findThisPartInGridEntities(gridBase);
        if (partToChange && partToChange.Name === newTileName) return;

        const mergerPart = findBasepartByName(newTileName, this.category);
        partToChange?.Destroy();
        setupObject(mergerPart, this.getGlobalPosition(gridBase), this.getOrientation(), gridBase);
    }

    private getNewTileName(): string {
        const mergerPartName = "merger_" + (this.name as string).split("_")[1];
        if (this.inputTiles.size() === 3) return mergerPartName + "+";
        if (this.inputTiles.filter((neighbourTile) => neighbourTile.direction === this.direction).size() === 0) return mergerPartName + "T";

        const sideConveyer = this.inputTiles.filter((neighbourTile) => neighbourTile.direction !== this.direction)[0];
        if (sideConveyer.direction.X === -this.direction.Y && sideConveyer.direction.Y === this.direction.X) return mergerPartName + "L";
        return mergerPartName + "LR";
    }
}

export default Merger;
