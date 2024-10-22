import { TileEntity } from "ReplicatedStorage/Scripts/gridEntities/tileEntity";

/**
 * this interface should be used for every menu of interaction with a tileEntity
 */
interface InteractionMenu {
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

export default InteractionMenu;