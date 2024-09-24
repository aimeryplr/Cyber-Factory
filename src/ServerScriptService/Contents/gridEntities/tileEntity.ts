import TileGrid from "ServerScriptService/plot/gridTile";
import Entity from "../Entities/entity";
import Tile from "./tile";
import { copyArray } from "./conveyerUtils";

const allDirections = [new Vector2(1, 0), new Vector2(0, 1), new Vector2(-1, 0), new Vector2(0, -1)]

abstract class TileEntity extends Tile {
    category: string;
    direction: Vector2;
    speed: number
    inputTiles: Array<TileEntity>;
    outputTiles: Array<TileEntity>;

    maxInputs: number;
    maxOutputs: number;

    constructor(name: String, position: Vector3, size: Vector2, direction: Vector2, speed: number, category: string, maxInputs: number, maxOutputs: number) {
        super(name, position, size);
        this.category = category;
        this.speed = speed;
        this.direction = direction;

        this.maxInputs = maxInputs;
        this.maxOutputs = maxOutputs;
        this.inputTiles = new Array<TileEntity>(this.maxInputs);
        this.outputTiles = new Array<TileEntity>(this.maxOutputs);
    }

    abstract tick(tileEntity: TileEntity): void;

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
    abstract addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined>;

    abstract updateShape(gridBase: BasePart): void;

    setInput(previousTileEntity: TileEntity): void {
        this.inputTiles.push(previousTileEntity);
    };

    setOutput(nexTileEntity: TileEntity): void {
        this.outputTiles.push(nexTileEntity);
    };

    /** Go through all connected part and try to set the input and output
     * @param touchedPart list of part touching this
     * @param gridEntities list of entities in the plot
    */
    setAllConnectedNeighboursTileEntity(tileGrid: TileGrid): void {
        for (const [neighbourTile, direction] of this.getAllNeighbours(tileGrid)) {
            if (direction === this.direction && !(this.category === "seller")) {
                this.connectOutput(neighbourTile);
            } else {
                this.connectInput(neighbourTile, direction);
            }
        }
    };

    private connectOutput(neighbourTile: TileEntity) {
        if (this.canConnectOutput(neighbourTile)) {
            this.outputTiles.push(neighbourTile);
            neighbourTile.setInput(this);
        }
    }

    private connectInput(neighbourTile: TileEntity, direction: Vector2) {
        if (this.canConnectInput(neighbourTile, direction)) {
            this.inputTiles.push(neighbourTile);
            neighbourTile.setOutput(this);
        }
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

    private hasEnoughOutput(): boolean {
        return this.outputTiles.size() < this.maxOutputs;
    }

    protected hasEnoughInput(): boolean {
        return this.inputTiles.size() < this.maxInputs;
    }

    canConnectOutput(neighbourTile: TileEntity): boolean {
        if (neighbourTile.direction !== this.direction.mul(-1)) {
            const hasAnyOutputAndInput = this.hasEnoughOutput() && neighbourTile.hasEnoughInput();
            return hasAnyOutputAndInput
        }
        return false;
    }


    canConnectInput(neighbourTile: TileEntity, neighbourTileDirection: Vector2): boolean {
        if (neighbourTile.direction === neighbourTileDirection.mul(-1)) {
            const hasAnyOutputAndInput = this.hasEnoughInput() && neighbourTile.hasEnoughOutput();
            return hasAnyOutputAndInput
        }
        return false;
    }

    findThisPartInWorld(gridBase: BasePart): BasePart | undefined {
        const gridPart = gridBase.FindFirstChild("PlacedObjects")?.GetChildren() as Array<BasePart>;
        const gridBasePosition = gridBase.Position;

        for (let i = 0; i < gridPart.size(); i++) {
            if (gridPart[i].Position.X === this.position.X + gridBasePosition.X && gridPart[i].Position.Z === this.position.Z + gridBasePosition.Z) {
                return gridPart[i];
            }
        }
        return undefined;
    }

    getOrientation(): number {
        return math.atan2(this.direction.Y, this.direction.X)
    }

    getGlobalPosition(gridBase: BasePart): Vector3 {
        return this.position.add(gridBase.Position).sub(new Vector3(0, gridBase.Size.Y / 2, 0))
    }
}

export { TileEntity };