import { HttpService, ReplicatedStorage } from "@rbxts/services";
import PlotManager from "./plotManager";
import { findBasepartByName, getLocalPosition, removeConectedTiles } from "ReplicatedStorage/Scripts/Tile/TileEntities/Utils/tileEntityUtils";
import Conveyor from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/conveyor";
import { addMoney, hasEnoughMoney, removeMoney, resetBeamsOffset, sellConveyerContent } from "./plotsUtils";
import { getTileByCategory, getTileInformation } from "ReplicatedStorage/Scripts/Tile/TileEntities/tileEntityProvider";
import { savePlayerData } from "ServerScriptService/Datastore/datastore";
import { setupObject } from "ReplicatedStorage/Scripts/PlacementHandler/placementHandlerUtils";
import Generator from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/generator";
import Crafter from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/crafter";
import { TileEntity } from "ReplicatedStorage/Scripts/Tile/TileEntities/tileEntity";
import { entitiesList } from "ReplicatedStorage/Scripts/Entities/EntitiesList";
import { Component } from "ReplicatedStorage/Scripts/Entities/entity";
import Assembler from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/assembler";
import { questTreeArray } from "ReplicatedStorage/Scripts/Quests/questList";
import { getQuestFromQuestNodes } from "ReplicatedStorage/Scripts/Quests/questTreeUtils";
import { getPlacedGeneratorCount } from "ReplicatedStorage/Scripts/TileGrid/tileGridUtils";

const sendTileGrid = ReplicatedStorage.WaitForChild("Events").WaitForChild("sendTileGrid") as RemoteEvent;
const playerQuests = ReplicatedStorage.WaitForChild("Events").WaitForChild("playerQuests") as RemoteEvent;

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
    if (removedTile instanceof Conveyor) sellConveyerContent((player as Player), removedTile);
    if (removedTile) {
        const tileInformation = getTileInformation(removedTile.name);
        const tilePrice = tileInformation.category === "generator" ? Generator.getPrice(getPlacedGeneratorCount(plot.getGridTiles())) : tileInformation.price;;
        addMoney(player as Player, tilePrice);
        sendTileGrid.FireClient(player as Player, HttpService.JSONEncode(plot.encode()));
    }
    // print(plot.encode());
}

export const onPlacingTile = (plotManager: PlotManager, player: Player, tileName: unknown, pos: unknown, orientation: unknown, size: unknown, gridBase: unknown): boolean => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    assert(plot, "Player does not own a plot");

    const direction = new Vector2(math.round(math.cos(orientation as number)), math.round(math.sin(orientation as number)));
    const localPos = getLocalPosition(pos as Vector3, gridBase as BasePart);
    const tileObject = findBasepartByName(tileName as string);
    const tileInformation = getTileInformation(tileName as string);
    const tileEntity = getTileByCategory(tileInformation, localPos as Vector3, size as Vector2, direction, gridBase as BasePart);
    const placementPrice = tileInformation.category === "generator" ? Generator.getPrice(getPlacedGeneratorCount(plot.getGridTiles())) : tileInformation.price;

    //check if player owns a plot and if the tile exists
    if (!tileObject || !plot || !tileEntity) {
        error("Tile not found or player does not own a plot or gridTile not found");
    }

    if (!hasEnoughMoney(player, placementPrice)) return false;

    const isPlaceable = plot.getGridTiles().checkPlacement(tileEntity);
    if (isPlaceable) {
        removeMoney(player, placementPrice);
        setupObject(tileObject, pos as Vector3, orientation as number, gridBase as BasePart);
        plot.addGridTile(tileEntity, player.UserId);
        sendTileGrid.FireClient(player, HttpService.JSONEncode(plot.encode()));
    }
    // print(plot.encode());
    return isPlaceable;
}

export const onPlayerRemoving = (plotManager: PlotManager, player: Player) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return

    const moneyValue = player.FindFirstChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    const tierValue = player.FindFirstChild("leaderstats")?.FindFirstChild("Tier") as IntValue;

    savePlayerData(player.UserId, { money: moneyValue.Value, tier: tierValue.Value, quests: plot.getQuests(), grid: HttpService.JSONEncode(plot.encode()) })
    plot.removeOwner();
}

export const onChangingGeneratorRessource = (plotManager: PlotManager, player: Player, position: unknown, resource: unknown) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return;

    const tile = plot.getGridTiles().getTileFromPosition(position as Vector3);
    if (!tile || !(tile instanceof Generator)) return;

    tile.setRessource(entitiesList.get(resource as string)!);
}

export const onChangingCrafterOrAssemblerCraft = (plotManager: PlotManager, player: Player, position: unknown, component: unknown) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return;

    const tile = plot.getGridTiles().getTileFromPosition(position as Vector3);
    if (!tile || (!(tile instanceof Crafter) && !(tile instanceof Assembler))) return;

    tile.setCraft(entitiesList.get(component as string)! as Component);
}

export const rotateTile = (plotManager: PlotManager, player: Player, position: unknown) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return;

    const tile = plot.getGridTiles().getTileFromPosition(getLocalPosition(position as Vector3, plot.getGridBase()));
    if (!tile) return;

    if (tile instanceof TileEntity) {
        const tileGrid = plot.getGridTiles();
        removeConectedTiles(tile);
        tileGrid.removeTile(tile);
        tile.rotate(plot.getGridBase());
        if (!tileGrid.checkPlacement(tile)) {
            tile.rotate(plot.getGridBase());
            tile.rotate(plot.getGridBase());
            tile.rotate(plot.getGridBase());
        }
        tileGrid.addTile(tile);
        tile.setAllConnectedNeighboursTileEntity(tileGrid);
        tile.updateMesh(plot.getGridBase());
        sendTileGrid.FireClient(player, HttpService.JSONEncode(plot.encode()));
    }

    if (tile instanceof Conveyor) {
        resetBeamsOffset(plot.getGridBase());
    }
}

export const resetPlot = (plotManager: PlotManager, player: Player) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return;

    plot.reset();
    sendTileGrid.FireClient(player, HttpService.JSONEncode(plot.encode()));
}

export const resetQuests = (plotManager: PlotManager, player: Player) => {
    const plot = plotManager.getPlotByOwner(player.UserId);
    if (!plot) return;

    plot.setQuests([]);
    for (const quest of getQuestFromQuestNodes(questTreeArray[0].roots)) {
        plot.addQuest(quest);
    }
    playerQuests.FireClient(player, plot.getQuests());
}