import RessourceType from "./ressourceEnum";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";

// Déclaration des variables de ressource
const copperResource = new Ressource("Copper", RessourceType.Copper);
const goldResource = new Ressource("Gold", RessourceType.Gold);
const plasticResource = new Ressource("Plastic", RessourceType.Plastic);

const componentsList: Map<string, Map<string, { name: string, speed: number, category: string, tier: number, buildRessources: Map<Ressource, number> }>> = new Map([]);

export default componentsList;