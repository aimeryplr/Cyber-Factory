import Generator from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/generator";
import Conveyer from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/conveyer";
import Splitter from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/splitter";
import Seller from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/seller";
import Crafter from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/crafter";
import Merger from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/merger";
import Assembler from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/assembler";
import Tile from "ReplicatedStorage/Scripts/gridEntities/tile";
import type { TileGrid } from "./gridTile";
import { decodeArray } from "ReplicatedStorage/Scripts/encoding";

function decodeTile(decoded: unknown) {
    const data = decoded as { category: string }

    switch (data.category) {
        case "tile":
            return Tile.decode(decoded);
        case "conveyer":
            return Conveyer.decode(decoded);
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
        default:
            error("Tile category not found");
    }
}

function decodeTiles(decodedTiles: Array<Array<unknown>>, tileGrid: TileGrid) {
    for (let i = 0; i < tileGrid.gridSize.Y; i++) {
        decodedTiles[i] = decodeArray(decodedTiles[i]);
        for (let j = 0; j < tileGrid.gridSize.X; j++) {
            if (decodedTiles[i][j] !== undefined) {
                decodedTiles[i][j] = decodeTile(decodedTiles[i][j]);
            }
        }
    }
    tileGrid.tileGrid = decodedTiles as Array<Array<Tile | undefined>>;
}

export { decodeTiles, decodeTile };