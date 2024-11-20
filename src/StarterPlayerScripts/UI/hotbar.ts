import { Players, TweenService, Workspace } from "@rbxts/services";
import { getTileEntityInformation } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { findBasepartByName } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import { PlacementHandler, placementType } from "ReplicatedStorage/Scripts/placementHandler";
import { getImage } from "./imageUtils";
import { BLUE, GRAY } from "ReplicatedStorage/parameters";
import { TileGrid } from "ReplicatedStorage/Scripts/gridTile";
import Generator from "ReplicatedStorage/Scripts/gridEntities/tileEntitiesChilds/generator";
import { getPlacedGenerator } from "ReplicatedStorage/Scripts/gridTileUtils";
import { formatCompact } from "ReplicatedStorage/Scripts/Utils/numberFormat";

const hotbarFrame = Players.LocalPlayer!.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("hotbar") as Frame;

const TRANSPARENCE_TIME = 0.8;

export class Hotbar {
    private hotbar;
    private placementHandler: PlacementHandler;
    private tileGrid: TileGrid | undefined;

    private currentSlot: number | undefined;
    private itemName = hotbarFrame.WaitForChild("itemName") as itemName;
    private tweenCoroutine: thread | undefined;

    constructor(placementHandler: PlacementHandler) {
        this.hotbar = new Array<HotbarSlot>(9);
        this.placementHandler = placementHandler;

        for (let i = 0; i < 9; i++) {
            this.hotbar[i] = new HotbarSlot(i + 1);
            (this.getSlot(i).getSlotFrame().FindFirstChild("ImageButton") as ImageButton)!.MouseButton1Click.Connect(() => {
                this.activatePlacingFromHotbar(i, this.placementHandler);
            });
        }
    }

    setTileGrid(tileGrid: TileGrid) {
        this.tileGrid = tileGrid;
    }

    public getSlot(slotIndex: number): HotbarSlot {
        const slot = this.hotbar[slotIndex];
        assert(slot, "No part found in hotbar");
        return slot;
    }

    public setSlot(slot: number, name: string) {
        this.hotbar[slot]!.setSlot(name);
    }

    public removeSlot(slot: number) {
        this.hotbar[slot].resetSlot();
    }

    // find an empty slot and set the slot to the name
    addSlotFromName(name: string) {
        for (let i = 0; i < 9; i++) {
            if (this.hotbar[i]!.isSlotEmpty()) {
                this.setSlotFromName(i, name);
                return;
            }
        }
    }

    setSlotFromName(slot: number, name: string) {
        this.hotbar[slot]?.setSlot(name);
    }

    getHotbarPart(index: number): BasePart | undefined {
        const slot = this.getSlot(index);
        return slot.getPart();
    }

    getHotbarImage(index: number): string {
        const slot = this.getSlot(index);
        return slot.getImage();
    }

    deselectAllSlots() {
        for (let i = 0; i < 9; i++) {
            this.getSlot(i).deselectSlot();
        }
    }

    activatePlacingFromHotbar(index: number, placementHandler: PlacementHandler) {
        this.deselectAllSlots()
        if (this.getSlot(index).isSlotEmpty()) return placementHandler.resetMode();
        if (this.currentSlot === index && placementHandler.placementStatus === placementType.PLACING) return placementHandler.resetMode();

        this.showItemName(index);
        const slot = this.getSlot(index);
        slot.selectSlot();

        const playerMoney = Players.LocalPlayer!.FindFirstChild("leaderstats")!.FindFirstChild("Money") as NumberValue
        placementHandler.activatePlacing(slot.getPart()!, slot.getPrice(this.tileGrid)!, playerMoney);
        this.currentSlot = index;
    }

    tilePlaced() {
        if (this.currentSlot === undefined) return;
        if (this.placementHandler.placementStatus !== placementType.PLACING) return

        if (getTileEntityInformation(this.getSlot(this.currentSlot).getPart()!.Name).category === "generator") this.showItemName(this.currentSlot);
    }

