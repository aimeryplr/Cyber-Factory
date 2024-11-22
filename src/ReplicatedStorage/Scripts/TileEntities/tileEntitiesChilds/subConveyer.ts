import { Entity } from "ReplicatedStorage/Scripts/Entities/entity";
import { EncodedTileEntity, TileEntity } from "../tileEntity";
import { decodeVector2, decodeVector3, decodeVector3Array } from "ReplicatedStorage/Scripts/Utils/encoding";
import { positionToVector2 } from "ReplicatedStorage/Scripts/Utils/vectorUtils";
import { TileGrid } from "ReplicatedStorage/Scripts/TileGrid/tileGrid";
import { GRID_SIZE } from "ReplicatedStorage/constants";

const MAX_DISTANCE = 5;
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 1;
const category = "subConveyer";


export class SubConveyer extends TileEntity {
    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number, gridBase: BasePart) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS, gridBase);
    }

    tick(progression: number): void {
        return;
    }

    setAllConnectedNeighboursTileEntity(tileGrid: TileGrid): void {
        for (const [neighbourTile, direction] of this.getAllNeighbours(tileGrid)) {
            if ((direction === this.direction)) {
                this.connectOutput(neighbourTile, direction);
            } else {
                this.connectInput(neighbourTile, direction);
            }
        }

        for (let i = -MAX_DISTANCE; i <= MAX_DISTANCE; i++) {
            if (i === 0) continue;

            const neighbourTile = tileGrid.getTileFromPosition(this.position.add(new Vector3(this.direction.X, 0, this.direction.Y).mul(i * GRID_SIZE))) as TileEntity;
            if (neighbourTile && neighbourTile instanceof SubConveyer) {
                this.connectOutput(neighbourTile, this.direction);
                this.connectInput(neighbourTile, this.direction);
            }
        }
    };

    addEntity(entity: Entity): Entity | undefined {
        if (this.outputTiles.isEmpty()) return entity;
        return this.outputTiles[0].addEntity(entity);
    }

    getNewShape(gridBase: BasePart, tilePart?: BasePart): BasePart | undefined {
        return;
    }

    canConnectOutput(neighbourTile: TileEntity, neighbourTileDirection: Vector2): boolean {
        if (neighbourTile.category === "subConveyer") {
            const thisToNeighbour = positionToVector2(neighbourTile.position).sub(positionToVector2(this.position))
            return (this.inputTiles.isEmpty() || this.inputTiles[0].category !== "subConveyer") &&
                neighbourTile.direction === this.direction &&
                (thisToNeighbour).Magnitude <= MAX_DISTANCE * GRID_SIZE;
        } else {
            return neighbourTile.direction !== this.direction.mul(-1) &&
                (this.inputTiles.isEmpty() || this.inputTiles[0].category === "subConveyer");
        }
    }

    canConnectInput(neighbourTile: TileEntity, neighbourTileDirection: Vector2): boolean {
        if (neighbourTile.category === "subConveyer") {
            const thisToNeighbour = positionToVector2(neighbourTile.position).sub(positionToVector2(this.position))
            return (this.outputTiles.isEmpty() || this.outputTiles[0].category !== "subConveyer") &&
                neighbourTile.direction === this.direction &&
                (thisToNeighbour).Magnitude <= MAX_DISTANCE * GRID_SIZE;
        } else {
            return neighbourTile.direction !== this.direction.mul(-1) &&
                (this.outputTiles.isEmpty() || this.outputTiles[0].category === "subConveyer");
        }
    }

    static decode(decoded: unknown, gridBase: BasePart): SubConveyer {
        const data = decoded as EncodedTileEntity;
        const subConveyer = new SubConveyer(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), data.speed, gridBase);
        subConveyer.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        subConveyer.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        return subConveyer;
    }
}