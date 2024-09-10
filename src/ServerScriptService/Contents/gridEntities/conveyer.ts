import Entity from "../Entities/entity";
import { addSegment, removeSegment } from "./conveyerContents";
import GridEntity from "./gridEntity";

//Setings
const MAX_CONTENT = 6;
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 1;

class Conveyer extends GridEntity {
    speed: number;
    direction: Vector2;
    //new array fill with undifined
    content = new Array<Entity | undefined>(MAX_CONTENT, undefined);

    constructor(name: String, position: Vector3, direction: Vector2, speed: number) {
        super(name, position, MAX_INPUTS, MAX_OUTPUTS);
        this.speed = speed;
        this.direction = direction;
    }

    // Set the output of the conveyer if facing the right direction
    setInput(nextTileEntity: GridEntity): void {
        const touchPartDirection = new Vector2(nextTileEntity.position.X - this.position.X, nextTileEntity.position.Z - this.position.Z)
        const isTouchPartOutTileEntity = touchPartDirection.div(touchPartDirection.Magnitude) === this.direction.mul(-1)
        if (isTouchPartOutTileEntity) {
            this.inputTiles[1] = nextTileEntity
        }
    }

    tick(): void { 
        addSegment(this.content, removeSegment(this.content, MAX_CONTENT - this.speed, MAX_CONTENT), MAX_CONTENT - this.speed);
        for (let i = MAX_CONTENT; i > 0; i--) {
            //to do
        }
    }
    
    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        //TODO
        return entities;
    }
}

export default Conveyer;

