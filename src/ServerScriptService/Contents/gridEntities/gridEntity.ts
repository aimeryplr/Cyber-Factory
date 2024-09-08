import GridTile from "./gridTile";

abstract class GridEntity extends GridTile {
    constructor(name: String, position: Vector3) {
        super(name, position);
    }

    abstract tick(): void;
}

export default GridEntity;