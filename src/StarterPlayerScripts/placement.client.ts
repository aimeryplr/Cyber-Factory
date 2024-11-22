import { ReplicatedStorage, Players } from "@rbxts/services";
import InteractionHandler from "./UI/interactionHandler";
import { Settings, settingsData } from "ReplicatedStorage/settings";
import { setBaseVolumeValue } from "ReplicatedStorage/Scripts/Utils/playSound";

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;
const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;
const loadSettingsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("loadSettings") as RemoteEvent;
const saveSettingsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("saveSettings") as RemoteEvent;

loadSettingsEvent.OnClientEvent.Connect((settings: unknown) => {
    Settings.getInstance().setSettings(settings as settingsData);
})

setPlayerPlot.OnClientEvent.Connect((gridBase: BasePart, tileGrid: string) => {
    setBaseVolumeValue()
    new InteractionHandler(gridBase);

    showPlotClaimedUI();

    setConveyerBeamsEvent.OnClientEvent.Connect((beams: Array<Beam>) => {
        beams.forEach((beam) => {
            beam.SetTextureOffset();
        });
    });
})

function showPlotClaimedUI() {
    // show a text to the player screen
    const text = ReplicatedStorage.WaitForChild("prefab").WaitForChild("UI").WaitForChild("plotClaimedUI").Clone();
    text.Parent = Players.LocalPlayer.WaitForChild("PlayerGui").WaitForChild("ScreenGui");
    wait(3);
    text.Destroy();
}

Players.PlayerRemoving.Connect((player) => {
    saveSettingsEvent.FireServer(Settings.getInstance().getSettings());
})
