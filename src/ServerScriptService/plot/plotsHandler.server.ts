import { Players, ReplicatedStorage } from "@rbxts/services";
import PlotManager from "./plotManager";
import { onChangingCrafterOrAssemblerCraft, onChangingGeneratorRessource, onGettingTileEvent, onPlacingTile, onPlayerRemoving, onRemoveTileEvent, rotateTile } from "./plotEventHandler";

// EVENTS
const placeTileCallback = ReplicatedStorage.WaitForChild("Events").WaitForChild("placeTileCheck") as RemoteFunction;
const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;
const removeTileEventRemote = ReplicatedStorage.WaitForChild("Events").WaitForChild("removeTile") as RemoteEvent;
const changeGeneratorRessourceEvent = game.GetService("ReplicatedStorage").WaitForChild("Events").WaitForChild("changeGeneratorRessource") as RemoteEvent;
const changeCrafterOrAssemblerCraft = ReplicatedStorage.WaitForChild("Events").WaitForChild("changeCrafterOrAssemblerCraft") as RemoteEvent;
const rotateTileEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("rotateTile") as RemoteEvent;

const plotsManager = new PlotManager();

placeTileCallback.OnServerInvoke = (player: Player, tileName: unknown, pos: unknown, orientation: unknown, size: unknown, gridBase: unknown): boolean => {
	return onPlacingTile(plotsManager, player, tileName, pos, orientation, size, gridBase);
};
Players.PlayerRemoving.Connect((player) => { onPlayerRemoving(plotsManager, player) });
getTileRemoteFunction.OnServerInvoke = (player: Player, tilePos: unknown): string | undefined => { return onGettingTileEvent(plotsManager, player, tilePos) };
removeTileEventRemote.OnServerEvent.Connect((player, tile) => { onRemoveTileEvent(plotsManager, player, tile) });
changeGeneratorRessourceEvent.OnServerEvent.Connect((player, position, ressource) => { onChangingGeneratorRessource(plotsManager, player, position, ressource) });
changeCrafterOrAssemblerCraft.OnServerEvent.Connect((player, position, component) => { onChangingCrafterOrAssemblerCraft(plotsManager, player, position, component) });
rotateTileEvent.OnServerEvent.Connect((player, position) => { rotateTile(plotsManager, player, position) });