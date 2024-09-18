import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { checkPlacementForObj, setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import PlotsManager from "./plotsManager";
import TileEntity from "ServerScriptService/Contents/gridEntities/tileEntity";
import { findBasepartByName, getClassByName, getGridEntityInformation, objSizeToTileSize } from "ServerScriptService/Contents/gridEntities/tileEntityUtils";

const placeTileCallback: RemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild(
	"placeTileCheck",
) as RemoteFunction;

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;

const plotsManager = new PlotsManager();

placeTileCallback.OnServerInvoke = (player: Player, pos: unknown, tileName: unknown, gridBase: unknown, orientation: unknown): boolean => {
	const plot = plotsManager.getPlotByOwner(player.UserId);
	const direction = new Vector2(math.round(math.cos(orientation as number)), math.round(math.sin(orientation as number)));
	const localPos = (pos as Vector3).sub((gridBase as BasePart).Position.Floor());
	const tileObject = findBasepartByName(tileName as string);
	const tileEntity = getObjectFromName(tileName as string, localPos as Vector3, direction, objSizeToTileSize(tileObject.Size));

	//check if player owns a plot and if the tile exists
	if (!tileObject || !plot || !tileEntity) {
		error("Tile not found or player does not own a plot or gridTile not found");
	}

	const isPlaceable = checkPlacementForObj(pos as Vector3, tileObject.Size as Vector3, gridBase as BasePart);
	if (isPlaceable) {
		const obj = setupObject(tileObject, pos as Vector3, orientation as number, gridBase as BasePart);
		plot.addGridTile(tileEntity, obj, player.UserId);
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

function getObjectFromName(tileName: string, pos: Vector3, direction: Vector2, size: Vector2): TileEntity {
	const gridTileInformation = getGridEntityInformation(tileName);
	if (!gridTileInformation) error("Tile not found");

	return getClassByName(gridTileInformation.category, tileName, pos, direction, size, gridTileInformation.speed);
}