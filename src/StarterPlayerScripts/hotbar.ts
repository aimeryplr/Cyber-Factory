import { getGridEntityInformation } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { findBasepartByName } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import { PlacementHandler } from "ReplicatedStorage/Scripts/placementHandler";

class Hotbar {
    private hotbar;

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
        const info = getGridEntityInformation(name);
        const part = findBasepartByName(info.name);
        this.hotbar[slot] = new HotbarSlot(part, info.image);
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

        const part = this.getHotbarPart(index);
        placementHandler.activatePlacing(part);
    }
}

class HotbarSlot {
    private part: BasePart;
    private image: string;

    constructor(part: BasePart, image: string) {
        this.part = part;
        this.image = image;
    }

    public getPart(): BasePart {
        return this.part;
    }

    public getImage(): string {
        return this.image;
    }
}


export default Hotbar;
