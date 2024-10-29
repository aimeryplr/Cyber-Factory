import { CommandContext } from "@rbxts/cmdr";
import { ReplicatedStorage } from "@rbxts/services";

const resetPlotEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("resetPlot") as BindableEvent;

const resetPlot = (context: CommandContext) => {
    const player = context.Executor;
    print("Resetting plot for player: " + player.Name);
    resetPlotEvent.Fire(player);
}

export = resetPlot;