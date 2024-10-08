import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import RessourceType from "ReplicatedStorage/Scripts/Content/Entities/ressourceEnum";
import Component from "ReplicatedStorage/Scripts/Content/Entities/component";

// Settings
const MAX_INPUTS = 3;
const MAX_OUTPUTS = 1;
const MAX_CAPACITY = 20;
const category: string = "crafter";

class Crafter extends TileEntity {
    // mettre type component
    currentCraft: Component | undefined;
    ressources = new Array<RessourceType | Component>();

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
    }

    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            if (!this.currentCraft) return;

            if (this.canCraft()) {
                this.outputTiles[0].addEntity([this.craft()]);
            }
        };
        
        this.lastProgress = this.getProgress(progress);
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        if (!entities[0]) return entities;
        
        const entity = entities[0];
        if (!(entity instanceof RessourceType)) return entities;
        if (!this.isRessourceNeeded(entity.ressourceType)) return entities;


        return new Array<Entity>();
    }

    updateShape(gridBase: BasePart): void {
        return;
    }

    private setCraft(craft: Component) {
        this.currentCraft = craft;
    }

    private isRessourceNeeded(ressourceType: RessourceType | Component): boolean {
        if (!this.currentCraft) return false;
        const [ressource, quantity] = this.currentCraft.buildRessources
        if (ressourceType === (ressource as RessourceType | Component)) return true;
        return false;
    }

    private canCraft(): boolean {
        if (!this.currentCraft) return false;
        const [ressource, quantity] = this.currentCraft.buildRessources
        if (this.ressources.size() >= (quantity as number)) return true
        return false;
    }

    private craft(): Component | undefined {
        if (!this.currentCraft) return;
        const [ressource, quantity] = this.currentCraft.buildRessources
        for (let i = (quantity as number) - 1; i >= 0; i--) {
            this.ressources.pop();
        }
        return this.currentCraft;
    }
}

export default Crafter;