import { GuiService, Players, UserInputService } from "@rbxts/services";
import { TileEntity } from "ReplicatedStorage/Scripts/TileEntities/tileEntity";

/**
 * this interface should be used for every menu of interaction with a tileEntity
 */
export interface Menu {
    player: Player;
    menu: Frame;
    tileEntity: TileEntity | undefined;

    setTileEntity(tile: TileEntity): void;
    setupMenu(): void;
    show(): void;
    hide(): void;
    isVisible(): boolean;
    getMenu(): Frame;
}

export function isMouseInMenu(menu: Frame): boolean {
    const mousePos = UserInputService.GetMouseLocation();
    const menuPos = menu.AbsolutePosition;
    const menuSize = menu.AbsoluteSize;
    const topBarOffset = GuiService.GetGuiInset()[0].Y

    // Check if mouse position is within the menu's bounds
    return (
        mousePos.X >= menuPos.X &&
        mousePos.X <= menuPos.X + menuSize.X &&
        mousePos.Y >= menuPos.Y + topBarOffset &&
        mousePos.Y <= menuPos.Y + menuSize.Y + topBarOffset
    );
}
