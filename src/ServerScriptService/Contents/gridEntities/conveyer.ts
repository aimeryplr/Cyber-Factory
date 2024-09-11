import Entity from "../Entities/entity";
import GridEntity from "./gridEntity";
import { addSegment, moveItemsInArray, transferContent } from "./conveyerUtils";

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

    // Set the output of the conveyer if facing the right direction
    setInput(previousTileEntity: GridEntity): void {
        const touchPartDirection = new Vector2(previousTileEntity.position.X - this.position.X, previousTileEntity.position.Z - this.position.Z)
        const isTouchPartOutTileEntity = touchPartDirection.div(touchPartDirection.Magnitude) !== this.direction
        if (isTouchPartOutTileEntity) {
            this.inputTiles[0] = previousTileEntity
        }
    }

    setOutput(nextTileEntity: GridEntity): void {
        const touchPartDirection = new Vector2(nextTileEntity.position.X - this.position.X, nextTileEntity.position.Z - this.position.Z)
        const isTouchPartOutTileEntity = touchPartDirection.div(touchPartDirection.Magnitude) === this.direction
        if (isTouchPartOutTileEntity) {
            this.outputTiles[0] = nextTileEntity
        }
    }

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

