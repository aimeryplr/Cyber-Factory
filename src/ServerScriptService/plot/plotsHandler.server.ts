import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { checkPlacementForObj, setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import PlotsManager from "./plotsManager";

const placeTileCallback: RemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild(
	"placeTileCheck",
) as RemoteFunction;

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;

const plotsManager = new PlotsManager();

placeTileCallback.OnServerInvoke = (player: Player, pos: unknown, tileName: unknown, gridBase: unknown): boolean => {
	const plot = plotsManager.getPlotByOwner(player.UserId);
	const tile = ReplicatedStorage.FindFirstChild("Entities")
		?.FindFirstChild("GridEntities")
		?.FindFirstChild(tileName as string) as BasePart;

	//check if player owns a plot and if the tile exists
	if (!tile) return false;
	if (!plot) return false;

	const isPlaceable = checkPlacementForObj(pos as Vector3, tile.Size as Vector3, gridBase as BasePart);
	if (isPlaceable) {
		setupObject(tile, pos as Vector3, gridBase as BasePart);
		plot.addGridTile(tileName as string, pos as Vector3);
	}
	return isPlaceable;
};

plotsManager.getPlots().forEach((plot) => {
	plot.getGridBase().Touched.Connect((part) => {
		const player = Players.GetPlayerFromCharacter(part.Parent);
		if (plot.getOwner() === undefined && player !== undefined && !plotsManager.hasPlayerClaimedPlot(player.UserId)) {
			plot.setOwner(player.UserId);
			setPlayerPlot.FireClient(player, plot.getGridBase());
			print(`Player ${player.Name} claimed the plot`);
		}
	});
});
