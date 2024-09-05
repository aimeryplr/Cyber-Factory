import { ReplicatedStorage, UserInputService, Workspace } from "@rbxts/services";
import { PlacementHandler } from "ReplicatedStorage/Scripts/placementHandler";

//Keybinds
const terminateKey = Enum.UserInputType.MouseButton1;
const rotateKey = Enum.KeyCode.R;
const stopPlacingKey = Enum.KeyCode.E;
//create a new placement handler
const placementHandler = new PlacementHandler(Workspace.WaitForChild("plot") as BasePart);

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
            const conveyer = ReplicatedStorage.FindFirstChild("Entities")?.FindFirstChild("GridEntities")?.FindFirstChild("conveyer");
            if (conveyer && conveyer.IsA("BasePart")) {
                placementHandler.activatePlacing(conveyer);
            }
        }
    }
});