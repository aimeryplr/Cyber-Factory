import { GRID_SIZE } from "ReplicatedStorage/Scripts/placementHandler";
import Tile from "ServerScriptService/Contents/gridEntities/tile";

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

        const y = math.round(this.gridSize.Y / 2) + gridPosition.Y;
        const x = math.round(this.gridSize.X / 2) + gridPosition.X;

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

                const y = math.round(this.gridSize.Y / 2) + gridPosition.Y + i;
                const x = math.round(this.gridSize.X / 2) + gridPosition.X + j;

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

                const y = math.round(this.gridSize.Y / 2) + gridPosition.Y + i;
                const x = math.round(this.gridSize.X / 2) + gridPosition.X + j;

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

                const y = math.round(this.gridSize.Y / 2) + gridPosition.Y + i;
                const x = math.round(this.gridSize.X / 2) + gridPosition.X + j;

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
                const y = math.round(this.gridSize.Y / 2) + gridPosition.Y + i;
                const x = math.round(this.gridSize.X / 2) + gridPosition.X + j;

                const isInBounds = x >= 0 && x < this.gridSize.X && y >= 0 && y < this.gridSize.Y;
                if (this.tileGrid[y][x] !== undefined || !isInBounds) {
                    return false;
                }
            }
        }
        return true
    }

    getTiles(): Array<Array<Tile | undefined>> {
        return this.tileGrid;
    }

    /**
     * @param position local position
     * @returns the position in grid tile list index
    */
    public static localPositionToGridTilePosition(position: Vector3): Vector2 {
        return new Vector2(math.floor(position.X / GRID_SIZE), math.floor(position.Z / GRID_SIZE));
    }
}

export default TileGrid