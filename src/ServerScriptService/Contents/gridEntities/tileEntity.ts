import TileGrid from "ServerScriptService/plot/gridTile";
import Entity from "../Entities/entity";
import Tile from "./tile";
import Seller from "./tileEntitiesInterface/seller";

const allDirections = [new Vector2(1, 0), new Vector2(0, 1), new Vector2(-1, 0), new Vector2(0, -1)]

interface TileEntityInterface {
    tick(tileEntity: TileEntity): void;

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
    addEntity(entities: Array<Entity | undefined>): Array<Entity | undefined>;

    getMaxInputs(): number;
    getMaxOutputs(): number;
    getCategory(): string;
}

class TileEntity extends Tile {
    category: string;
    direction: Vector2;
    speed: number
    inputTiles: Array<TileEntity>;
    outputTiles: Array<TileEntity>;
    interface: TileEntityInterface;

    maxInputs: number;
    maxOutputs: number;

    constructor(name: String, position: Vector3, size: Vector2, direction: Vector2, tileEntityInterface: TileEntityInterface, speed: number, category: string) {
        super(name, position, size);
        this.interface = tileEntityInterface;
        this.category = category;
        this.speed = speed;
        this.direction = direction;
        

        this.maxInputs = tileEntityInterface.getMaxInputs();
        this.maxOutputs = tileEntityInterface.getMaxOutputs();
        this.inputTiles = new Array<TileEntity>(this.maxInputs);
        this.outputTiles = new Array<TileEntity>(this.maxOutputs);
    }

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
            if (direction === this.direction && !(this.interface instanceof Seller)) {
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

    getAllNeighbours(tileGrid: TileGrid): Map<TileEntity, Vector2> {
        const neighbours = new Map<TileEntity, Vector2>();

        const occupiedTiles = tileGrid.getOccupiedTilesIndexes(this);
        for (const occupiedTile of occupiedTiles) {

            for (const direction of allDirections) {
                const neighbourTile = tileGrid.getTile(occupiedTile.X + direction.X, occupiedTile.Y + direction.Y);
                
                const isNeighbourTile = neighbourTile && neighbourTile !== this && neighbourTile instanceof TileEntity
                if (isNeighbourTile) {
                    neighbours.set(neighbourTile, direction);
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

    findThisPartInGridEntities(gridEntities: Array<BasePart>, gridBasePosition: Vector3): BasePart | undefined {
        for (let i = 0; i < gridEntities.size(); i++) {
            if (gridEntities[i].Position.X === this.position.X + gridBasePosition.X && gridEntities[i].Position.Z === this.position.Z + gridBasePosition.Z) {
                return gridEntities[i];
            }
        }
        return undefined;
    }
}

export {TileEntity, TileEntityInterface};