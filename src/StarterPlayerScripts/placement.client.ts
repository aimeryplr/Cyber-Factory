import { ReplicatedStorage, Players } from "@rbxts/services";
import InteractionHandler from "./UI/interactionHandler";

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;
const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;


setPlayerPlot.OnClientEvent.Connect((gridBase: BasePart, tileGrid: string) => {
    new InteractionHandler(gridBase);

    showPlotClaimedUI();
});

setConveyerBeamsEvent.OnClientEvent.Connect((beams: Array<Beam>) => {
    beams.forEach((beam) => {
        beam.SetTextureOffset();
    });
});

function showPlotClaimedUI() {
    // show a text to the player screen
    const text = ReplicatedStorage.WaitForChild("prefab").WaitForChild("UI").WaitForChild("plotClaimedUI").Clone();
    text.Parent = Players.LocalPlayer.WaitForChild("PlayerGui").WaitForChild("ScreenGui");
    wait(3);
    text.Destroy();
}
