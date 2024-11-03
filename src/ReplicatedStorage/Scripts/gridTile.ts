import { GRID_SIZE } from "ReplicatedStorage/parameters";
import Tile from "ReplicatedStorage/Scripts/gridEntities/tile";
import { HttpService } from "@rbxts/services";
import { decodeVector2, encodeVector2 } from "ReplicatedStorage/Scripts/encoding";
import { TileEntity } from "ReplicatedStorage/Scripts/gridEntities/tileEntity";
import { decodeTiles } from "ReplicatedStorage/Scripts/gridTileUtils";


class TileGrid {
    tileGrid: Array<Array<Tile | undefined>>;
    gridSize: Vector2;

    /**
     * @param size_x in grid size not world size
     * @param size_y in grid size not world size
     */
    constructor(size: Vector2) {
        this.gridSize = size;
        this.tileGrid = new Array<Array<Tile | undefined>>(size.Y);
        for (let i = 0; i < size.Y; i++) {
            this.tileGrid[i] = new Array<Tile | undefined>(size.X, undefined);
        }
    }

    getTile(x: number, y: number): Tile | undefined {
        if (!this.isInBounds(x, y)) return undefined;
        return this.tileGrid[y][x];
    }

    /**
     * @param position local position of the tile
     * @returns the tile on the position
    */
    getTileFromPosition(position: Vector3): Tile | undefined {
        const gridPosition = TileGrid.localPositionToGridTilePosition(position);

        const y = math.floor(this.gridSize.Y / 2) + gridPosition.Y;
        const x = math.floor(this.gridSize.X / 2) + gridPosition.X;

        return this.getTile(x, y);
    }

    /**
     * @return a list of all the indexes of the gridTile that the entity is on
    */
    getOccupiedTilesIndexes(tile: Tile): Array<Vector2> {
        const occupiedTiles = new Array<Vector2>();
        for (let i = math.ceil(-tile.size.Y / 2); i < math.ceil(tile.size.Y / 2); i++) {
            for (let j = math.ceil(-tile.size.X / 2); j < math.ceil(tile.size.X / 2); j++) {
                const gridPosition = TileGrid.localPositionToGridTilePosition(tile.position);

                const y = math.floor(this.gridSize.Y / 2) + gridPosition.Y + i;
                const x = math.floor(this.gridSize.X / 2) + gridPosition.X + j;

                if (this.tileGrid[y][x] !== undefined && this.isInBounds(x, y)) {
                    occupiedTiles.push(new Vector2(x, y));
                }
            }
        }
        return occupiedTiles
    }

    /**
     * set the tile on all the gridTile that the entity is on.
     * @throws if the tile is already occupied
     * @param position local position
    */
    addTile(tile: Tile) {
        for (let i = math.ceil(-tile.size.Y / 2); i < math.ceil(tile.size.Y / 2); i++) {
            for (let j = math.ceil(-tile.size.X / 2); j < math.ceil(tile.size.X / 2); j++) {
                const gridPosition = TileGrid.localPositionToGridTilePosition(tile.position);

                const y = math.floor(this.gridSize.Y / 2) + gridPosition.Y + i;
                const x = math.floor(this.gridSize.X / 2) + gridPosition.X + j;

                if (this.tileGrid[y][x] !== undefined) error("Tile is already occupied");
                if (this.isInBounds(x, y)) this.tileGrid[y][x] = tile;
            }
        }
    }

    removeTile(tile: Tile) {
        for (let i = math.ceil(-tile.size.Y / 2); i < math.ceil(tile.size.Y / 2); i++) {
            for (let j = math.ceil(-tile.size.X / 2); j < math.ceil(tile.size.X / 2); j++) {
                const gridPosition = TileGrid.localPositionToGridTilePosition(tile.position);

                const y = math.floor(this.gridSize.Y / 2) + gridPosition.Y + i;
                const x = math.floor(this.gridSize.X / 2) + gridPosition.X + j;

                if (this.isInBounds(x, y)) this.tileGrid[y][x] = undefined;
            }
        }
    }

