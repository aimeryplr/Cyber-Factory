import Entity from "../Entities/entity";
import GridEntity from "./gridEntity";
import { addSegment, moveItemsInArray, transferContent } from "./conveyerUtils";
import { GRID_SIZE } from "ReplicatedStorage/Scripts/placementHandler";

//Setings
const MAX_CONTENT = 6;
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 1;
const category: string = "conveyer";

class Conveyer extends GridEntity {
    speed: number;
    direction: Vector2;
    //new array fill with undifined
    content = new Array<Entity | undefined>(MAX_CONTENT, undefined);

    constructor(name: String, position: Vector3, speed: number, direction: Vector2) {
        super(name, position, MAX_INPUTS, MAX_OUTPUTS, category);
        this.speed = speed;
        this.direction = direction;
    }

    // change to set the input and output mutual
    /**
     * @param previousTileEntity the entity connected on the side or behind this conveyer
     */
    setInput(previousTileEntity: GridEntity): void {
        const touchPartDirection = new Vector2(this.position.X - previousTileEntity.position.X, this.position.Z - previousTileEntity.position.Z)
        const isTouchPartOutTileEntity = touchPartDirection.div(touchPartDirection.Magnitude) !== this.direction.mul(-1)
        if (previousTileEntity instanceof Conveyer && isTouchPartOutTileEntity && previousTileEntity.outputTiles[0] === undefined) {
            if (previousTileEntity.position.add(new Vector3(previousTileEntity.direction.X, 0, previousTileEntity.direction.Y).mul(GRID_SIZE)) === this.position) {
                this.inputTiles[0] = previousTileEntity
            }
        }
        else if (isTouchPartOutTileEntity) {
            this.inputTiles[0] = previousTileEntity
        }
    }

    setOutput(nextTileEntity: GridEntity): void {
        const touchPartDirection = new Vector2(this.position.X - nextTileEntity.position.X, this.position.Z - nextTileEntity.position.Z)
        const isTouchPartOutTileEntity = touchPartDirection.div(touchPartDirection.Magnitude) === this.direction
        if (isTouchPartOutTileEntity) {
            this.outputTiles[0] = nextTileEntity
        }
    }

    /**
     * move all items on the conveyer
     */
    tick(): void {
        // send the item to the next gridEntity
        if (this.outputTiles[0] !== undefined) {
            addSegment(this.content, this.outputTiles[0].addEntity(this.content), MAX_CONTENT - this.speed);
        };

        // move all the items by the speed amount
        for (let i = MAX_CONTENT; i > 0; i--) {
            moveItemsInArray(this.content, i - this.speed, this.speed);
        }
    }
    
    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        const transferdEntities = transferContent(entities, this.content) as Array<Entity | undefined>;
        return transferdEntities;
    }
}

export default Conveyer;

