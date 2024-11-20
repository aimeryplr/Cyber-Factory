import { ReplicatedStorage } from "@rbxts/services";
import { entitiesList } from "ReplicatedStorage/Scripts/Entities/EntitiesList";
import { CraftReward, MoneyReward, Quest, Reward, RewardType, TileReward } from "ReplicatedStorage/Scripts/quest/quest";
import { questList } from "ReplicatedStorage/Scripts/quest/questList";
import { getImage } from "./imageUtils";
import { getTileEntityInformation } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { formatCompact } from "ReplicatedStorage/Scripts/Utils/numberFormat";

const playerQuestEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("playerQuests") as RemoteEvent;
const questboardPrefab = ReplicatedStorage.WaitForChild("prefab").WaitForChild("UI").WaitForChild("questBoard") as Frame;

export class QuestBoard {
    questBoard: questBoard;

    constructor(player: Player) {
        this.questBoard = player.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("questBoard") as questBoard;

        playerQuestEvent.OnClientEvent.Connect((quests: Quest[]) => {
            this.loadQuests(quests);
        });
    }

    private destroyQuests() {
        for (const child of this.questBoard.quests.GetChildren()) {
            if (!child.Name.find("2").isEmpty()) child.Destroy();
        }
    }

    private addQuest(quest: Quest) {
        const questFrame = questboardPrefab.FindFirstChild("quest")!.Clone() as Frame;
        questFrame.Name = "2" + quest.name;

        const questName = questFrame.FindFirstChild("1name") as TextLabel;
        questName.Text = quest.name;

        for (const [resource, amount] of quest.goal) {
            this.addGoal(resource, quest, amount, questFrame);
        }

        for (const reward of quest.rewards) {
            this.addReward(reward, questFrame);
        }

        questFrame.Parent = this.questBoard.quests;
    }

    private addReward(reward: Reward, questFrame: Frame) {
        const rewardFrame = questFrame.FindFirstChild("3rewards") as Frame;
        switch (reward.type) {
            case RewardType.MONEY:
                this.addMoneyReward(reward, rewardFrame);
                break;
            case RewardType.CRAFT:
                this.addItemReward(reward, rewardFrame);
                break;
            case RewardType.TILE:
                this.addItemReward(reward, rewardFrame);
                break;
            default:
                error("Reward type not found");
        }
    }

    private addItemReward(reward: CraftReward | TileReward , rewardFrame: Frame) {
        const itemPrefab = questboardPrefab.FindFirstChild("item") as itemPrefab;
        if (reward.type === RewardType.CRAFT) {
            for (const craft of reward.craft) {
                const item = itemPrefab.Clone();
                const resourceInfo = entitiesList.get(craft)!;
                item.Image = getImage(resourceInfo);
                item.TextLabel.Destroy();
                item.Parent = rewardFrame;
            }
        } else if (reward.type === RewardType.TILE) {
            for (const tile of reward.tile) {
                const item = itemPrefab.Clone();
                const tileInfo = getTileEntityInformation(tile)!;
                item.Image = getImage(tileInfo.image);
                item.TextLabel.Destroy();
                item.Parent = rewardFrame;
            }
        }
    }

    private addMoneyReward(reward: MoneyReward, rewardFrame: Frame) {
        const priceFrame = questboardPrefab.FindFirstChild("price")!.Clone() as Frame;
        (priceFrame.FindFirstChild("TextLabel") as TextLabel)!.Text = formatCompact(reward.amount);
        priceFrame.Parent = rewardFrame;
    }

    private addGoal(resource: string, quest: Quest, amount: number, questFrame: Frame) {
        const itemPrefab = questboardPrefab.FindFirstChild("item") as itemPrefab;
        const questGoal = questFrame.FindFirstChild("2goal") as Frame;
        const resourceInfo = entitiesList.get(resource)!;
        const originalGoal = questList.get(quest.name)!.goal;
        const item = itemPrefab.Clone();

        item.Image = getImage(resourceInfo);
        item.TextLabel.Text = amount + "/" + originalGoal.get(resource)!;
        item.Parent = questGoal;
    }

    loadQuests(quests: Quest[]) {
        this.destroyQuests();
        quests.forEach(quest => {
            this.addQuest(quest);
        });
    }
}