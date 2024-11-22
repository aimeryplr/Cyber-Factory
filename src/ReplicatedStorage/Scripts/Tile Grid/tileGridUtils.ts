import Generator from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/generator";
import Conveyor from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/conveyor";
import Splitter from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/splitter";
import Seller from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/seller";
import Crafter from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/crafter";
import Merger from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/merger";
import Assembler from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/assembler";
import Tile from "ReplicatedStorage/Scripts/Tile Entities/tile";
import type { TileGrid } from "./tileGrid";
import { GRID_SIZE } from "ReplicatedStorage/parameters";
import { SubConveyer } from "../Tile Entities/tileEntitiesChilds/subConveyer";

function decodeTile(decoded: unknown) {
    const data = decoded as { category: string }

    switch (data.category) {
        case "tile":
            return Tile.decode(decoded);
        case "conveyor":
            return Conveyor.decode(decoded);
        case "splitter":
            return Splitter.decode(decoded);
        case "seller":
            return Seller.decode(decoded);
        case "crafter":
            return Crafter.decode(decoded)
        case "generator":
            return Generator.decode(decoded);
        case "merger":
            return Merger.decode(decoded);
        case "assembler":
            return Assembler.decode(decoded);
        case "subConveyer":
            return SubConveyer.decode(decoded);
        default:
            error("Tile category not found");
    }
}

function decodeTiles(decodedTiles: Array<unknown>, tileGrid: TileGrid, gridBase: BasePart) {
    for (const tile of decodedTiles) {
        const decodedTile = decodeTile(tile);
        decodedTile.gridBase = gridBase;
        tileGrid.addTile(decodedTile);
    }
}

export function getPlacedGenerator(tileGrid: TileGrid): number {
    let generatorCount = 0;
    tileGrid.getTiles().forEach((tile) => {
        if (tile instanceof Generator) generatorCount++;
    });
    return generatorCount;
}

/**
     * @param position local position
     * @returns the position in grid tile list index
    */
export function localPositionToGridTilePosition(position: Vector3): Vector2 {
    return new Vector2(math.floor(position.X / GRID_SIZE), math.floor(position.Z / GRID_SIZE));
}

export { decodeTiles, decodeTile };