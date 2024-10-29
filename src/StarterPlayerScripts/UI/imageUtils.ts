import { Entity } from "ReplicatedStorage/Scripts/Entities/entity";

const imageUrl = "rbxassetid://"
const placeholder = "rbxasset://textures/ui/GuiImagePlaceholder.png"

export const getImage = (entity: Entity | undefined): string => {
    if (!entity) return placeholder;

    return !entity.img ? placeholder : imageUrl + entity.img;
}