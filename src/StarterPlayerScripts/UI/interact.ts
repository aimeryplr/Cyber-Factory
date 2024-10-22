import { HttpService, Players, ReplicatedStorage } from "@rbxts/services";
import { getTileEntityInformation } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { decodeTile } from "ReplicatedStorage/Scripts/gridTileUtils";
import { getTileFromRay } from "ReplicatedStorage/Scripts/placementHandler";
import Generator from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/generator";
import GeneratorMenu from "./generatorMenu";
import { getLocalPosition } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import Crafter from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/crafter";
import CrafterMenu from "./crafterMenu";
import InteractionMenu from "./InteractionMenu";

const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;
const generatorMenu = new GeneratorMenu(Players.LocalPlayer);
const crafterMenu = new CrafterMenu(Players.LocalPlayer);

class InteractionHandler {
    private gridBase: BasePart;
    private lastMenu: InteractionMenu | undefined;

    constructor(gridBase: BasePart) {
        this.gridBase = gridBase;
    }

    public interact(): void {
        if (this.lastMenu) {
            this.lastMenu.hide();
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
            case "crafter":
                this.interactWithCrafter(tilePart);
                break;
        }
    }

    public interactWithCrafter(crafterPart: BasePart) {
        const tile = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(getLocalPosition(crafterPart.Position, this.gridBase))) as Crafter);
        crafterMenu.setTileEntity(tile as Crafter);
        
        crafterMenu.show();
        if (this.lastMenu) this.lastMenu.hide()
        this.lastMenu = crafterMenu;
    }

    public interarctWithGenerator(generatorPart: BasePart): void {
        const tile = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(getLocalPosition(generatorPart.Position, this.gridBase))) as Generator);
        generatorMenu.setTileEntity(tile as Generator);
        
        generatorMenu.show();
        if (this.lastMenu) this.lastMenu.hide()
        this.lastMenu = generatorMenu;
    }
}

export default InteractionHandler;