import { Players, ReplicatedStorage } from "@rbxts/services";
import PlotManager from "./plotManager";
import { onChangingRessource, onGettingTileEvent, onPlacingTile, onPlayerRemoving, onRemoveTileEvent } from "./plotEventHandler";

// EVENTS
const placeTileCallback = ReplicatedStorage.WaitForChild("Events").WaitForChild("placeTileCheck") as RemoteFunction;
const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;
const removeTileEventRemote = ReplicatedStorage.WaitForChild("Events").WaitForChild("removeTile") as RemoteEvent;
const changeGeneratorRessourceEvent = game.GetService("ReplicatedStorage").WaitForChild("Events").WaitForChild("changeGeneratorRessource") as RemoteEvent;

const plotsManager = new PlotManager();

placeTileCallback.OnServerInvoke = (player: Player, tileName: unknown, pos: unknown, orientation: unknown, size: unknown, gridBase: unknown): boolean => {
	return onPlacingTile(plotsManager, player, tileName, pos, orientation, size, gridBase);
};
Players.PlayerRemoving.Connect((player) => { onPlayerRemoving(plotsManager, player) });
getTileRemoteFunction.OnServerInvoke = (player: Player, tilePos: unknown): string | undefined => {return onGettingTileEvent(plotsManager, player, tilePos) };
removeTileEventRemote.OnServerEvent.Connect((player, tile) => { onRemoveTileEvent(plotsManager, player, tile) });
changeGeneratorRessourceEvent.OnServerEvent.Connect((player, position, ressource) => { onChangingRessource(plotsManager, player, position, ressource) });