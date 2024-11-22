import { CraftReward, Quest, RewardType, TileReward } from "./quest";
import { Tier } from "./tier";

export function resetQuestGoals(quest: Quest): Quest {
    for (const goal of quest.goal) {
        quest.goal.set(goal[0], 0);
    }
    return quest;
}

export function updateGoals(quest: Quest, entityName: string) {
    const goal = quest.goal.get(entityName);
    if (goal === undefined) return;

    quest.goal.set(entityName, goal + 1);
}

export function cloneQuest(quest: Quest): Quest {
    const clonedQuest = table.clone(quest);
    quest.goal = table.clone(quest.goal);
    return clonedQuest;
}

export function areSameQuests(questsA: Quest[], questsB: Quest[]): boolean {
    if (questsA.size() !== questsB.size()) return false;

    for (const quest of questsB) {
        if (!questsA.find(q => q.name === quest.name)) return false;
    }

    return true;
}

export function getTileRewards(tier: Tier): string[] {
    return (tier.rewards.find(reward => reward.type === RewardType.TILE) as TileReward)?.tile ?? [];
}

export function getCraftRewards(tier: Tier): string[] {
    return (tier.rewards.find(reward => reward.type === RewardType.CRAFT) as CraftReward)?.craft ?? [];
}