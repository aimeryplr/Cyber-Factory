import Entity from "../Entities/entity";
import GridTile from "./gridTile";

abstract class GridEntity extends GridTile {
    inputTiles: Array<GridEntity>;
    outputTiles: Array<GridEntity>;

    constructor(name: String, position: Vector3, maxInputs: number, maxOutputs: number) {
        super(name, position);
        this.inputTiles = new Array<GridEntity>(maxInputs)
        this.outputTiles = new Array<GridEntity>(maxOutputs)
    }

    abstract tick(): void;

    abstract setInput(previousTileEntity: GridEntity): void;
    abstract setOutput(nexTileEntity: GridEntity): void;

    // send an entity to the next GridEntity
    // return the cotent that could not be added to the next GridEntity
    // return empty array if all entities are added to the next GridEntity
    abstract addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined>;

    // Set the output for all entityGrid that are touching the conveyer
    setAllNeighboursOutAndInTileEntity(gridEntities: Array<GridEntity>, touchedPart: Array<BasePart>, gridBasePosition: Vector3): void {
        if (touchedPart.size() === 0) return;
        for (let i = 0; i < gridEntities.size(); i++) {
            for (let j = 0; j < touchedPart.size(); j++) {
                const isTouchPartAGridEntity = gridEntities[i].position.X === touchedPart[j].Position.X - gridBasePosition.X && gridEntities[i].position.Z === touchedPart[j].Position.Z - gridBasePosition.Z
                if (isTouchPartAGridEntity) {
                    // try to set the output for every conveyer
                    this.setOutput(gridEntities[i]);
                    gridEntities[i].setInput(this);
                    this.setInput(gridEntities[i]);
                    gridEntities[i].setOutput(this);
                }
            }
        }
    };
}

export default GridEntity;