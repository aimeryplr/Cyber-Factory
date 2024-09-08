import { ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
import { PlacementHandler } from "ReplicatedStorage/Scripts/placementHandler";

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;

//Keybinds
const terminateKey = Enum.UserInputType.MouseButton1;
const rotateKey = Enum.KeyCode.R;
const stopPlacingKey = Enum.KeyCode.E;
//create a new placement handler
let placementHandler: PlacementHandler;

setPlayerPlot.OnClientEvent.Connect((gridBase: BasePart) => {
    placementHandler = new PlacementHandler(gridBase);

    UserInputService.InputBegan.Connect((input, gameProcessedEvent) => {
        if (!gameProcessedEvent) {
            if (input.UserInputType === terminateKey) {
                placementHandler.placeObject();
            }
            if (input.KeyCode === rotateKey) {
                placementHandler.rotate();
            }
            if (input.KeyCode === stopPlacingKey) {
                placementHandler.desactivatePlacing();
            }
            if (input.KeyCode === Enum.KeyCode.E) {
                const conveyer = ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild("GridEntities")?.FindFirstChild("conveyer_t1");
                if (conveyer && conveyer.IsA("BasePart")) {
                    placementHandler.activatePlacing(conveyer);
                }
            }
        }
    });
});