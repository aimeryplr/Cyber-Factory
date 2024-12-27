import { HttpService, Players, ReplicatedStorage, RunService, UserInputService } from "@rbxts/services";
import { getTileInformation } from "ReplicatedStorage/Scripts/Tile/TileEntities/tileEntityProvider";
import { decodeTile } from "ReplicatedStorage/Scripts/TileGrid/tileGridUtils";
import { getTileFromRay, PlacementHandler, placementType } from "ReplicatedStorage/Scripts/PlacementHandler/placementHandler";
import Generator from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/generator";
import GeneratorMenu from "./Menu/generatorMenu";
import { getLocalPosition } from "ReplicatedStorage/Scripts/Tile/TileEntities/Utils/tileEntityUtils";
import Crafter from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/crafter";
import CrafterMenu from "./Menu/crafterMenu";
import Assembler from "ReplicatedStorage/Scripts/Tile/TileEntities/Machines/assembler";
import AssemblerMenu from "./Menu/assemblerMenu";
import { QuestBoard } from "./Menu/questsBord";
import { Hotbar } from "./Menu/hotbar";
import { DEFAULT_HOTBAR, DESTROY_MODE_KEY, ROTATE_KEY, TERMINATE_KEY } from "ReplicatedStorage/constants";
import { isMouseInMenu, Menu } from "./Menu/menu";
import { TileGrid } from "ReplicatedStorage/Scripts/TileGrid/tileGrid";
import CounterUpdater from "./Menu/counterUpdater";
import { Quest } from "ReplicatedStorage/Scripts/Quests/quest";
import { playSoundEffectWithoutStopping } from "ReplicatedStorage/Scripts/Utils/playSound";

const getTileRemoteFunction = ReplicatedStorage.WaitForChild("Events").WaitForChild("getTile") as RemoteFunction;
const unlockedTileListEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("unlockedTileList") as RemoteEvent;
const sendTileGrid = ReplicatedStorage.WaitForChild("Events").WaitForChild("sendTileGrid") as RemoteEvent;
const questCompletedEvent = ReplicatedStorage.WaitForChild("Events").WaitForChild("questCompleted") as RemoteEvent;

const hotBarKeyBinds = [Enum.KeyCode.One, Enum.KeyCode.Two, Enum.KeyCode.Three, Enum.KeyCode.Four, Enum.KeyCode.Five, Enum.KeyCode.Six, Enum.KeyCode.Seven, Enum.KeyCode.Eight, Enum.KeyCode.Nine];

const screenGui = Players.LocalPlayer!.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui") as ScreenGui;

class InteractionHandler {
    private gridBase: BasePart;
    private placementHandler: PlacementHandler;

    private questBoard = new QuestBoard(Players.LocalPlayer);
    private counterUpdater = new CounterUpdater();
    private generatorMenu;
    private crafterMenu;
    private assemblerMenu;
    private hotbar: Hotbar;

    private tileGrid: TileGrid | undefined;

    private lastMenu: Menu | undefined;

    constructor(gridBase: BasePart) {
        this.gridBase = gridBase;
        this.generatorMenu = new GeneratorMenu(Players.LocalPlayer, gridBase);
        this.crafterMenu = new CrafterMenu(Players.LocalPlayer, gridBase);
        this.assemblerMenu = new AssemblerMenu(Players.LocalPlayer, gridBase);
        this.placementHandler = new PlacementHandler(gridBase);
        this.hotbar = new Hotbar(this.placementHandler);
        this.setupHotbar();

        UserInputService.InputBegan.Connect((input: InputObject, gameProcessed: boolean) => this.handleInputs(input, gameProcessed));
        RunService.Heartbeat.Connect(() => {
            this.handleInputs(undefined, false)
        })
        unlockedTileListEvent.OnClientEvent.Connect((tiles: string[]) => this.setUnlockedTiles(tiles));
        sendTileGrid.OnClientEvent.Connect((tileGrid: string) => {
            this.tileGrid = TileGrid.decode(tileGrid, gridBase)
            this.placementHandler.setTileGrid(this.tileGrid);
            this.hotbar.setTileGrid(this.tileGrid);
        });
    }

