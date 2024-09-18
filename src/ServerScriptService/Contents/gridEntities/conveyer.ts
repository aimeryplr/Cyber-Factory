import Entity from "../Entities/entity";
import TileEntity from "./tileEntity";
import { addSegment, moveItemsInArray, transferContent } from "./conveyerUtils";
 
//Setings
const MAX_CONTENT = 6;
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 1;
const category: string = "conveyer";

class Conveyer extends TileEntity {
    //new array fill with undifined
    content = new Array<Entity | undefined>(MAX_CONTENT, undefined);

    constructor(name: String, position: Vector3, size: Vector2, speed: number, direction: Vector2) {
        super(name, position, size, direction, speed, MAX_INPUTS, MAX_OUTPUTS, category);
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

