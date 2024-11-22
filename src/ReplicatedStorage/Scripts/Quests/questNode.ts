import { Quest } from "./quest";

export class QuestNode {
    quest: Quest;
    children = new Array<QuestNode>();

    constructor(quest: Quest) {
        this.quest = quest;
    }

    addChild(child: QuestNode) {
        this.children.push(child);
    }

    addQuest(quest: Quest) {
        this.addChild(new QuestNode(quest));
    }

    getChild(index: number) {
        return this.children[index];
    }

    getChildren() {
        return this.children;
    }

    getNextQuests() {
        return this.children.map((node) => node.quest);
    }

    getQuest() {
        return this.quest;
    }
}