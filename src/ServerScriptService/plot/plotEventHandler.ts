import { HttpService, ReplicatedStorage } from "@rbxts/services";
import PlotManager from "./plotManager";
import { findBasepartByName, getLocalPosition } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import Conveyer from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/conveyer";
import { addMoney, hasEnoughMoney, removeMoney, sellConveyerContent } from "./plotsUtils";
import { getTileEntityByCategory, getTileEntityInformation } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { savePlayerData } from "ServerScriptService/datastore";
import { setupObject } from "ReplicatedStorage/Scripts/placementHandlerUtils";
import Generator from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/generator";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";
import Crafter from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/crafter";
import { getComponent } from "ReplicatedStorage/Scripts/Content/Entities/entityUtils";
import { Component } from "ReplicatedStorage/Scripts/Content/Entities/component";

const sendTileGrid = ReplicatedStorage.WaitForChild("Events").WaitForChild("sendTileGrid") as RemoteEvent;

export const onGettingTileEvent = (plotManager: PlotManager, player: Player, tilePos: unknown) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return;

    const tile = HttpService.JSONEncode(plot.getGridTiles().getTileFromPosition(tilePos as Vector3)?.encode());
    return tile;
}

export const onRemoveTileEvent = (plotManager: PlotManager, player: unknown, tile: unknown): void => {
    const plot = plotManager.getPlotByOwner((player as Player).UserId);
    if (!plot) return;

    const removedTile = plot.removeGridTile(tile as BasePart);
    if (removedTile instanceof Conveyer) sellConveyerContent((player as Player), removedTile);
    if (removedTile) {
        const tilePrice = getTileEntityInformation(removedTile.name).price;
        addMoney(player as Player, tilePrice);
        sendTileGrid.FireClient(player as Player, HttpService.JSONEncode(plot.encode()));
    }
    // print(plot.getGridTiles().tileGrid);
}

export const onPlayerRemoving = (plotManager: PlotManager, player: Player) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return

    const moneyValue = player.FindFirstChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    const tierValue = player.FindFirstChild("leaderstats")?.FindFirstChild("Tier") as IntValue;

    savePlayerData(player.UserId, { money: moneyValue.Value, tier: tierValue.Value, grid: HttpService.JSONEncode(plot.encode()) })
    plot.removeOwner();
}

export const onPlacingTile = (plotManager: PlotManager, player: Player, tileName: unknown, pos: unknown, orientation: unknown, size: unknown, gridBase: unknown): boolean => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    const direction = new Vector2(math.round(math.cos(orientation as number)), math.round(math.sin(orientation as number)));
    const localPos = getLocalPosition(pos as Vector3, gridBase as BasePart);
    const tileObject = findBasepartByName(tileName as string);
    const tileInformation = getTileEntityInformation(tileName as string);
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
        sendTileGrid.FireClient(player, HttpService.JSONEncode(plot.encode()));
    }
    // print(plot.getGridTiles().tileGrid);
    return isPlaceable;
}

export const onChangingGeneratorRessource = (plotManager: PlotManager, player: Player, position: unknown, ressource: unknown) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return;

    const tile = plot.getGridTiles().getTileFromPosition(position as Vector3);
    if (!tile || !(tile instanceof Generator)) return;
    tile.setRessource(new Ressource(ressource as string));
}

export const onChangingCrafterComponent = (plotManager: PlotManager, player: Player, position: unknown, component: unknown) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return;

    const tile = plot.getGridTiles().getTileFromPosition(position as Vector3);
    if (!tile || !(tile instanceof Crafter)) return;
    tile.setCraft(getComponent(component as string) as Component);
}