    /**
     * @returns true if the tile can be placed
    */
    checkPlacement(tile: Tile) {
        const size = tile.size;
        for (let i = math.ceil(-size.Y / 2); i < math.ceil(size.Y / 2); i++) {
            for (let j = math.ceil(-size.X / 2); j < math.ceil(size.X / 2); j++) {
                const gridPosition = TileGrid.localPositionToGridTilePosition(tile.position);
                const y = math.floor(this.gridSize.Y / 2) + gridPosition.Y + i;
                const x = math.floor(this.gridSize.X / 2) + gridPosition.X + j;

                if (this.tileGrid[y][x] !== undefined || !this.isInBounds(x, y)) {
                    return false;
                }
            }
        }
        return true
    }

    isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.gridSize.X && y >= 0 && y < this.gridSize.Y;
    }

    getGrid(): Array<Array<Tile | undefined>> {
        return this.tileGrid;
    }

    getTiles(): Array<Tile> {
        const tiles = new Array<Tile>();
        for (let i = 0; i < this.gridSize.Y; i++) {
            for (let j = 0; j < this.gridSize.X; j++) {
                const currentTile = this.tileGrid[i][j];
                if (!currentTile) continue;
                
                const isTileAlreadyInList = tiles.some((tile) => tile.position === currentTile.position)
                if (!isTileAlreadyInList) {
                    tiles.push(currentTile);
                }
            }
        }
        return tiles;
    }

    /**
     * @param position local position
     * @returns the position in grid tile list index
    */
    public static localPositionToGridTilePosition(position: Vector3): Vector2 {
        return new Vector2(math.floor(position.X / GRID_SIZE), math.floor(position.Z / GRID_SIZE));
    }

    public encode(): any {
        return {
            "gridSize": encodeVector2(this.gridSize),
            "tileGrid": this.getTiles().map((tile) => tile.encode())
        }
    }

    static decode(encoded: string): TileGrid {
        const decoded = HttpService.JSONDecode(encoded) as { gridSize: { x: number, y: number }, tileGrid: Array<Array<unknown>> };
        const tileGrid = new TileGrid(decodeVector2(decoded.gridSize));

        decodeTiles(decoded.tileGrid, tileGrid);
        tileGrid.connectTiles()

        return tileGrid;
    }

    connectTiles() {
        for (const tile of this.getTiles()) {
            this.connectTile(tile)    
        }
    }

    connectTile(tile: Tile | undefined) {
        if (!tile) return;
        if (!(tile instanceof TileEntity)) return;

        for (let i = 0; i < tile.outputTiles.size(); i++) {
            const outputTile = tile.outputTiles[i];
            if (!(typeIs(outputTile, "Vector3"))) continue;
            const outputTileEntity = this.getTileFromPosition(outputTile);
            if (!outputTileEntity) continue;
            if (!(outputTileEntity instanceof TileEntity)) continue;

            tile.outputTiles[i] = outputTileEntity;
        }

        for (let i = 0; i < tile.inputTiles.size(); i++) {
            const inputTile = tile.inputTiles[i];
            if (!(typeIs(inputTile, "Vector3"))) continue;
            const inputTileEntity = this.getTileFromPosition(inputTile);
            if (!inputTileEntity) continue;
            if (!(inputTileEntity instanceof TileEntity)) continue;

            tile.inputTiles[i] = inputTileEntity;
        }
    }

    getAllEndingTiles() : Array<TileEntity> {
        const endingTiles = new Array<TileEntity>();

        for (const tile of this.getTiles()) {
            if (tile instanceof TileEntity && tile.outputTiles.size() === 0) {
                endingTiles.push(tile);
            }
        }

        return endingTiles;
    }
}

export { TileGrid };