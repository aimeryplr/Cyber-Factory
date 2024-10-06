import { TileEntity } from "ReplicatedStorage/Scripts/gridEntities/tileEntity";
import { Players, ReplicatedStorage } from "@rbxts/services";
import TileGrid from "./gridTile";

const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;

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

export { changeShapes, resetBeamsOffset, getPlayerFromUserId };