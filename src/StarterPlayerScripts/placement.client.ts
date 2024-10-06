import { ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
import { PlacementHandler } from "ReplicatedStorage/Scripts/placementHandler";
import Hotbar from "./hotbar";

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;
const setConveyerBeamsEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("setConveyerBeams") as RemoteEvent;

const hotBarKeyBinds = [Enum.KeyCode.One, Enum.KeyCode.Two, Enum.KeyCode.Three, Enum.KeyCode.Four, Enum.KeyCode.Five, Enum.KeyCode.Six, Enum.KeyCode.Seven, Enum.KeyCode.Eight, Enum.KeyCode.Nine];

//Keybinds
const terminateKey = Enum.UserInputType.MouseButton1;
const rotateKey = Enum.KeyCode.R;
const destroyModeKey = Enum.KeyCode.X;

//create a new placement handler
let placementHandler: PlacementHandler;

const hotbar = new Hotbar();
hotbar.setSlotFromName(0, "conveyer_t1");
hotbar.setSlotFromName(1, "generator_t1");
hotbar.setSlotFromName(2, "seller");
hotbar.setSlotFromName(3, "splitter_t1");
hotbar.setSlotFromName(4, "merger_t1");


setPlayerPlot.OnClientEvent.Connect((gridBase: BasePart) => {
    placementHandler = new PlacementHandler(gridBase);

    UserInputService.InputBegan.Connect(handleInputs);
});

function handleInputs(input: InputObject, gameProcessed: boolean) {
    if (gameProcessed) return;

    if (input.UserInputType === terminateKey) {
        placementHandler.destroyObject();
        placementHandler.placeObject();
    }
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