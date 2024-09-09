import Ressource from "../Entities/ressource";
import GridEntity from "./gridEntity";

class Splitter extends GridEntity {
    //Settings
    speed: number;
    maxCapacity: number;

    constructor(name: String, position: Vector3, speed: number, maxCapacity: number) {
        super(name, position);
        this.speed = speed;
        this.maxCapacity = maxCapacity;
    }

    tick(): void {
        return;
    }

    setAllNeighboursOutAndInTileEntity(gridEntities: Array<GridEntity>, touchedPart: Array<BasePart>, gridBasePosition: Vector3): void {
        return;
    }

    setOutput(nextTileEntity: GridEntity): void {
        return;
    }
}

export default Splitter