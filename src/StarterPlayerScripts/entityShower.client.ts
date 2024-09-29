import { ReplicatedStorage } from "@rbxts/services";
import EntitiesHandler from "./entitiesHandler";
import Conveyer from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/conveyer";

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;
const conveyerContentUpdate = ReplicatedStorage.WaitForChild("Events").WaitForChild("conveyerContentUpdate") as RemoteEvent;

let entitiesHandler: EntitiesHandler | undefined = undefined

setPlayerPlot.OnClientEvent.Connect((gridBase: BasePart) => {
    entitiesHandler = new EntitiesHandler(gridBase);
});

conveyerContentUpdate.OnClientEvent.Connect((conveyer: Conveyer) => {
    if (entitiesHandler) {
        entitiesHandler.updateConveyerEntities(conveyer);
    }
});

