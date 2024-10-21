import { GRID_SIZE } from "ReplicatedStorage/Scripts/placementHandler";
import Tile from "ReplicatedStorage/Scripts/gridEntities/tile";
import { HttpService } from "@rbxts/services";
import { decodeArray, decodeVector2, decodeVector3, encodeArray, encodeVector2 } from "ReplicatedStorage/Scripts/encoding";
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
        const isInBounds = x >= 0 && x < this.gridSize.X && y >= 0 && y < this.gridSize.Y;
        if (!isInBounds) return undefined;
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

                const isInBounds = x >= 0 && x < this.gridSize.X && y >= 0 && y < this.gridSize.Y;
                if (this.tileGrid[y][x] !== undefined && isInBounds) {
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

                const isInBounds = x >= 0 && x < this.gridSize.X && y >= 0 && y < this.gridSize.Y;
                if (this.tileGrid[y][x] !== undefined) error("Tile is already occupied");
                if (isInBounds) this.tileGrid[y][x] = tile;
            }
        }
    }

    removeTile(tile: Tile) {
        for (let i = math.ceil(-tile.size.Y / 2); i < math.ceil(tile.size.Y / 2); i++) {
            for (let j = math.ceil(-tile.size.X / 2); j < math.ceil(tile.size.X / 2); j++) {
                const gridPosition = TileGrid.localPositionToGridTilePosition(tile.position);

                const y = math.floor(this.gridSize.Y / 2) + gridPosition.Y + i;
                const x = math.floor(this.gridSize.X / 2) + gridPosition.X + j;

                const isInBounds = x >= 0 && x < this.gridSize.X && y >= 0 && y < this.gridSize.Y;
                if (isInBounds) this.tileGrid[y][x] = undefined;
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

                const isInBounds = x >= 0 && x < this.gridSize.X && y >= 0 && y < this.gridSize.Y;
                if (this.tileGrid[y][x] !== undefined || !isInBounds) {
                    return false;
                }
            }
        }
        return true
    }

    getGrid(): Array<Array<Tile | undefined>> {
        return this.tileGrid;
    }

    getTiles(): Array<Tile> {
        const tiles = new Array<Tile>();
        for (let i = 0; i < this.gridSize.Y; i++) {
            for (let j = 0; j < this.gridSize.X; j++) {
                const currentTile = this.tileGrid[i][j];
                if (currentTile !== undefined && !tiles.some((tile) => tile.position === currentTile.position)) {
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
        return new Vector2(math.ceil(position.X / GRID_SIZE), math.ceil(position.Z / GRID_SIZE));
    }

    public encode(): any {
        const tileGrid = new Array<unknown>(this.gridSize.Y);
        for (let i = 0; i < this.gridSize.Y; i++) {
            tileGrid[i] = encodeArray(this.tileGrid[i], this.gridSize.X);
            for (let j = 0; j < this.gridSize.X; j++) {
                const tile = this.tileGrid[i][j];
                if (tile instanceof Tile) {
                    (tileGrid[i] as Array<unknown>)[j] = tile.encode();
                }
            }
        }
        const copy = {
            "gridSize": encodeVector2(this.gridSize),
            "tileGrid": tileGrid
        }
        return copy;
    }

    static decode(encoded: string): TileGrid {
        const decoded = HttpService.JSONDecode(encoded) as { gridSize: { x: number, y: number }, tileGrid: Array<Array<unknown>> };
        const tileGrid = new TileGrid(decodeVector2(decoded.gridSize));

        decodeTiles(decoded.tileGrid, tileGrid);
        tileGrid.connectTiles()

        return tileGrid;
    }

    connectTiles() {
        for (let i = 0; i < this.gridSize.Y; i++) {
            for (let j = 0; j < this.gridSize.X; j++) {
                this.connectTile(this.tileGrid[i][j])
            }
        }
    }

    connectTile(tile: Tile | undefined) {
        if (!tile) return;
        if (!(tile instanceof TileEntity)) return;

        for (const outputTile of tile.outputTiles) {
            if (!(typeIs(outputTile, "Vector3"))) continue;
            const outputTileEntity = this.getTileFromPosition(outputTile);
            if (!outputTileEntity) continue;
            if (!(outputTileEntity instanceof TileEntity)) continue;

            outputTileEntity.inputTiles.push(tile);
            outputTileEntity.inputTiles.remove(outputTileEntity.inputTiles.findIndex((inputTile) => (inputTile as unknown) as Vector3 === tile.position))
            tile.outputTiles.push(outputTileEntity);
            tile.outputTiles.remove(tile.outputTiles.findIndex((outputTile) => (outputTile as unknown) as Vector3 === outputTileEntity.position))
        }

        for (const inputTile of tile.inputTiles) {
            if (!(typeIs(inputTile, "Vector3"))) continue;
            const inputTileEntity = this.getTileFromPosition(inputTile);
            if (!inputTileEntity) continue;
            if (!(inputTileEntity instanceof TileEntity)) continue;

            inputTileEntity.outputTiles.push(tile);
            inputTileEntity.outputTiles.remove(inputTileEntity.outputTiles.findIndex((outputTile) => (outputTile as unknown) as Vector3 === tile.position))
            tile.inputTiles.push(inputTileEntity);
            tile.inputTiles.remove(tile.inputTiles.findIndex((inputTile) => (inputTile as unknown) as Vector3 === inputTileEntity.position))
        }
    }
}

export { TileGrid };