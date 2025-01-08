import Generator from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/generator";
import Conveyor from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/conveyor";
import Splitter from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/splitter";
import Seller from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/seller";
import Crafter from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/crafter";
import Merger from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/merger";
import Assembler from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/assembler";
import Tile from "ReplicatedStorage/Scripts/Tile/tile";
import type { TileGrid } from "./tileGrid";
import { GRID_SIZE } from "ReplicatedStorage/constants";
import { SubConveyer } from "../Tile/TileEntities/Machines/subConveyer";

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

export function getPlacedTilesOfType<T extends Tile>(tileGrid: TileGrid, tileType: new (...args: any[]) => T): T[] {
    const tiles = tileGrid.getTiles().filter((tile) => tile instanceof tileType) as T[];
    return tiles;
}

export function getPlacedGeneratorCount(tileGrid: TileGrid): number {
    return getPlacedTilesOfType(tileGrid, Generator).size();
}

/**
     * @param position local position
     * @returns the position in grid tile list index
    */
export function localPositionToGridTilePosition(position: Vector3): Vector2 {
    return new Vector2(math.floor(position.X / GRID_SIZE), math.floor(position.Z / GRID_SIZE));
}

export function getDistanceBetweenTiles(tile1: Tile, tile2: Tile): number {
    return tile1.position.sub(tile2.position).Magnitude / GRID_SIZE;
}

export { decodeTiles, decodeTile };