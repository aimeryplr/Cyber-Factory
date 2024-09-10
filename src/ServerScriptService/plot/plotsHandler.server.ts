import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { checkPlacementForObj, setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import PlotsManager from "./plotsManager";
import GridEntity from "ServerScriptService/Contents/gridEntities/gridEntity";
import Seller from "ServerScriptService/Contents/gridEntities/seller";

const placeTileCallback: RemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild(
	"placeTileCheck",
) as RemoteFunction;

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;

const plotsManager = new PlotsManager();

placeTileCallback.OnServerInvoke = (player: Player, pos: unknown, tileName: unknown, gridBase: unknown, orientation: unknown): boolean => {
	const plot = plotsManager.getPlotByOwner(player.UserId);
	const tile = ReplicatedStorage.FindFirstChild("Entities")
		?.FindFirstChild("GridEntities")
		?.FindFirstChild(tileName as string) as BasePart;

	//check if player owns a plot and if the tile exists
	if (!tile) return false;
	if (!plot) return false;

	const isPlaceable = checkPlacementForObj(pos as Vector3, tile.Size as Vector3, gridBase as BasePart);
	if (isPlaceable) {
		const obj = setupObject(tile, pos as Vector3, gridBase as BasePart);
		const direction = new Vector2(math.round(math.cos(orientation as number)), math.round(math.sin(orientation as number)));
		const localPos = (pos as Vector3).sub((gridBase as BasePart).Position.Floor());
		const gridTile = plot.addGridTile(tileName as string, localPos as Vector3, direction);
		if (gridTile instanceof GridEntity) {
			gridTile.setAllNeighboursOutAndInTileEntity(plot.getGridEntities(), Workspace.GetPartsInPart(obj), (gridBase as BasePart).Position);
		}
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
