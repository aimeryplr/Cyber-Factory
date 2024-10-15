import { DataStoreService } from "@rbxts/services";

const dataStore = DataStoreService.GetDataStore("SaveData");

export interface playerData {
    tier: number;
    money: number;
    grid: string; // JSON
}

function getPlayerData(playerId: number): playerData | undefined {
    const data = retry(() => {return dataStore.GetAsync(tostring(playerId));}, 5);

    if (data) {
        return data as playerData;
    }

    return undefined
}

function savePlayerData(playerId: number, playerData: playerData): boolean {
    return retry(() => {return dataStore.SetAsync(tostring(playerId), playerData);}, 5) !== undefined;
}

function saveTier(playerId: number, tier: number): boolean {
    const data = getPlayerData(playerId);
    if (data) {
        data.tier = tier;
        return savePlayerData(playerId, data);
    }

    return false;
}

function saveMoney(playerId: number, money: number): boolean {
    const data = getPlayerData(playerId);
    if (data) {
        data.money = money;
        return savePlayerData(playerId, data);
    }

    return false;
}

function saveGrid(playerId: number, grid: string): boolean {
    const data = getPlayerData(playerId);
    if (data) {
        data.grid = grid;
        return savePlayerData(playerId, data);
    }

    return false;
}

function retry(func: () => unknown, attempts: number): unknown {
    let success = false;
    let result: unknown;

    for (let i = 0; i < attempts; i++) {
        [success, result] = pcall(func);
        if (success) return result;
    }

    return undefined;
}

export { savePlayerData, getPlayerData, saveTier, saveMoney, saveGrid };