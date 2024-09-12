import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { checkPlacementForObj, setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import PlotsManager from "./plotsManager";
import GridEntity from "ServerScriptService/Contents/gridEntities/gridEntity";
import { findBasepartByName, getClassByName, getGridEntityInformation } from "ServerScriptService/Contents/gridEntities/gridEntityUtils";

const placeTileCallback: RemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild(
	"placeTileCheck",
) as RemoteFunction;

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;

const plotsManager = new PlotsManager();

placeTileCallback.OnServerInvoke = (player: Player, pos: unknown, tileName: unknown, gridBase: unknown, orientation: unknown): boolean => {
	const plot = plotsManager.getPlotByOwner(player.UserId);
	const direction = new Vector2(math.round(math.cos(orientation as number)), math.round(math.sin(orientation as number)));
	const localPos = (pos as Vector3).sub((gridBase as BasePart).Position.Floor());
	const gridEntity = getObjectFromName(tileName as string, localPos as Vector3, direction);
	const tile = findBasepartByName(tileName as string, gridEntity.category);

	//check if player owns a plot and if the tile exists
	if (!tile || !plot || !gridEntity) {
		error("Tile not found or player does not own a plot or gridTile not found");
	}

	const isPlaceable = checkPlacementForObj(pos as Vector3, tile.Size as Vector3, gridBase as BasePart);
	if (isPlaceable) {
		const obj = setupObject(tile, pos as Vector3, orientation as number, gridBase as BasePart);
		plot.addGridTile(gridEntity, obj, player.UserId);
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

function getObjectFromName(tileName: string, pos: Vector3, direction: Vector2): GridEntity {
	const gridTileInformation = getGridEntityInformation(tileName);
	if (!gridTileInformation) error("Tile not found");

	return getClassByName(gridTileInformation.category, tileName, pos, gridTileInformation.speed, direction);
}