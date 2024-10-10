enum RessourceType {
    Plastic = "PLASTIC",
    Copper = "COPPER",
    Iron = "IRON",
}

function getRessourceFromString(name: string): RessourceType {
    switch (name) {
        case "PLASTIC":
            return RessourceType.Plastic;
        case "COPPER":
            return RessourceType.Copper;
        case "IRON":
            return RessourceType.Iron;
    }
    error("Unknown ressource type: " + name);
}

export {RessourceType, getRessourceFromString};