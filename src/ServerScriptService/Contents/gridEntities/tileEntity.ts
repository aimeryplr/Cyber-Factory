import TileGrid from "ServerScriptService/plot/gridTile";
import Entity from "../Entities/entity";
import Tile from "./tile";
import Seller from "./seller";

const allDirections = [new Vector2(1, 0), new Vector2(0, 1), new Vector2(-1, 0), new Vector2(0, -1)]

abstract class TileEntity extends Tile {
    category: string;
    direction: Vector2;
    speed: number
    inputTiles: Array<TileEntity>;
    outputTiles: Array<TileEntity>;

    maxInputs: number;
    maxOutputs: number;

    constructor(name: String, position: Vector3, size: Vector2, direction: Vector2, speed:number, maxInputs: number, maxOutputs: number, category: string) {
        super(name, position, size);
        this.category = category;
        this.inputTiles = new Array<TileEntity>(maxInputs)
        this.outputTiles = new Array<TileEntity>(maxOutputs)
        this.speed = speed;
        this.direction = direction;

        this.maxInputs = maxInputs;
        this.maxOutputs = maxOutputs;
    }

    abstract tick(): void;

    setInput(previousTileEntity: TileEntity): void {
        this.inputTiles.push(previousTileEntity);
    };

    setOutput(nexTileEntity: TileEntity): void {
        this.outputTiles.push(nexTileEntity);
    };

    // return the cotent that could not be added to the next GridEntity
    // return empty array if all entities are added to the next GridEntity
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
    abstract addEntity(entities: Array<Entity|undefined>): Array<Entity|undefined>;

    /** Go through all connected part and try to set the input and output
     * @param touchedPart list of part touching this
     * @param gridEntities list of entities in the plot
     */
    setAllConnectedNeighboursTileEntity(tileGrid: TileGrid): void {
        const occupiedTiles = tileGrid.getOccupiedTilesIndexes(this);
        for (const occupiedTile of occupiedTiles) {

            for (const direction of allDirections) {
                const neighbourTile = tileGrid.getTile(occupiedTile.X + direction.X, occupiedTile.Y + direction.Y);
                
                const isNeighbourTile = neighbourTile && neighbourTile !== this && neighbourTile instanceof TileEntity
                if (!isNeighbourTile) continue;

                if (direction === this.direction && this.name !== "seller") {
                    this.connectOutput(neighbourTile);
                } else {
                    this.connectInput(neighbourTile, direction);
                }
            }
        }
    };

    connectOutput(neighbourTile: TileEntity): void {
        if (neighbourTile.direction !== this.direction.mul(-1)) {
            const hasAnyOutputAndInput = this.outputTiles.size() < this.maxOutputs && neighbourTile.inputTiles.size() < neighbourTile.maxInputs
            if (hasAnyOutputAndInput) {
                this.outputTiles.push(neighbourTile);
                neighbourTile.setInput(this);
            }
        }
    }


    connectInput(neighbourTile: TileEntity, neighbourTileDirection: Vector2): void {
        print(neighbourTile)
        if (neighbourTile.direction === neighbourTileDirection.mul(-1)) {
            const hasAnyOutputAndInput = this.inputTiles.size() < this.maxInputs && neighbourTile.outputTiles.size() < neighbourTile.maxOutputs
            if (hasAnyOutputAndInput) {
                this.inputTiles.push(neighbourTile);
                neighbourTile.setOutput(this);
            }
        }
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

export default TileEntity;