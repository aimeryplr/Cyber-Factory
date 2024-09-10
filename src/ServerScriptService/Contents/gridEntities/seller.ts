import Entity from "../Entities/entity";
import GridEntity from "./gridEntity";

// Settings
const MAX_INPUTS = 4;
const MAX_OUTPUTS = 0;

class Seller extends GridEntity {
    constructor(name: String, position: Vector3, direction: Vector2) {
        super(name, position, MAX_INPUTS, MAX_OUTPUTS);
    }
    
    tick(): void {
        return;
    }
    
    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        error("Method not implemented.");
    }

    setAllNeighboursOutAndInTileEntity(gridEntities: Array<GridEntity>, touchedPart: Array<BasePart>, gridBasePosition: Vector3): void {
        if (touchedPart.size() === 0) return;
        // try to find the gridEntity that is touching the assembler from his basepart
        for (let i = 0; i < gridEntities.size(); i++) {
            for (let j = 0; j < touchedPart.size(); j++) {
                const isTouchPartAGridEntity = gridEntities[i].position.X === touchedPart[j].Position.X - gridBasePosition.X && gridEntities[i].position.Z === touchedPart[j].Position.Z - gridBasePosition.Z
                if (isTouchPartAGridEntity) {
                    // try to set the output for every conveyer to the seller
                    gridEntities[i].setInput(this);
                }
            }
        }
    }

    setInput(previousTileEntity: GridEntity): void {
        return;
    }
}

export default Seller;