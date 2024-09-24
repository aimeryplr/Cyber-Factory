import Entity from "../../Entities/entity";
import { TileEntity, TileEntityInterface } from "../tileEntity";
import { addSegment, moveItemsInArray, transferContent } from "../conveyerUtils";
import { findBasepartByName } from "../tileEntityUtils";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";

//Setings
const MAX_CONTENT = 6;
const MAX_INPUTS = 1; // help to upgrade to merger or splitter
const MAX_OUTPUTS = 1; // help to upgrade to merger or splitter
const category: string = "conveyer";

class Conveyer implements TileEntityInterface {
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

    // to optimize with pooling
    /**
     * change the basepart depending if the conveyer is turning
     */
    updateShape(tile: TileEntity, gridBase: BasePart): void {
        if (tile.inputTiles.isEmpty() || !(tile.inputTiles[0] instanceof TileEntity)) return;
        const isTurningConveyer = math.abs(tile.direction.X) !== math.abs(tile.inputTiles[0].direction.X);

        if (isTurningConveyer) {
            tile.findThisPartInGridEntities(gridBase)?.Destroy();

            const isTurningLeft = tile.inputTiles[0].direction.X === -tile.direction.Y && tile.inputTiles[0].direction.Y === tile.direction.X;
            const turningConveyer = findBasepartByName(tile.name + (isTurningLeft ? "T" : "TR"), tile.category);
    
            if (turningConveyer) {
                setupObject(turningConveyer, tile.getGlobalPosition(gridBase), tile.getOrientation() + (isTurningLeft ? 0 : math.pi / 2), gridBase);
            }
        }
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

export default Conveyer;
