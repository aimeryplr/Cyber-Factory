import { Players, TweenService } from "@rbxts/services";
import { getTileEntityInformation } from "ReplicatedStorage/Scripts/gridEntities/tileEntityProvider";
import { findBasepartByName } from "ReplicatedStorage/Scripts/gridEntities/tileEntityUtils";
import { PlacementHandler, placementType } from "ReplicatedStorage/Scripts/placementHandler";
import { getImage } from "./imageUtils";

const hotbarFrame = Players.LocalPlayer!.WaitForChild("PlayerGui")!.WaitForChild("ScreenGui")!.WaitForChild("hotbar") as Frame;

const TRANSPARENCE_TIME = 0.8;

export class Hotbar {
    private hotbar;
    private currentSlot: number | undefined;
    private itemName = hotbarFrame.WaitForChild("itemName") as itemName;
    private tweenCoroutine: thread | undefined;

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
        if (this.getSlot(index).isSlotEmpty()) return placementHandler.resetMode();
        if (this.currentSlot === index && placementHandler.placementStatus === placementType.PLACING) return placementHandler.resetMode();

        this.showItemName(index);
        const slot = this.getSlot(index);
        const playerMoney = Players.LocalPlayer!.FindFirstChild("leaderstats")!.FindFirstChild("Money") as NumberValue
        placementHandler.activatePlacing(slot.getPart()!, slot.getPrice()!, playerMoney);
        this.currentSlot = index;
    }

    showItemName(index: number) {
        if (this.tweenCoroutine && coroutine.status(this.tweenCoroutine) === "suspended") {
            coroutine.close(this.tweenCoroutine)
        }
        this.itemName.itemName.Text = getShowingNameFromPartName(this.getSlot(index).getPart()!.Name);
        this.itemName.itemName.Transparency = 0;
        this.itemName.UIStroke.Transparency = 0;

        this.tweenCoroutine = coroutine.create(() => {
            const FPS = 1/60
            wait(1);
            while (this.itemName.itemName.Transparency < 1) {
                wait(FPS);
                this.itemName.itemName.Transparency += FPS * (1 / TRANSPARENCE_TIME);
                this.itemName.UIStroke.Transparency += FPS * (1 / TRANSPARENCE_TIME);
                
            }
            this.itemName.itemName.Transparency = 1;
            this.itemName.UIStroke.Transparency = 1;
        })
        coroutine.resume(this.tweenCoroutine);
    }
}

class HotbarSlot {
    private slotFrame: Frame;

    private part: BasePart | undefined;
    private image: string | undefined;
    private price: number | undefined;

    constructor(index: number, tileName?: string) {
        this.slotFrame = hotbarFrame.WaitForChild("slots")!.WaitForChild(index)! as Frame;
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