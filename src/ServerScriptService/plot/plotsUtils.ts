import { TileEntity } from "ServerScriptService/Contents/gridEntities/tileEntity";
import { Players, ReplicatedStorage } from "@rbxts/services";
import TileGrid from "./gridTile";
import { copyArray } from "ServerScriptService/Contents/gridEntities/conveyerUtils";
import { getTileEntityByCategory } from "ServerScriptService/Contents/gridEntities/tileEntityProvider";

const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;

function setAllNeighbourTypeConveyer(tileEntity: TileEntity, tileGrid: TileGrid): void {
    for (const [neighbourTile, direction] of tileEntity.getAllNeighbours(tileGrid)) {
        changeNeighbourTypeConveyer(neighbourTile, tileEntity, direction.mul(-1), tileGrid);
        changeNeighbourTypeConveyer(tileEntity, neighbourTile, direction, tileGrid);
    }
}

/**
 * @param direction from the tileEntity to the neighbour
 */
function changeNeighbourTypeConveyer(tileEntity: TileEntity, neighbour: TileEntity, direction: Vector2, tileGrid: TileGrid): void {
    if (tileEntity.category === "conveyer" && neighbour.direction !== tileEntity.direction.mul(-1)) {
        const willBeMerger = neighbour.direction === direction.mul(-1) && tileEntity.inputTiles.size() === 1
        const willBeSplitter = direction !== tileEntity.direction.mul(-1) && tileEntity.outputTiles.size() === 1
        if (willBeSplitter) {
            switchToTileEntity(tileEntity, "splitter", tileGrid);
        } else if (willBeMerger) {
            switchToTileEntity(tileEntity, "merger", tileGrid);
        }
    }
    else {
        if (tileEntity.category === "splitter" && tileEntity.outputTiles.size() === 1) switchToTileEntity(tileEntity, "conveyer", tileGrid);
        if (tileEntity.category === "merger" && tileEntity.inputTiles.size() === 1) switchToTileEntity(tileEntity, "conveyer", tileGrid);
    }
}

function switchToTileEntity(tileEntity: TileEntity, tileCategory: string, tileGrid: TileGrid) {
    const newTile = changeType(tileEntity, tileCategory);
    tileGrid.removeTile(tileEntity);
    tileGrid.addTile(newTile);
}

function changeType(tileEntity: TileEntity, newTileCategory: string): TileEntity {
    let newTile: TileEntity;
    newTile = getTileEntityByCategory(newTileCategory, (tileEntity.name) as string, tileEntity.position, tileEntity.size, tileEntity.direction, tileEntity.speed);

    copyArray(tileEntity.inputTiles, newTile.inputTiles) as Array<TileEntity>;
    copyArray(tileEntity.outputTiles, newTile.outputTiles) as Array<TileEntity>;
    return newTile;
}

function changeShapes(tile: TileEntity, gridBase: BasePart, tileGrid: TileGrid): void {
    tile.updateShape(gridBase);
    for (const neighbour of tile.getAllNeighbours(tileGrid)) {
        neighbour[0].updateShape(gridBase);
    }
}

/**
 * reset the animation for all conveyer.
 * Must use when adding a new conveyer to sync it with the rest
 */
function resetBeamsOffset(gridBase: BasePart): void {
    const beams = new Array<Beam>();
    gridBase.FindFirstChild("PlacedObjects")?.GetChildren().forEach((child) => {
        child.GetChildren().forEach((part) => {
            if (part.IsA("Beam")) {
                beams.push(part as Beam);
            }
        });
    })
    Players.GetPlayers().forEach((player) => {
        setConveyerBeamsEvent.FireClient(player, beams);
    });
}

export { changeShapes, resetBeamsOffset, setAllNeighbourTypeConveyer };