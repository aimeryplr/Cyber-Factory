import { TileEntity } from "ReplicatedStorage/Scripts/Tile Entities/tileEntity";
import { Players, ReplicatedStorage } from "@rbxts/services";
import { TileGrid } from "../../ReplicatedStorage/Scripts/Tile Grid/tileGrid";
import Conveyor from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/conveyor";
import Plot from "./plot";
import Generator from "ReplicatedStorage/Scripts/Tile Entities/tileEntitiesChilds/generator";

const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;

function changeShapes(tile: TileEntity, gridBase: BasePart, tileGrid: TileGrid): void {
    tile.updateShape(gridBase);
    for (const neighbour of tile.getAllNeighbours(tileGrid)) {
        neighbour[0].updateShape(gridBase);
    }
}

/**
 * reset the animation for all conveyer.
 * Must use when adding a new conveyer to sync it with the rest
 */
function resetBeamsOffset(gridBase: BasePart): void {
    const beams = new Array<Beam>();
    gridBase.FindFirstChild("PlacedObjects")?.GetChildren().forEach((child) => {
        child.GetChildren().forEach((part) => {
            if (part.IsA("Beam")) {
                beams.push(part as Beam);
            }
        });
    })
    Players.GetPlayers().forEach((player) => {
        setConveyerBeamsEvent.FireClient(player, beams);
    });
}

function getPlayerFromUserId(userId: number): Player {
    const player = Players.GetPlayerByUserId(userId);
    if (!player) error("Player not found");
    return player
}

function hasEnoughMoney(player: Player, price: number): boolean {
    const money = player.FindFirstChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    if (!money) error("Money on leaderstat not found");
    return money.Value >= price;
}

function removeMoney(player: Player, price: number): void {
    const money = player.FindFirstChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    if (!money) error("Money on leaderstat not found");
    money.Value -= price;
}

function addMoney(player: Player, price: number): void {
    const money = player.FindFirstChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    if (!money) error("Money on leaderstat not found");
    money.Value += price;
}

function sellConveyerContent(player: Player, conveyer: TileEntity): void {
    if (conveyer instanceof Conveyor) {
        const content = conveyer.content;
        for (const entity of content) {
            if (entity !== undefined) {
                addMoney(player, entity.price);
            }
        }
    }
}

export function getMoneyReward(player: Player, reward: number): void {
    const money = player.FindFirstChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    if (!money) error("Money on leaderstat not found");
    money.Value += reward;
}

export { changeShapes, resetBeamsOffset, getPlayerFromUserId, hasEnoughMoney, removeMoney, addMoney, sellConveyerContent };