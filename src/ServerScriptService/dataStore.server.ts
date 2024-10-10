import { Players, DataStoreService } from "@rbxts/services";

const dataStore = DataStoreService.GetDataStore("SaveData");

Players.PlayerAdded.Connect((player) => {
    // Variables
    const moneyValue = player.FindFirstChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    const tierValue = player.FindFirstChild("leaderstats")?.FindFirstChild("Tier") as StringValue;

    if (!moneyValue || !tierValue) return;

    // Save with the id of the player to recognize who the data belongs to
    let attempt = 0;
    let success = false;
    let getSaved: unknown;

    // Try to get already saved data
    do {
        [success, getSaved] = pcall(() => {
            return dataStore.GetAsync(tostring(player.UserId));
        });
        attempt += 1;
    } while (!success && attempt < 5);

    if (getSaved) {
        moneyValue.Value = (getSaved as Array<number>)[0];
        tierValue.Value = (getSaved as Array<string>)[1];
    } else {
        moneyValue.Value = 1000;
        tierValue.Value = "1";
    }
});

Players.PlayerRemoving.Connect((player) => {
    const moneyValue = player.FindFirstChild("leaderstats")?.FindFirstChild("Money") as IntValue;
    const tierValue = player.FindFirstChild("leaderstats")?.FindFirstChild("Tier") as StringValue;

    if (!moneyValue || !tierValue) return;

    let attempt = 0;
    let success = false;

    do {
        [success] = pcall(() => {
            return dataStore.SetAsync(tostring(player.UserId), [moneyValue.Value, tierValue.Value]);
        });
        attempt += 1;
    } while (!success && attempt < 5);
});
