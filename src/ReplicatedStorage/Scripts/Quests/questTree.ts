import { CraftReward, Quest, RewardType, TileReward } from "./quest";
import { QuestNode } from "./questNode";
import { concat } from "./questTreeUtils";

export class QuestTree {
    roots: QuestNode[] = [];

    constructor(roots: QuestNode[]) {
        for (const root of roots) {
            this.roots.push(root);
        }
    }

    addRoot(questNode: QuestNode) {
        this.roots.push(questNode);
    }

    /**
     * Get the next quests of a given quest if all the parent's next quests are claimed
     * @throws Error if quest is not found
     */
    getNextQuests(quest: Quest): Quest[] {
        const questNode = this.searchQuestNode(quest.name);
        assert(questNode, `Quest ${quest.name} not found`);

        return questNode.getNextQuests();
    }

    getParent(quest: Quest): Quest[] {
        const parents = new Array<Quest>();
        for (const root of this.roots) {
            [...parents, ...this.getParentRecursive(root, quest)];
        }
        return parents;
    }

    private getParentRecursive(node: QuestNode, quest: Quest): Quest[] {
        if (node.getChildren().find((questNode) => questNode.quest.name === quest.name)) return [node.quest];
        else if (node.getChildren().isEmpty()) return [];
        else {
            let parents = new Array<Quest>();
            for (const child of node.children) {
                parents = [...this.getParentRecursive(child, quest), ...parents];
            }
            return parents;
        }
    }

    /**
     * search a quest in the tree recursively
     * @returns the quest if founded 
     */
    searchQuest(questName: string): Quest {
        const questNode = this.searchQuestNode(questName);
        assert(questNode, `Quest ${questName} not found`);

        return questNode.quest;
    }

    /**
     * search a quest in the tree recursively
     * @returns the quest if founded 
     */
    searchQuestNode(questName: string): QuestNode | undefined {
        for (const root of this.roots) {
            const quest = this.searchQuestRecursive(root, questName);
            if (quest) return quest;
        }
    }

    /**
     * search a quest in the tree recursively
     * @returns the quest if founded 
     */
    private searchQuestRecursive(node: QuestNode, questName: string): QuestNode | undefined {
        if (node.quest.name === questName) return node;
        for (const child of node.children) {
            const quest = this.searchQuestRecursive(child, questName);
            if (quest) return quest;
        }
        return undefined;
    }

    getUnlockedEntities(quests: Quest[]): string[] {
        let unlockedEntities = new Array<string>();
        for (const root of this.roots) {
            unlockedEntities = concat(unlockedEntities, this.getUnlockedEntitiesRecusive(root, quests));
        }

        return unlockedEntities;
    }

    private getUnlockedEntitiesRecusive(node: QuestNode, quests: Quest[]): string[] {
        if (quests.find(quest => quest.name === node.quest.name)) return new Array<string>();
        else if (node.getChildren().isEmpty()) return getEntitiesFromQuest(node.quest)
        else {
            let unlockedEntities = getEntitiesFromQuest(node.quest);
            for (const child of node.children) {
                unlockedEntities = concat(unlockedEntities, this.getUnlockedEntitiesRecusive(child, quests));
            }
            return unlockedEntities
        }
    }

    getUnlockedTile(quests: Quest[]): string[] {
        let unlockedEntities = new Array<string>();
        for (const root of this.roots) {
            unlockedEntities = concat(unlockedEntities, this.getUnlockedTilesRecusive(root, quests));
        }

        return unlockedEntities;
    }

    private getUnlockedTilesRecusive(node: QuestNode, quests: Quest[]): string[] {
        if (quests.find(quest => quest.name === node.quest.name)) return new Array<string>();
        else if (node.getChildren().isEmpty()) return getTileFromQuest(node.quest)
        else {
            let unlockedEntities = getTileFromQuest(node.quest);
            for (const child of node.children) {
                unlockedEntities = concat(unlockedEntities, this.getUnlockedTilesRecusive(child, quests));
            }
            return unlockedEntities
        }
    }
}

export function getEntitiesFromQuest(quest: Quest): string[] {
    for (const reward of quest.rewards) {
        if (reward.type === RewardType.CRAFT) {
            return (reward as CraftReward).craft;
        }
    }
    return [];
}

export function getTileFromQuest(quest: Quest): string[] {
    for (const reward of quest.rewards) {
        if (reward.type === RewardType.TILE) {
            return (reward as TileReward).tile;
        }
    }
    return [];
}