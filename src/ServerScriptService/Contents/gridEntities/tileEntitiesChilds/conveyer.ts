import Entity from "../../Entities/entity";
import { TileEntity } from "../tileEntity";
import { addSegment, moveItemsInArray, transferContent } from "../conveyerUtils";
import { findBasepartByName } from "../tileEntityUtils";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";

//Setings
const MAX_CONTENT = 6;
const MAX_INPUTS = 1; // help to upgrade to merger or splitter
const MAX_OUTPUTS = 1; // help to upgrade to merger or splitter
const category: string = "conveyer";

class Conveyer extends TileEntity {
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

    // to optimize with pooling
    /**
     * change the basepart depending if the conveyer is turning
     */
    updateShape(gridBase: BasePart): void {
        const conveyerBasepart = this.findThisPartInWorld(gridBase);

        if (!this.inputTiles.isEmpty() && this.inputTiles[0] instanceof TileEntity) {
            const isTurningConveyer = math.abs(this.direction.X) !== math.abs(this.inputTiles[0].direction.X);
            const isAlreadyTurningConveyer = conveyerBasepart?.Name.match('/T|TR/') !== undefined;

            if (isTurningConveyer && !isAlreadyTurningConveyer) {
                conveyerBasepart?.Destroy();
    
                const isTurningLeft = this.inputTiles[0].direction.X === -this.direction.Y && this.inputTiles[0].direction.Y === this.direction.X;
                const turningConveyer = findBasepartByName(this.name + (isTurningLeft ? "T" : "TR"), this.category);
    
                setupObject(turningConveyer, this.getGlobalPosition(gridBase), this.getOrientation() + (isTurningLeft ? 0 : math.pi / 2), gridBase);
            }
        } else {
            const isAlreadyStraightConveyer = conveyerBasepart?.Name === this.name;
            if (!isAlreadyStraightConveyer) {
                conveyerBasepart?.Destroy();
                const newPart = findBasepartByName((this.name) as string)
                print(newPart)
                setupObject(newPart, this.getGlobalPosition(gridBase), this.getOrientation(), gridBase);
            }
        }
    }
}

export default Conveyer;
