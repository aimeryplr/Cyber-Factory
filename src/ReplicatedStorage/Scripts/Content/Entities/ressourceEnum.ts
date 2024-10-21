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

export {RessourceType, getRessourceFromString};