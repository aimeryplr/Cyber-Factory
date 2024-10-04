import { TileEntity } from "ReplicatedStorage/Scripts/gridEntities/tileEntity";
import { Players, ReplicatedStorage } from "@rbxts/services";
import TileGrid from "./gridTile";
import { copyArray } from "ReplicatedStorage/Scripts/gridEntities/conveyerUtils";
import { getTileEntityByCategory } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { connectTileEntityToAllInputsAndOutputs, removeAllTileFromAllConnectedTiles } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import Conveyer from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/conveyer";

const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;

function setAllNeighbourTypeConveyer(tileEntity: TileEntity, tileGrid: TileGrid): void {
    let outputCount = 0
    let inputCount = 0

    for (const [neighbourTile, direction] of tileEntity.getAllNeighbours(tileGrid)) {
        changeNeighbourTypeConveyer(tileEntity, neighbourTile, direction, tileGrid);
        
        if (tileEntity instanceof Conveyer) {
            if (tileEntity.canConnectInput(neighbourTile, direction) && neighbourTile.hasEnoughOutput()) inputCount++
            else if (neighbourTile.direction !== direction.mul(-1) && neighbourTile.hasEnoughInput()) outputCount++
        }       
    }
    if (inputCount > 1) switchTileEntityType(tileEntity, "merger", tileGrid);
    else if (outputCount > 1) switchTileEntityType(tileEntity, "splitter", tileGrid);
}

/**
 * @param direction from the tileEntity to the neighbour
 */
function changeNeighbourTypeConveyer(tileEntity: TileEntity, neighbour: TileEntity, direction: Vector2, tileGrid: TileGrid): void {
    if (neighbour.category === "conveyer" && tileEntity.direction !== neighbour.direction.mul(-1)) {
        const willBeMerger = neighbour.inputTiles.size() === 1 && neighbour.canConnectInput(tileEntity, direction.mul(-1));
        const willBeSplitter = neighbour.outputTiles.size() === 1 && tileEntity.direction === direction.mul(-1) ;
        if (willBeMerger) {
            switchTileEntityType(neighbour, "merger", tileGrid);
        } else if (willBeSplitter) {
            switchTileEntityType(neighbour, "splitter", tileGrid);
        }  
    }
    else {
        if (neighbour.category === "splitter" && neighbour.outputTiles.size() === 1) switchTileEntityType(neighbour, "conveyer", tileGrid);
        if (neighbour.category === "merger" && neighbour.inputTiles.size() === 1) switchTileEntityType(neighbour, "conveyer", tileGrid);
    }
}

function switchTileEntityType(tileEntity: TileEntity, tileCategory: string, tileGrid: TileGrid) {
    removeAllTileFromAllConnectedTiles(tileEntity);
    const newTile = changeType(tileEntity, tileCategory);
    connectTileEntityToAllInputsAndOutputs(newTile);

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

function getPlayerFromUserId(userId: number): Player {
    const player = Players.GetPlayerByUserId(userId);
    if (!player) error("Player not found");
    return player
}

export { changeShapes, resetBeamsOffset, setAllNeighbourTypeConveyer, getPlayerFromUserId };