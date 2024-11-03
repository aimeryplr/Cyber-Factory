import { Entity } from "ReplicatedStorage/Scripts/Entities/entity";

const imageUrl = "rbxassetid://"
const placeholder = "rbxasset://textures/ui/GuiImagePlaceholder.png"

export const getImage = (entity: Entity | string | undefined): string => {
    if (!entity) return placeholder;

    if (typeIs(entity, "string")) {
        return imageUrl + entity;
    }

    return !entity.img ? placeholder : imageUrl + entity.img;
}