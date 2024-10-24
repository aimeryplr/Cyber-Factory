enum RessourceType {
    Polymer = "Plastic",
    Copper = "Copper",
    Carbon = "Iron",
}

function getRessourceFromString(name: string): RessourceType {
    switch (string.lower(name)) {
        case "polymer":
            return RessourceType.Polymer;
        case "copper":
            return RessourceType.Copper;
        case "carbon":
            return RessourceType.Carbon;
    }
    error("Unknown ressource type: " + name);
}

function getImageFromRessourceType(ressourceType: RessourceType): string {
    switch (ressourceType) {
        case RessourceType.Polymer:
            return "rbxasset://textures/ui/GuiImagePlaceholder.png";
        case RessourceType.Copper:
            return "rbxasset://textures/ui/GuiImagePlaceholder.png";
        case RessourceType.Carbon:
            return "rbxasset://textures/ui/GuiImagePlaceholder.png";
    }
}

export { RessourceType, getRessourceFromString, getImageFromRessourceType };