    setUnlockedTiles(tiles: string[]): any {
        for (const tile of tiles) {
            if (!DEFAULT_HOTBAR.get(tile)) continue;

            this.hotbar.setSlotFromName(DEFAULT_HOTBAR.get(tile)!, tile);
        }
    }

    setupHotbar() {
        this.hotbar.setSlotFromName(0, "conveyor");
        this.hotbar.setSlotFromName(1, "generator");
        this.hotbar.setSlotFromName(2, "seller");
        this.hotbar.setSlotFromName(3, "splitter");
        this.hotbar.setSlotFromName(4, "merger");
        this.hotbar.setSlotFromName(7, "underground conveyer");
        this.hotbar.setSlotFromName(8, "electric pole");
    }

    handleInputs(input: InputObject | undefined, gameProcessed: boolean) {
        if (gameProcessed) return;
        if (!this.placementHandler) return;

        if (input && input.UserInputType === TERMINATE_KEY) {
            this.placementHandler.isClicking = false;
            if (this.placementHandler.placementStatus === placementType.INTERACTING) this.interact();
        } else if (UserInputService.GetMouseButtonsPressed()[0] && UserInputService.GetMouseButtonsPressed()[0].UserInputType === TERMINATE_KEY && this.placementHandler.placementStatus !== placementType.INTERACTING) {
            if (isMouseInMenu(screenGui.FindFirstChild("hotbar") as Frame)) return;
            this.placementHandler.destroyObject();
            this.placementHandler.placeObject();
            this.placementHandler.isClicking = true;
            this.hotbar.tilePlaced()
        }


        if (!input) return;
        if (input.KeyCode === ROTATE_KEY) {
            this.placementHandler.rotate();
        }
        if (input.KeyCode === DESTROY_MODE_KEY) {
            this.hotbar.deselectAllSlots();
            this.placementHandler.activateDestroying();
        }

        for (let i = 0; i < hotBarKeyBinds.size(); i++) {
            if (input.KeyCode === hotBarKeyBinds[i]) {
                this.hotbar.activatePlacingFromHotbar(i, this.placementHandler);
            }
        }
    }

    public interact(): void {
        if (this.lastMenu && this.lastMenu.isVisible()) {
            if (!isMouseInMenu(this.lastMenu.getMenu())) {
                this.lastMenu.hide();
                return;
            };
        }

        const tilePart = getTileFromRay(this.gridBase);
        if (!tilePart) return;

        if (this.lastMenu && this.lastMenu.tileEntity?.position === getLocalPosition(tilePart.Position, this.gridBase)) {
            this.lastMenu.show();
            return;
        }


        const partInfo = getTileInformation(tilePart.Name);

        switch (partInfo.category) {
            case "generator":
                this.interarctWithGenerator(tilePart);
                break;
            case "crafter":
                this.interactWithCrafter(tilePart);
                break;
            case "assembler":
                this.interactWithAssembler(tilePart);
                break;
        }
    }

    public interactWithCrafter(crafterPart: BasePart) {
        const tile = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(getLocalPosition(crafterPart.Position, this.gridBase))) as Crafter, this.gridBase);
        this.crafterMenu.setTileEntity(tile as Crafter);

        this.crafterMenu.show();
        this.lastMenu = this.crafterMenu;
    }

    public interactWithAssembler(assemblerPart: BasePart) {
        const tile = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(getLocalPosition(assemblerPart.Position, this.gridBase))), this.gridBase) as Assembler;
        this.assemblerMenu.setTileEntity(tile);

        this.assemblerMenu.show();
        this.lastMenu = this.assemblerMenu;
    }

    public interarctWithGenerator(generatorPart: BasePart): void {
        const tile = decodeTile(HttpService.JSONDecode(getTileRemoteFunction.InvokeServer(getLocalPosition(generatorPart.Position, this.gridBase))) as Generator, this.gridBase);
        this.generatorMenu.setTileEntity(tile as Generator);

        this.generatorMenu.show();
        this.lastMenu = this.generatorMenu;
    }
}

questCompletedEvent.OnClientEvent.Connect((quest: Quest) => {
    const questCompletedSound = ReplicatedStorage.WaitForChild("Sounds").WaitForChild("SFX").WaitForChild("questCompleted") as Sound;
    playSoundEffectWithoutStopping(questCompletedSound);
})

export default InteractionHandler;