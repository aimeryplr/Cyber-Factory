import Entity from "../../Entities/entity";
import { TileEntity, TileEntityInterface } from "../tileEntity";
import { addSegment, moveItemsInArray, transferContent } from "../conveyerUtils";
import { findBasepartByName } from "../tileEntityUtils";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";

//Setings
const MAX_CONTENT = 6;
const MAX_INPUTS = 3;
const MAX_OUTPUTS = 1;
const category: string = "merger";

class Merger implements TileEntityInterface {
    //new array fill with undifined
    content = new Array<Entity | undefined>(MAX_CONTENT, undefined);

    /**
     * move all items on the conveyer
     */
    tick(tileEntity: TileEntity): void {
        // send the item to the next gridEntity
        if (tileEntity.outputTiles[0] !== undefined) {
            addSegment(this.content, tileEntity.outputTiles[0].interface.addEntity(this.content), MAX_CONTENT - tileEntity.speed);
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

    updateShape(tile: TileEntity, gridBase: BasePart): void {
        const newTileName = this.getNewTileName(tile);
        const partToChange = tile.findThisPartInGridEntities(gridBase);
        if (partToChange && partToChange.Name === newTileName) return;

        const mergerPart = findBasepartByName(newTileName, this.getCategory());
        partToChange?.Destroy();
        setupObject(mergerPart, tile.getGlobalPosition(gridBase), tile.getOrientation(), gridBase);
    }

    private getNewTileName(tile: TileEntity): string {
        const mergerPartName = "merger_" + (tile.name as string).split("_")[1];
        if (tile.inputTiles.size() === 3) return mergerPartName + "+";
        if (tile.inputTiles.filter((neighbourTile) => neighbourTile.direction === tile.direction).size() === 0) return mergerPartName + "T";

        const sideConveyer = tile.inputTiles.filter((neighbourTile) => neighbourTile.direction !== tile.direction)[0];
        if (sideConveyer.direction.X === -tile.direction.Y && sideConveyer.direction.Y === tile.direction.X) return mergerPartName + "L";
        return mergerPartName + "LR";
    }

    getMaxInputs(): number {
        return MAX_INPUTS;
    }
    getMaxOutputs(): number {
        return MAX_OUTPUTS;
    }

    getCategory(): string {
        return category;
    }
}

export default Merger;
