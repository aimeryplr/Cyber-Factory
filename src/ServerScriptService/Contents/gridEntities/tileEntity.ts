import TileGrid from "ServerScriptService/plot/gridTile";
import Entity from "../Entities/entity";
import Tile from "./tile";
import Seller from "./tileEntitiesInterface/seller";
import { copyArray } from "./conveyerUtils";
import Splitter from "./tileEntitiesInterface/splitter";
import Merger from "./tileEntitiesInterface/merger";
import { getInterfaceByCategory } from "./tileEntityProvider";
import Assembler from "./tileEntitiesInterface/assembler";
import Conveyer from "./tileEntitiesInterface/conveyer";

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

    updateShape(tile: TileEntity, gridBase: BasePart): void;
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

    setAllNeighbourTypeConveyer(tileGrid: TileGrid): void {
        for (const [neighbourTile, direction] of this.getAllNeighbours(tileGrid)) {
            this.changeNeighbourTypeConveyer(neighbourTile, direction);
            neighbourTile.changeNeighbourTypeConveyer(this, direction);
         }
    }
    
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

    changeNeighbourTypeConveyer(neighbour: TileEntity, direction: Vector2): void {
        if (this.category === "conveyer") {
            const willBeMerger = neighbour.direction !== this.direction.mul(-1) && this.inputTiles.size() === 1
            const willBeSplitter = direction === this.direction.mul(-1) && this.outputTiles.size() === 1
            if (willBeSplitter) {
                this.interface = new Splitter();
                this.changeType(this);
            } else if (willBeMerger) {
                this.interface = new Merger();
                this.changeType(this);
            }
        }
        else {
            if (this.category === "splitter" && this.outputTiles.size() === 1) this.interface = new Merger();
            if (this.category === "merger" && this.inputTiles.size() === 1) this.interface = new Conveyer();
        }
    }

    private changeType(tile: TileEntity) {
        tile.category = tile.interface.getCategory();
        tile.maxInputs = tile.interface.getMaxInputs();
        tile.maxOutputs = tile.interface.getMaxOutputs();
        let inputTiles = new Array<TileEntity>(tile.maxInputs);
        let outputTiles = new Array<TileEntity>(tile.maxOutputs);
        tile.inputTiles = copyArray(tile.inputTiles, inputTiles) as Array<TileEntity>;
        tile.outputTiles = copyArray(tile.outputTiles, outputTiles) as Array<TileEntity>;
    }
    
    findThisPartInGridEntities(gridBase: BasePart): BasePart | undefined {
        const gridEntities = gridBase.FindFirstChild("PlacedObjects")?.GetChildren() as Array<BasePart>;
        const gridBasePosition = gridBase.Position;
        
        for (let i = 0; i < gridEntities.size(); i++) {
            if (gridEntities[i].Position.X === this.position.X + gridBasePosition.X && gridEntities[i].Position.Z === this.position.Z + gridBasePosition.Z) {
                return gridEntities[i];
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

export {TileEntity, TileEntityInterface};