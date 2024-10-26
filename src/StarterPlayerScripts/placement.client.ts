import { ReplicatedStorage, UserInputService, Workspace, Players, RunService } from "@rbxts/services";
import { PlacementHandler, placementType } from "ReplicatedStorage/Scripts/placementHandler";
import Hotbar from "./UI/hotbar";
import InteractionHandler from "./UI/interact";

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;
const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;

const hotBarKeyBinds = [Enum.KeyCode.One, Enum.KeyCode.Two, Enum.KeyCode.Three, Enum.KeyCode.Four, Enum.KeyCode.Five, Enum.KeyCode.Six, Enum.KeyCode.Seven, Enum.KeyCode.Eight, Enum.KeyCode.Nine];

//Keybinds
const terminateKey = Enum.UserInputType.MouseButton1;
const rotateKey = Enum.KeyCode.R;
const destroyModeKey = Enum.KeyCode.X;

//create a new placement handler
let placementHandler: PlacementHandler;
let interaction: InteractionHandler;

const hotbar = new Hotbar();
hotbar.setSlotFromName(0, "conveyer_t1");
hotbar.setSlotFromName(1, "generator_t1");
hotbar.setSlotFromName(2, "seller");
hotbar.setSlotFromName(3, "splitter_t1");
hotbar.setSlotFromName(4, "merger_t1");
hotbar.setSlotFromName(5, "crafter");


setPlayerPlot.OnClientEvent.Connect((gridBase: BasePart, tileGrid: string) => {
    placementHandler = new PlacementHandler(gridBase);
    interaction = new InteractionHandler(gridBase);

    UserInputService.InputBegan.Connect(handleInputs);

    showPlotClaimedUI();
});

RunService.Heartbeat.Connect(() => {
    handleInputs(undefined, false)
})

function handleInputs(input: InputObject | undefined, gameProcessed: boolean) {
    if (gameProcessed) return;
    if (!placementHandler) return;

    if (input && input.UserInputType === terminateKey && placementHandler.placementStatus === placementType.INTERACTING) {
        interaction.interact();
    } else if (UserInputService.GetMouseButtonsPressed()[0] && UserInputService.GetMouseButtonsPressed()[0].UserInputType === terminateKey) {
        placementHandler.destroyObject();
        placementHandler.placeObject();
    }

    if (!input) return;
    if (input.KeyCode === rotateKey) {
        placementHandler.rotate();
    }
    if (input.KeyCode === destroyModeKey) {
        placementHandler.activateDestroying();
    }

    for (let i = 0; i < hotBarKeyBinds.size(); i++) {
        if (input.KeyCode === hotBarKeyBinds[i]) {
            hotbar.activatePlacingFromHotbar(i, placementHandler);
        }
    }
}

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
