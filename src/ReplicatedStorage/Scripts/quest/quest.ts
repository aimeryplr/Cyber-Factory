export interface Quest {
    name: string;
    tier: number;
    nextQuests: string[];
    goal: Map<string, number>;
    rewards: Reward[];
}

export type Reward = MoneyReward | CraftReward | TileReward;

export interface MoneyReward {
    type: RewardType.MONEY;
    amount: number;
}

export interface CraftReward {
    type: RewardType.CRAFT;
    craft: string[];
}

export interface TileReward {
    type: RewardType.TILE;
    tile: string[];
}

export enum RewardType {
    MONEY = "MONEY",
    CRAFT = "CRAFT",
    TILE = "TILE",
}
