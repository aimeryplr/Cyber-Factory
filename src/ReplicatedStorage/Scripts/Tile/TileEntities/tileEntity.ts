import type { TileGrid } from "ReplicatedStorage/Scripts/TileGrid/tileGrid";
import { type Entity } from "ReplicatedStorage/Scripts/Entities/entity";
import Tile, { EncodedTile } from "../tile";
import { getGlobalPosition } from "./Utils/tileEntityUtils";
import { GRID_SIZE } from "ReplicatedStorage/constants";
import { encodeVector2, encodeVector3 } from "../../Utils/encoding";
import { EnergyComponent } from "../../Energy/energyComponent";

const allDirections = [new Vector2(1, 0), new Vector2(0, 1), new Vector2(-1, 0), new Vector2(0, -1)]

export interface EncodedTileEntity extends EncodedTile {
    category: string,
    direction: { x: number, y: number },
    speed: number,
    inputTiles: Array<{ x: number, y: number, z: number }>,
    outputTiles: Array<{ x: number, y: number, z: number }>,
}

abstract class TileEntity extends Tile {
    readonly category: string;
    speed: number // the speed in object per minutes produced
    inputTiles: Array<TileEntity>;
    outputTiles: Array<TileEntity>;
    protected energyComponent: EnergyComponent | undefined;

    maxInputs: number;
    maxOutputs: number;

    lastProgress: number = 0;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, gridBase: BasePart, speed: number, category: string, maxInputs: number, maxOutputs: number) {
        super(name, position, size, direction, gridBase);
        this.category = category;
        this.speed = speed;

        this.maxInputs = maxInputs;
        this.maxOutputs = maxOutputs;
        this.inputTiles = new Array<TileEntity>(this.maxInputs);
        this.outputTiles = new Array<TileEntity>(this.maxOutputs);
    }

    /**
     * called each heartbeat
     * @param progression seconds ellapsed till the last 10 seconds
     */
    abstract tick(progression: number): void;

    /**
     * send an entity to the next GridEntity
     * @param entity the entities to send
     * @returns the entity that could not be added to the next GridEntity
     * @example 
     */
    abstract addEntity(entity: Entity): Entity | undefined;

    /**
     * return the basepart that represent the tileEntity
     * @example Conveyer turn to right -> getNewShape return this new Basepart
     */
    abstract getNewMesh(gridBase: BasePart, tilePart?: BasePart): BasePart | undefined;

    hasEnergyComponent(): boolean {
        return this.energyComponent !== undefined;
    }

    getEnergyComponent(): EnergyComponent {
        if (!this.energyComponent)
            error("EnergyComponent not defined");

        return this.energyComponent;
    }

    updateMesh(gridBase: BasePart): void {
        const currentBasePart = this.findThisPartInWorld();
        if (!currentBasePart) return;

        currentBasePart.Orientation = new Vector3(0, this.getOrientation(), 0);
        currentBasePart.Position = getGlobalPosition(this.position, gridBase);
    };

    addInput(previousTileEntity: TileEntity): void {
        this.inputTiles.push(previousTileEntity);
    };

    addOutput(nexTileEntity: TileEntity): void {
        this.outputTiles.push(nexTileEntity);
    };

    /** 
    * Connect to all neighbours
    */
    setAllConnectedNeighboursTileEntity(tileGrid: TileGrid): void {
        for (const [neighbourTile, direction] of this.getAllNeighbours(tileGrid)) {
            if ((direction === this.direction && !(this.category === "seller"))) {
                this.connectOutput(neighbourTile, direction);
            } else {
                this.connectInput(neighbourTile, direction);
            }
        }
    };

    connectOutput(neighbourTile: TileEntity, direction: Vector2) {
        if (this.canConnectOutput(neighbourTile, direction) && neighbourTile.canConnectInput(this, direction.mul(-1)) && this.hasEnoughOutput() && neighbourTile.hasEnoughInput()) {
            this.outputTiles.push(neighbourTile);
            neighbourTile.addInput(this);
        }
    }

    connectInput(neighbourTile: TileEntity, direction: Vector2) {
        if (this.canConnectInput(neighbourTile, direction) && neighbourTile.canConnectOutput(this, direction.mul(-1)) && this.hasEnoughInput() && neighbourTile.hasEnoughOutput()) {
            this.inputTiles.push(neighbourTile);
            neighbourTile.addOutput(this);
        }
    }

    removeConnection(tileEntity: TileEntity): void {
        this.inputTiles.remove(this.inputTiles.indexOf(tileEntity));
        this.outputTiles.remove(this.outputTiles.indexOf(tileEntity));
    }

    /**
     * @returns a map of all the neighbours of this TileEntity with the direction of from the current TileEntity to the neighbour
     */
    getAllNeighbours(tileGrid: TileGrid): Map<TileEntity, Vector2> {
        const neighbours = new Map<TileEntity, Vector2>();

        const occupiedTiles = tileGrid.getOccupiedTilesIndexes(this);
        for (const occupiedTile of occupiedTiles) {

            for (const direction of allDirections) {
                const neighbourTile = tileGrid.getTile(occupiedTile.X + direction.X, occupiedTile.Y + direction.Y);

                const isNeighbourTile = neighbourTile && neighbourTile !== this && neighbourTile instanceof TileEntity
                if (isNeighbourTile) {
                    neighbours.set(neighbourTile, new Vector2(direction.X, direction.Y));
                }
            }
        }
        return neighbours;
    }

    hasEnoughOutput(): boolean {
        return this.outputTiles.size() < this.maxOutputs;
    }

    hasEnoughInput(): boolean {
        return this.inputTiles.size() < this.maxInputs;
    }

    hasAnyOutputAndInput(): boolean {
        return this.hasEnoughOutput() && this.hasEnoughInput();
    }

    canConnectOutput(neighbourTile: TileEntity, neighbourTileDirection: Vector2): boolean {
        return this.direction === neighbourTileDirection && (neighbourTile.direction !== this.direction.mul(-1) || neighbourTile.category === "seller")
    }

    canConnectInput(neighbourTile: TileEntity, neighbourTileDirection: Vector2): boolean {
        return neighbourTile.direction === neighbourTileDirection.mul(-1)
    }

    rotate(gridBase: BasePart): void {
        this.size = new Vector2(this.size.Y, this.size.X);
        this.direction = new Vector2(-this.direction.Y, this.direction.X);

        if (this.size.X === this.size.Y || (this.size.X % 2 !== 0 && this.size.Y % 2 !== 0)) return;

        const currentPart = this.findThisPartInWorld();
        const offestPosition = new Vector3(-GRID_SIZE / 2, 0, GRID_SIZE / 2)
        const isUp = (this.getOrientation() + 90) % 180 === 0

        this.position = isUp ? this.position.sub(offestPosition) : this.position.add(offestPosition);
        currentPart!.Position = this.getGlobalPosition(gridBase);
    }

    /**
     * always below 1
     */
    getProgress(progress: number): number {
        return (progress * (this.speed / 60)) % 1;
    }

    encode(): EncodedTileEntity {
        return {
            name: this.name,
            category: this.category,
            position: encodeVector3(this.position),
            size: encodeVector2(this.size),
            direction: encodeVector2(this.direction),
            speed: this.speed,
            inputTiles: this.inputTiles.map((tile) => encodeVector3(tile.position)),
            outputTiles: this.outputTiles.map((tile) => encodeVector3(tile.position)),
        };
    };
}

export { TileEntity };