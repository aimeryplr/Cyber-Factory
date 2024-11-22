import Generator from "ReplicatedStorage/Scripts/TileEntities/tileEntitiesChilds/generator";
import Conveyor from "ReplicatedStorage/Scripts/TileEntities/tileEntitiesChilds/conveyor";
import Splitter from "ReplicatedStorage/Scripts/TileEntities/tileEntitiesChilds/splitter";
import Seller from "ReplicatedStorage/Scripts/TileEntities/tileEntitiesChilds/seller";
import Crafter from "ReplicatedStorage/Scripts/TileEntities/tileEntitiesChilds/crafter";
import Merger from "ReplicatedStorage/Scripts/TileEntities/tileEntitiesChilds/merger";
import Assembler from "ReplicatedStorage/Scripts/TileEntities/tileEntitiesChilds/assembler";
import Tile from "ReplicatedStorage/Scripts/TileEntities/tile";
import type { TileGrid } from "./tileGrid";
import { GRID_SIZE } from "ReplicatedStorage/constants";
import { SubConveyer } from "../TileEntities/tileEntitiesChilds/subConveyer";

function decodeTile(decoded: unknown, gridBase: BasePart) {
    const data = decoded as { category: string }

    switch (data.category) {
        case "tile":
            return Tile.decode(decoded, gridBase);
        case "conveyor":
            return Conveyor.decode(decoded, gridBase);
        case "splitter":
            return Splitter.decode(decoded, gridBase);
        case "seller":
            return Seller.decode(decoded, gridBase);
        case "crafter":
            return Crafter.decode(decoded, gridBase)
        case "generator":
            return Generator.decode(decoded, gridBase);
        case "merger":
            return Merger.decode(decoded, gridBase);
        case "assembler":
            return Assembler.decode(decoded, gridBase);
        case "subConveyer":
            return SubConveyer.decode(decoded, gridBase);
        default:
            error("Tile category not found");
    }
}

function decodeTiles(decodedTiles: Array<unknown>, tileGrid: TileGrid, gridBase: BasePart) {
    for (const tile of decodedTiles) {
        const decodedTile = decodeTile(tile, gridBase);
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