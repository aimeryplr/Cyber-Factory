import Entity from "ServerScriptService/Contents/Entities/entities";
import Ressource from "ServerScriptService/Contents/Entities/ressource";
import RessourceType from "ServerScriptService/Contents/Entities/ressourceEnum";

// store and give all the entities
class EntityProvider {
    ressources: Array<Ressource> = setupRessources();
}

// store every ressources
function setupRessources(): Array<Ressource> {
    let ressources = new Array<Ressource>();
    ressources.push(new Ressource(RessourceType.Plastic, 5))
    ressources.push(new Ressource(RessourceType.Copper, 10))
    ressources.push(new Ressource(RessourceType.Gold, 15))
    return ressources
}
