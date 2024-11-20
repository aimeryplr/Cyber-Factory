import { Entity } from "ReplicatedStorage/Scripts/Entities/entity";
import { TileEntity } from "../tileEntity";
import { encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/Utils/encoding";

export class SubConveyerInput extends TileEntity {
    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, "subConveyerInput", 1, 1);
    }

    tick(progression: number): void {
        return;
    }

    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined> {
        return [];
    }

    getNewShape(gridBase: BasePart, tilePart?: BasePart): BasePart | undefined {
        return;
    }

    encode(): {} {
        return {
            "name": this.name,
            "category": this.category,
            "position": encodeVector3(this.position),
            "size": encodeVector2(this.size),
            "direction": encodeVector2(this.direction),
            "speed": this.speed
        }
    }
}