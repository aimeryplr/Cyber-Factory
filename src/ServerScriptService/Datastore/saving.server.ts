import { Players } from "@rbxts/services";
import { getPlayerData } from "./datastore";


Players.PlayerAdded.Connect((player) => {
    setupLeaderStats(player)    

    // Variables
    const moneyValue = player.WaitForChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    const tierValue = player.WaitForChild("leaderstats")?.FindFirstChild("Tier") as IntValue;

    if (!moneyValue || !tierValue) return;

    const save = getPlayerData(player.UserId);

    if (save) {
        moneyValue.Value = save.money;
        tierValue.Value = save.tier;
    } else {
        moneyValue.Value = 3000;
        tierValue.Value = 1;
    }
});

function setupLeaderStats(player: Player) {
    const leaderstats = new Instance("Folder");
    leaderstats.Name = "leaderstats";

    // Create the Money stat
    const money = new Instance("IntValue");
    money.Name = "Money";
    money.Parent = leaderstats;

    // Create the Tier stat
    const tier = new Instance("IntValue");
    tier.Name = "Tier";
    tier.Parent = leaderstats;

    // Parent the leaderstats folder to the player
    leaderstats.Parent = player;
}