import GridTile from "./gridTile";

abstract class GridEntity extends GridTile {
    constructor(name: String, position: Vector3) {
        super(name, position);
    }

    abstract tick(): void;

    abstract setAllNeighboursOutAndInTileEntity(gridEntities: Array<GridEntity>, touchedPart: Array<BasePart>, gridBasePosition: Vector3): void;

    abstract setOutput(nextTileEntity: GridEntity): void;
}

export default GridEntity;