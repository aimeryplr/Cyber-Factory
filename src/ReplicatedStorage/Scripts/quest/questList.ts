import { getEntitiesListName } from "../Entities/entityUtils";
import { getTileEntityNames } from "../gridEntities/tileEntityUtils";
import { CraftReward, Quest, Reward, RewardType, TileReward } from "./quest";
import { QuestNode } from "./questNode";
import { QuestTree } from "./questTree";
import { concat } from "./questTreeUtils";

/**
 * List of all quests
 */
export const questList: Map<string, Quest> = new Map([
    ["Beginning of the end", {
        name: "Beginning of the end",
        tier: 1,
        nextQuests: ["Some more Carbon"],
        goal: new Map([["Carbon", 15]]),
        rewards: [{ type: RewardType.MONEY, amount: 100 }, { type: RewardType.TILE, tile: ["crafter"] }, { type: RewardType.CRAFT, craft: ["Carbon Plate"] }]
    }],
    ["Some more Carbon", {
        name: "Some more Carbon",
        tier: 1,
        nextQuests: ["And some more and more Carbon"],
        goal: new Map([["Carbon Plate", 60]]),
        rewards: [{ type: RewardType.MONEY, amount: 5000 }, { type: RewardType.CRAFT, craft: ["Graphene, Carbon Tube"] }]
    }],
    ["And some more and more Carbon", {
        name: "And some more and more Carbon",
        tier: 1,
        nextQuests: ["That's some good structure", "Connecting your grandpa"],
        goal: new Map([["Graphene", 300]]),
        rewards: [{ type: RewardType.MONEY, amount: 5000 }, { type: RewardType.CRAFT, craft: ["Copper", "Polymer", "Polymer Plate", "Copper Wire"] }]
    }],
    ["That's some good structure", {
        name: "That's some good structure",
        tier: 1,
        nextQuests: [""],
        goal: new Map([["Polymer Plate", 400]]),
        rewards: [{ type: RewardType.MONEY, amount: 69999 }]
    }],
    ["Connecting your grandpa", {
        name: "Connecting your grandpa",
        tier: 1,
        nextQuests: [""],
        goal: new Map([["Copper Wire", 400]]),
        rewards: [{ type: RewardType.MONEY, amount: 69999 }, { type: RewardType.CRAFT, craft: ["Cable"] }]
    }],
    ["Reinforced Plate", {
        name: "Reinforced Plate",
        tier: 2,
        nextQuests: [""],
        goal: new Map([["Reinforced Plate", 500]]),
        rewards: [{ type: RewardType.MONEY, amount: 69999 }]
    }],
    ["Reinforced Tube", {
        name: "Reinforced Tube",
        tier: 2,
        nextQuests: [""],
        goal: new Map([["Reinforced Tube", 500]]),
        rewards: [{ type: RewardType.MONEY, amount: 69999 }]
    }],
    ["Reinforced Wire", {
        name: "Reinforced Wire",
        tier: 2,
        nextQuests: [""],
        goal: new Map([["Reinforced Wire", 500]]),
        rewards: [{ type: RewardType.MONEY, amount: 69999 }]
    }]
]);

export const tiers: {rewards: Reward[], nextQuests: string[]}[] = [
    {
        rewards: [{ type: RewardType.MONEY, amount: 145000 }, { type: RewardType.TILE, tile: ["assembler"] }, { type: RewardType.CRAFT, craft: ["Reinforced Plate", "Reinforced Tube", "Reinforced Wire"]}],
        nextQuests: ["Reinforced Plate", "Reinforced Tube", "Reinforced Wire"],
    },
    {
        rewards: [{ type: RewardType.MONEY, amount: 1450000 }, { type: RewardType.CRAFT, craft: ["Transistor"] }],
        nextQuests: [],
    }
]

const questListNode = new Array<Array<QuestNode>>(tiers.size() + 1);
for (let i = 0; i < tiers.size() + 1; i++) {
    questListNode[i] = new Array<QuestNode>();
}

// setup quest tree
for (const [name, quest] of questList) {
    questListNode[quest.tier - 1].push(new QuestNode(quest));
}
const questTreeArray: Array<QuestTree> = [new QuestTree([questListNode[0].find(questNode => questNode.quest.name === "Beginning of the end")!])];

for (let i = 0; i < tiers.size(); i++) {
    const tier = tiers[i];
    const questTree = new QuestTree([]);
    questTreeArray.push(questTree);
    for (const questName of tier.nextQuests) {
        questTree.addRoot(questListNode[i].find(questNode => questNode.quest.name === questName)!);
    }
}


for (const tierQuestNode of questListNode) {
    for (const questNode of tierQuestNode) {
        for (const nextQuestName of questNode.quest.nextQuests) {
            const nextQuest = tierQuestNode.find(questNode => questNode.quest.name === nextQuestName);
            if (nextQuest) {
                questNode.addChild(nextQuest);
            }
        }
    }
}

export { questTreeArray };

export function isQuestCompleted(quest: Quest) {
    const originalGoal = questList.get(quest.name)!.goal;
    for (const [goal, amount] of quest.goal) {
        if (amount < originalGoal.get(goal)!) return false;
    }
    return true;
}

const alreadyUnlockedCraft: string[] = getEntitiesListName();
const alreadyUnlockeTile: string[] = getTileEntityNames();

/**
 * Calcule alredy unlocked rewards
 */

function removeRewardEntitiesFromAlreadyUnlocked(reward: CraftReward | TileReward) {
    if (reward.type === RewardType.CRAFT) {
        for (const craft of (reward as CraftReward).craft) {
            alreadyUnlockedCraft.remove(alreadyUnlockedCraft.indexOf(craft));
        }
    } else if (reward.type === RewardType.TILE) {
        for (const tile of (reward as TileReward).tile) {
            alreadyUnlockeTile.remove(alreadyUnlockeTile.indexOf(tile));
        }
    }
}

for (const [name, quest] of questList) {
    for (const reward of quest.rewards) {
        if (reward.type === RewardType.MONEY) continue;
        removeRewardEntitiesFromAlreadyUnlocked(reward);
    }
}

for (const tier of tiers) {
    for (const reward of tier.rewards) {
        if (reward.type === RewardType.MONEY) continue;
        removeRewardEntitiesFromAlreadyUnlocked(reward);
    }
}

export { alreadyUnlockedCraft, alreadyUnlockeTile };

export function getUnlockedEntities(quests: Quest[]): string[] {
    const maxTier = quests.isEmpty() ? questListNode.size() : quests[0].tier;
    let unlockedEntities = new Array<string>();

    for (let i = 0; i < maxTier - 1; i++) {
        unlockedEntities = concat(unlockedEntities, questTreeArray[i].getUnlockedEntities([]));
    }
    unlockedEntities = concat(unlockedEntities, questTreeArray[maxTier - 1].getUnlockedEntities(quests));

    return concat(alreadyUnlockedCraft, unlockedEntities);
}

export function getUnlockedTile(quests: Quest[]): string[] {
    const maxTier = quests.isEmpty() ? questListNode.size() : quests[0].tier;
    let unlockedEntities = new Array<string>();

    for (let i = 0; i < maxTier - 1; i++) {
        unlockedEntities = concat(unlockedEntities, questTreeArray[i].getUnlockedTile([]));
    }

    unlockedEntities = concat(unlockedEntities, questTreeArray[maxTier - 1].getUnlockedTile(quests));

    return concat(alreadyUnlockeTile, unlockedEntities);
}