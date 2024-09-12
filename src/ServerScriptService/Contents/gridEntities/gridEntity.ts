import Entity from "../Entities/entity";
import GridTile from "./gridTile";

abstract class GridEntity extends GridTile {
    category: string;
    inputTiles: Array<GridEntity>;
    outputTiles: Array<GridEntity>;

    constructor(name: String, position: Vector3, maxInputs: number, maxOutputs: number, category: string) {
        super(name, position);
        this.category = category;
        this.inputTiles = new Array<GridEntity>(maxInputs)
        this.outputTiles = new Array<GridEntity>(maxOutputs)
    }

    abstract tick(): void;

    abstract setInput(previousTileEntity: GridEntity): void;
    abstract setOutput(nexTileEntity: GridEntity): void;

    // return the cotent that could not be added to the next GridEntity
    // return empty array if all entities are added to the next GridEntity
    /**
     * send an entity to the next GridEntity
     * @param entities the entities to send
     * @returns the entities that could not be added to the next GridEntity
     * @example 
     * const entities = [entity1, entity2, entity3]
     * const entitiesNotAdded = addEntity(entities)
     * print(entitiesNotAdded) // [entity1, entity2, entity3]
     * // no entities were send here
     */
    abstract addEntity(entities: Array<Entity|undefined>): Array<Entity|undefined>;

    /** Go through all connected part and try to set the input and output
     * @param touchedPart list of part touching this
     * @param gridEntities list of entities in the plot
     */
    setAllNeighboursOutAndInTileEntity(gridEntities: Array<GridEntity>, touchedPart: Array<BasePart>, gridBasePosition: Vector3): void {
        if (touchedPart.size() === 0) return;
        for (let i = 0; i < gridEntities.size(); i++) {
            for (let j = 0; j < touchedPart.size(); j++) {
                const isTouchPartAGridEntity = gridEntities[i].position.X === touchedPart[j].Position.X - gridBasePosition.X && gridEntities[i].position.Z === touchedPart[j].Position.Z - gridBasePosition.Z
                if (isTouchPartAGridEntity) {
                    // try to set the output for every conveyer
                    this.flowEntities(gridEntities[i]);
                }
            }
        }
    };

    flowEntities(gridEntity: GridEntity): void {
        this.setOutput(gridEntity);
        gridEntity.setInput(this);
        this.setInput(gridEntity);
        gridEntity.setOutput(this);
    }

    findThisPartInGridEntities(gridEntities: Array<BasePart>, gridBasePosition: Vector3): BasePart | undefined {
        for (let i = 0; i < gridEntities.size(); i++) {
            if (gridEntities[i].Position.X === this.position.X + gridBasePosition.X && gridEntities[i].Position.Z === this.position.Z + gridBasePosition.Z) {
                return gridEntities[i];
            }
        }
        return undefined;
    }
}

export default GridEntity;