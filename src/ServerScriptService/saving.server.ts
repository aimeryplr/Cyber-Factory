import { Players } from "@rbxts/services";
import { getPlayerData, playerData, savePlayerData } from "./datastore";


Players.PlayerAdded.Connect((player) => {
    // Variables
    const moneyValue = player.WaitForChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    const tierValue = player.WaitForChild("leaderstats")?.FindFirstChild("Tier") as IntValue;

    if (!moneyValue || !tierValue) return;

    const save = getPlayerData(player.UserId);

    if (save) {
        moneyValue.Value = save.money;
        tierValue.Value = save.tier;
    } else {
        moneyValue.Value = 1000;
        tierValue.Value = 1;
    }
});
