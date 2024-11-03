import { CommandContext } from "@rbxts/cmdr";
import { ReplicatedStorage } from "@rbxts/services";

const resetQuestsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("resetQuests") as BindableEvent;

const resetPlot = (context: CommandContext) => {
    const player = context.Executor;
    print("Resetting quests for player: " + player.Name);
    resetQuestsEvent.Fire(player);
}

export = resetPlot;