enum ResourceType {
    Polymer = "Plastic",
    Copper = "Copper",
    Carbon = "Carbon",
}

function getResourceFromString(name: string): ResourceType {
    switch (string.lower(name)) {
        case "polymer":
            return ResourceType.Polymer;
        case "copper":
            return ResourceType.Copper;
        case "carbon":
            return ResourceType.Carbon;
    }
    error("Unknown ressource type: " + name);
}

function getImageFromResourceType(ressourceType: ResourceType): string {
    switch (ressourceType) {
        case ResourceType.Polymer:
            return "rbxasset://textures/ui/GuiImagePlaceholder.png";
        case ResourceType.Copper:
            return "rbxasset://textures/ui/GuiImagePlaceholder.png";
        case ResourceType.Carbon:
            return "rbxasset://textures/ui/GuiImagePlaceholder.png";
    }
}

export { ResourceType, getResourceFromString, getImageFromResourceType };