    showItemName(index: number) {
        if (this.tweenCoroutine && coroutine.status(this.tweenCoroutine) === "suspended") {
            coroutine.close(this.tweenCoroutine)
        }
        this.itemName["1itemName"].Text = getShowingNameFromPartName(this.getSlot(index).getPart()!.Name);
        this.itemName["2price"].TextLabel.Text = formatCompact(this.getSlot(index).getPrice(this.tileGrid)!);

        this.itemName["1itemName"].TextTransparency = 0;
        this.itemName.UIStroke.Transparency = 0;
        this.itemName.BackgroundTransparency = 0;
        this.itemName["2price"].TextLabel.TextTransparency = 0;
        this.itemName["2price"].ImageLabel.ImageTransparency = 0;

        this.tweenCoroutine = coroutine.create(() => {
            const FPS = 1 / 60
            wait(1);
            while (this.itemName["1itemName"].TextTransparency < 1) {
                wait(FPS);
                this.itemName["1itemName"].TextTransparency += FPS * (1 / TRANSPARENCE_TIME);
                this.itemName.UIStroke.Transparency += FPS * (1 / TRANSPARENCE_TIME);
                this.itemName.BackgroundTransparency += FPS * (1 / TRANSPARENCE_TIME);
                this.itemName["2price"].TextLabel.TextTransparency += FPS * (1 / TRANSPARENCE_TIME);
                this.itemName["2price"].ImageLabel.ImageTransparency += FPS * (1 / TRANSPARENCE_TIME);
            }
            this.itemName["1itemName"].TextTransparency = 1;
            this.itemName.UIStroke.Transparency = 1;
            this.itemName.BackgroundTransparency = 1;
            this.itemName["2price"].TextLabel.TextTransparency = 1;
            this.itemName["2price"].ImageLabel.ImageTransparency = 1;
        })
        coroutine.resume(this.tweenCoroutine);
    }
}

class HotbarSlot {
    private slotFrame: Frame;

    private info: {
        name: string;
        category: string;
        tier: number;
        price: number;
        speed: number;
        image: string;
    } | undefined;

    private part: BasePart | undefined;

    constructor(index: number, tileName?: string) {
        this.slotFrame = hotbarFrame.WaitForChild("slots")!.WaitForChild(index)! as Frame;
        if (tileName) {
            this.info = getTileEntityInformation(tileName);
            this.part = findBasepartByName(this.info.name);
        }

        this.setupSlot();
    }

    setSlot(tileName: string) {
        this.info = getTileEntityInformation(tileName);
        this.part = findBasepartByName(this.info.name);
        this.setupSlot();
    }

    // Function to move the selected slot up or deselect it
    selectSlot() {
        const stroke = (this.slotFrame.FindFirstChild("UIStroke") as UIStroke)!
        stroke.Color = BLUE;
    };

    deselectSlot() {
        (this.slotFrame.FindFirstChild("UIStroke") as UIStroke)!.Color = GRAY;
    }

    public setupSlot() {
        if (!this.info || !this.info!.image) {
            (this.slotFrame.FindFirstChild("ImageButton") as ImageButton)!.Visible = false;
        } else {
            (this.slotFrame.FindFirstChild("ImageButton") as ImageButton)!.Visible = true;
            (this.slotFrame.FindFirstChild("ImageButton") as ImageButton)!.Image = this.getImage();
        }
    }

    public resetSlot() {
        this.part = undefined;
        this.info = undefined;
        this.setupSlot();
    }

    public getPart(): BasePart | undefined {
        return this.part;
    }

    public getImage(): string {
        return getImage(this.info!.image);
    }

    public isSlotEmpty(): boolean {
        return this.part === undefined;
    }

    public getPrice(tileGrid?: TileGrid): number {
        if (!tileGrid) return this.info!.price;
        if (!this.info) return 0;

        return this.info!.category === "generator" ? Generator.getPrice(getPlacedGenerator(tileGrid)) : this.info!.price;
    }

    public getSlotFrame(): Frame {
        return this.slotFrame;
    }
}

export function getShowingNameFromPartName(name: string): string {
    let nameParts = name.split("_");
    if (nameParts.size() === 1) {
        return nameParts[0].sub(1, 1).upper() + nameParts[0].sub(2).lower()
    } else {
        nameParts[1] = nameParts[1].upper();
        nameParts[0] = nameParts[0].sub(1, 1).upper() + nameParts[0].sub(2).lower();
        return nameParts.join(" ");
    };
}