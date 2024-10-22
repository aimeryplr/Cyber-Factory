enum RessourceType {
    Plastic = "Plastic",
    Copper = "Copper",
    Iron = "Iron",
}

function getRessourceFromString(name: string): RessourceType {
    switch (string.lower(name)) {
        case "plastic":
            return RessourceType.Plastic;
        case "copper":
            return RessourceType.Copper;
        case "iron":
            return RessourceType.Iron;
    }
    error("Unknown ressource type: " + name);
}

function getImageFromRessourceType(ressourceType: RessourceType): string {
    switch (ressourceType) {
        case RessourceType.Plastic:
            return "rbxasset://textures/ui/GuiImagePlaceholder.png";
        case RessourceType.Copper:
            return "rbxasset://textures/ui/GuiImagePlaceholder.png";
        case RessourceType.Iron:
            return "rbxasset://textures/ui/GuiImagePlaceholder.png";
    }
}

export {RessourceType, getRessourceFromString, getImageFromRessourceType};