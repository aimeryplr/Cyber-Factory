import { HttpService, Players, ReplicatedStorage } from "@rbxts/services";
import { getTileEntityInformation } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { decodeTile } from "ReplicatedStorage/Scripts/gridTileUtils";
import { getTileFromRay } from "ReplicatedStorage/Scripts/placementHandler";
import Generator from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/generator";
import GeneratorMenu from "./generatorMenu";
import { getLocalPosition } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";

const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;
const generatorMenu = new GeneratorMenu(Players.LocalPlayer);

class InteractionHandler {
    private gridBase: BasePart;
    private lastMenu: Frame | undefined;

    constructor(gridBase: BasePart) {
        this.gridBase = gridBase;
    }

    public interact(): void {
        if (this.lastMenu) {
            this.lastMenu.Visible = false;
            this.lastMenu = undefined;
            return;
        }
        
        const tilePart = getTileFromRay(this.gridBase);
        if (!tilePart) return;

        const partInfo = getTileEntityInformation(tilePart.Name);

        switch (partInfo.category) {
            case "generator":
                this.interarctWithGenerator(tilePart);
                break;
        }
    }

    public interarctWithGenerator(generatorPart: BasePart): void {
        const tile = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(getLocalPosition(generatorPart.Position, this.gridBase))) as Generator);
        generatorMenu.setGenerator(tile as Generator);
        
        generatorMenu.show();
        this.lastMenu = generatorMenu.getMenu();
    }
}

export default InteractionHandler;