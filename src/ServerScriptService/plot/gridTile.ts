import { GRID_SIZE } from "ReplicatedStorage/Scripts/placementHandler";
import Tile from "ServerScriptService/Contents/gridEntities/tile";

class GridTile {
    gridTile: Array<Array<Tile | undefined>>;

    constructor(size_x: number, size_y: number) {
        this.gridTile = new Array<Array<Tile | undefined>>(size_x);
        this.gridTile.forEach((_, index) => {
            this.gridTile[index] = new Array<Tile | undefined>(size_y);
        });
    }

    getTile(x: number, y: number): Tile | undefined {
        return this.gridTile[y][x];
    }

    getTileFromPosition(position: Vector3): Tile | undefined {
        return this.gridTile[math.floor(position.Z / GRID_SIZE)][math.floor(position.X / GRID_SIZE)];
    }

    /**
     * set the tile on all the gridTile that the entity is on
     * @param position local position
     */
    setTile(tile: Tile) {
        const size = tile.size;
        for (let i = math.ceil(-size.Y / 2); i < math.ceil( size.Y / 2); i++) {
            for (let j = math.ceil(-size.X / 2); j < math.ceil(size.X / 2); j+= GRID_SIZE) {
                const gridPosition = this.localPositionToGridTilePosition(tile.position); 
                this.gridTile[gridPosition.Y + i][gridPosition.X + j] = tile;
            }
        }
    }

    private localPositionToGridTilePosition(position: Vector3): Vector2 {
        return new Vector2(math.floor(position.X / GRID_SIZE), math.floor(position.Z / GRID_SIZE));
    }
}

export default GridTile