import { Players } from "@rbxts/services";
import { getTileEntityInformation } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { findBasepartByName } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import { PlacementHandler, placementType } from "ReplicatedStorage/Scripts/placementHandler";
import { getImage } from "./imageUtils";

class Hotbar {
    private hotbar;
    private currentSlot: number | undefined;

    constructor() {
        this.hotbar = new Array<HotbarSlot | undefined>(9);
        
        for (let i = 0; i < 9; i++) {
            this.hotbar[i] = new HotbarSlot(i+1);
        }
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
        this.hotbar[slot] = undefined;
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
    
    activatePlacingFromHotbar(index: number, placementHandler: PlacementHandler) {
        if (this.getSlot(index).isSlotEmpty()) return;
        if (this.currentSlot === index && placementHandler.placementStatus === placementType.PLACING) return placementHandler.resetMode();

        const slot = this.getSlot(index);
        const playerMoney = Players.LocalPlayer!.FindFirstChild("leaderstats")!.FindFirstChild("Money") as NumberValue
        placementHandler.activatePlacing(slot.getPart()!, slot.getPrice()!, playerMoney);
        this.currentSlot = index;
    }
}

const hotbarFrame = Players.LocalPlayer!.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("hotbar") as Frame;

class HotbarSlot {
    private slotFrame: Frame;

    private part: BasePart | undefined;
    private image: string | undefined;
    private price: number | undefined;

    constructor(index: number, tileName?: string) {
        this.slotFrame = hotbarFrame.WaitForChild(index) as Frame;
        if (tileName) {
            const info = getTileEntityInformation(tileName);

            this.part = findBasepartByName(info.name);
            this.image = info.image;
            this.price = info.price;
        }
        this.setupSlot();
    }

    setSlot(tileName: string) {
        const info = getTileEntityInformation(tileName);
        this.part = findBasepartByName(info.name);
        this.image = info.image;
        this.price = info.price;
        this.setupSlot();
    }

    public setupSlot() {
        if (!this.image) {
            (this.slotFrame.FindFirstChild("ImageButton") as ImageButton)!.Visible = false;
        } else {
            (this.slotFrame.FindFirstChild("ImageButton") as ImageButton)!.Visible = true;
            (this.slotFrame.FindFirstChild("ImageButton") as ImageButton)!.Image = this.getImage();
        }
    }

    public getPart(): BasePart | undefined {
        return this.part;
    }

    public getImage(): string {
        return getImage(this.image);
    }

    public isSlotEmpty(): boolean {
        return this.part === undefined;
    }

    public getPrice(): number | undefined {
        return this.price;
    }
}


export default Hotbar;
