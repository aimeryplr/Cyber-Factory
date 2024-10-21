import { Players } from "@rbxts/services";
import { getTileEntityInformation } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { findBasepartByName } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import { PlacementHandler, placementType } from "ReplicatedStorage/Scripts/placementHandler";

class Hotbar {
    private hotbar;
    private currentSlot: number | undefined;

    constructor() {
        this.hotbar = new Array<HotbarSlot | undefined>(9);
    }

    public getSlot(slotIndex: number): HotbarSlot {
        const slot = this.hotbar[slotIndex];
        assert(slot, "No part found in hotbar");
        return slot;
    }

    public setSlot(slot: number, part: BasePart, image: string) {
        this.hotbar[slot] = new HotbarSlot(part, image);
    }

    public removeSlot(slot: number) {
        this.hotbar[slot] = undefined;
    }

    public isSlotEmpty(slot: number): boolean {
        return this.hotbar[slot] === undefined;
    }

    setSlotFromName(slot: number, name: string) {
        const info = getTileEntityInformation(name);
        const part = findBasepartByName(info.name);
        this.hotbar[slot] = new HotbarSlot(part, info.image, info.price);
    }

    getHotbarPart(index: number): BasePart {
        const slot = this.getSlot(index);
        return slot.getPart();
    }

    getHotbarImage(index: number): string {
        const slot = this.getSlot(index);
        return slot.getImage();
    }
    
    activatePlacingFromHotbar(index: number, placementHandler: PlacementHandler) {
        if (this.isSlotEmpty(index)) return;
        if (this.currentSlot === index && placementHandler.placementStatus === placementType.PLACING) return placementHandler.resetMode();

        const slot = this.getSlot(index);
        const playerMoney = Players.LocalPlayer!.FindFirstChild("leaderstats")!.FindFirstChild("Money") as NumberValue
        placementHandler.activatePlacing(slot.getPart(), slot.getPrice(), playerMoney);
        this.currentSlot = index;
    }
}

class HotbarSlot {
    private part: BasePart;
    private image: string;
    private price: number;

    constructor(part: BasePart, image: string, price: number = 0) {
        this.part = part;
        this.image = image;
        this.price = price;
    }

    public getPart(): BasePart {
        return this.part;
    }

    public getImage(): string {
        return this.image;
    }

    public getPrice(): number {
        return this.price;
    }
}


export default Hotbar;
