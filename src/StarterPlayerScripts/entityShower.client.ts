import { ReplicatedStorage } from "@rbxts/services";
import EntitiesHandler from "./entitiesHandler";
import Conveyer from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/conveyer";
import { TileEntity } from "ReplicatedStorage/Scripts/gridEntities/tileEntity";

const setPlayerPlot = ReplicatedStorage.WaitForChild("Events").WaitForChild("setPlayerPlot") as RemoteEvent;
const conveyerContentUpdate = ReplicatedStorage.WaitForChild("Events").WaitForChild("conveyerContentUpdate") as RemoteEvent;

let entitiesHandler: EntitiesHandler | undefined = undefined

setPlayerPlot.OnClientEvent.Connect((gridBase: BasePart) => {
    entitiesHandler = new EntitiesHandler(gridBase);
});

conveyerContentUpdate.OnClientEvent.Connect((conveyer: Conveyer, previousConveyer?: Conveyer | Vector3) => {
    if (entitiesHandler) {
        entitiesHandler.updateConveyerEntities(conveyer, previousConveyer);
    }
});

