import Entity from "../Entities/entity";
import GridEntity from "./gridEntity";

// Settings
const MAX_INPUTS = 2;
const MAX_OUTPUTS = 1;

class Assembler extends GridEntity {
    speed: number;

    constructor(name: String, position: Vector3, speed: number) {
        super(name, position, MAX_INPUTS, MAX_OUTPUTS);
        this.speed = speed;
    }

    tick(): void {
        return;
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        return entities;
    }

    setInput(previousTileEntity: GridEntity): void {
        return;
    }
    
    setOutput(nextTileEntity: GridEntity): void {
        return;
    }
}

export default Assembler;