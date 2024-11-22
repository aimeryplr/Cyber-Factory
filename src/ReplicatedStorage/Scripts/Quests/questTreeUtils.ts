import { Quest } from "./quest";
import { QuestNode } from "./questNode";

export function concat(array: string[], toAdd: string[]): string[] {
    array = table.clone(array);
    for (const element of toAdd) {
        array.push(element);
    }
    return array;
}

export function contains(array: Quest[], contained: Quest[]): boolean {
    for (const element of contained) {
        if (!array.includes(element)) return false;
    }
    return true;
}

export function getQuestFromQuestNodes(questNodes: QuestNode[]): Quest[] {
    const quests: Array<Quest> = [];
    for (const questNode of questNodes) {
        quests.push(questNode.quest);
    }
    return quests;
}