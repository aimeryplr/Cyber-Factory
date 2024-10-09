import { Players, ReplicatedStorage } from "@rbxts/services";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandler";
import PlotsManager from "./plotsManager";
import { findBasepartByName } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import { getGridEntityInformation, getTileEntityByCategory } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { addMoney, hasEnoughMoney, removeMoney, sellConveyerContent } from "./plotsUtils";
import Conveyer from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/conveyer";

const placeTileCallback = ReplicatedStorage.WaitForChild("Events").WaitForChild("placeTileCheck") as RemoteFunction;
const removeTileEvent: RemoteEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("removeTile") as RemoteEvent;
const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;

const plotsManager = new PlotsManager();

placeTileCallback.OnServerInvoke = (player: Player, tileName: unknown, pos: unknown, orientation: unknown, size: unknown, gridBase: unknown): boolean => {
	const plot = plotsManager.getPlotByOwner(player.UserId);
	const direction = new Vector2(math.round(math.cos(orientation as number)), math.round(math.sin(orientation as number)));
	const localPos = (pos as Vector3).sub((gridBase as BasePart).Position.Floor());
	const tileObject = findBasepartByName(tileName as string);
	const tileInformation = getGridEntityInformation(tileName as string);
	const tileEntity = getTileEntityByCategory(tileInformation.category, tileName as string, localPos as Vector3, size as Vector2, direction, tileInformation.speed as number);

	//check if player owns a plot and if the tile exists
	if (!tileObject || !plot || !tileEntity) {
		error("Tile not found or player does not own a plot or gridTile not found");
	}

	if (!hasEnoughMoney(player, tileInformation.price)) return false;
	
	const isPlaceable = plot.getGridTiles().checkPlacement(tileEntity);
	if (isPlaceable) {
		removeMoney(player, tileInformation.price); 
		setupObject(tileObject, pos as Vector3, orientation as number, gridBase as BasePart);
		plot.addGridTile(tileEntity, player.UserId);
	}
	// print(plot.getGridTiles().tileGrid);
	return isPlaceable;
};

removeTileEvent.OnServerEvent.Connect((player: unknown, tile: unknown): void => {
	const plot = plotsManager.getPlotByOwner((player as Player).UserId);
	if (!plot) return;

	const removedTile = plot.removeGridTile(tile as BasePart);
	if (removedTile instanceof Conveyer) sellConveyerContent((player as Player), removedTile);
	if (removedTile) {
		const tilePrice = getGridEntityInformation(removedTile.name).price;
		addMoney(player as Player, tilePrice);
	} 
	// print(plot.getGridTiles().tileGrid); 
})


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

