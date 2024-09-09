import Entity from "../Entities/entity";
import Ressource from "../Entities/ressource";
import GridEntity from "./gridEntity";

//Setings
const MAX_CONTENT = 6;

class Conveyer extends GridEntity {
    speed: number;
    direction: Vector2;
    outPutTile: GridEntity | undefined;
    content = new Array<Entity>(MAX_CONTENT);

    constructor(name: String, position: Vector3, direction: Vector2, speed: number) {
        super(name, position);
        this.speed = speed;
        this.direction = direction;
    }

    // Set the output of the conveyer if facing the right direction
    setOutput(nextTileEntity: GridEntity): void {
        const touchPartDirection = new Vector2(nextTileEntity.position.X - this.position.X, nextTileEntity.position.Z - this.position.Z)
        const isTouchPartOutTileEntity = touchPartDirection.div(touchPartDirection.Magnitude) === this.direction
        if (isTouchPartOutTileEntity) {
            this.outPutTile = nextTileEntity
        }
    }

    tick(): void {
        return;
    }

    // Set the output for all entityGrid that are touching the conveyer
    setAllNeighboursOutAndInTileEntity(gridEntities: Array<GridEntity>, touchedPart: Array<BasePart>, gridBasePosition: Vector3): void {
        if (touchedPart.size() === 0) return;
        for (let i = 0; i < gridEntities.size(); i++) {
            for (let j = 0; j < touchedPart.size(); j++) {
                const isTouchPartAGridEntity = gridEntities[i].position.X === touchedPart[j].Position.X - gridBasePosition.X && gridEntities[i].position.Z === touchedPart[j].Position.Z - gridBasePosition.Z
                if (isTouchPartAGridEntity) {
                    // try to set the output for every conveyer
                    this.setOutput(gridEntities[i])
                    gridEntities[i].setOutput(this)
                }
            }
        }
        print(gridEntities)
    }

    addEntity(entity: Entity): boolean {
        if (this.content[MAX_CONTENT] !== undefined) return false;
        else {
            this.content[MAX_CONTENT] = entity;
            return true;
        }
    }
}

export default Conveyer;