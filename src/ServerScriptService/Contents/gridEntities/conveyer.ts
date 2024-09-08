import GridEntity from "./gridEntity";

class Conveyer extends GridEntity {
    speed: number;
    direction: Vector2;
    nextTileEntity: GridEntity | undefined;

    constructor(name: String, position: Vector3, speed: number, direction: Vector2) {
        super(name, position);
        this.speed = speed;
        this.direction = direction;
    }

    setNextTileEntity(nextTileEntity: GridEntity): void {
        this.nextTileEntity = nextTileEntity;
    }

    tick(): void {
        return;
    }
}

export default Conveyer;