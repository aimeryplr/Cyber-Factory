import { ReplicatedStorage } from "@rbxts/services";
import { checkPlacementForObj, setupObject } from "ReplicatedStorage/Scripts/placementHandler";

const placeTileCallback: RemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("placeTileCheck") as RemoteFunction;

placeTileCallback.OnServerInvoke = (player: Player, pos: unknown, tileName: unknown, gridBase: unknown): boolean => {
    const tile = (ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild("GridEntities")?.FindFirstChild(tileName as string) as BasePart);
    if (!tile) return false;
    const isPlaceable = checkPlacementForObj(pos as Vector3, tile.Size as Vector3, gridBase as BasePart);
    if (isPlaceable) {
        setupObject(tile, pos as Vector3, gridBase as BasePart);
    }
    return isPlaceable;
};
