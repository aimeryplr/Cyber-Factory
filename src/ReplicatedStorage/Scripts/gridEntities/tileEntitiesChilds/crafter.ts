import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import Component from "ReplicatedStorage/Scripts/Content/Entities/component";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";
import { getComponent } from "ReplicatedStorage/Scripts/Content/Entities/entityUtils";

// Settings
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 1;
const MAX_CAPACITY = 20;
const category: string = "crafter";

class Crafter extends TileEntity {
    // mettre type component
    currentCraft: Component | undefined;
    ressources = new Array<Ressource | Component>(MAX_CAPACITY);

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, speed, category, MAX_INPUTS, MAX_OUTPUTS);
        this.setCraft(getComponent("Iron Plate"));
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
        if (entities.isEmpty()) return entities;
        
        const entity = entities[0];
        if (!(entity instanceof Ressource) && !(entity instanceof Component)) return entities;
        if (!this.isRessourceNeeded(entity)) return entities;

        return new Array<Entity>();
    }

    updateShape(gridBase: BasePart): void {
        return;
    }

    private setCraft(craft: Component) {
        this.currentCraft = craft;
        this.speed = craft.speed
    }

    private isRessourceNeeded(ressource: Entity): boolean {
        if (!this.currentCraft) return false;
        for (const [_ressource, quantity] of this.currentCraft.buildRessources) {
            if (ressource.name === (_ressource as Entity).name) return true;
        }
        return false;
    }

    private canCraft(): boolean {
        if (!this.currentCraft) return false;
        for (const [ressource, quantity] of this.currentCraft.buildRessources) {
            if (this.ressources.size() >= (quantity as number)) return true
        }
        return false;
    }

    private craft(): Component | undefined {
        if (!this.currentCraft) return;
        for (const [ressource, quantity] of this.currentCraft.buildRessources) {
            if (this.ressources.size() < (quantity as number)) return;
            for (let i = (quantity as number) - 1; i >= 0; i--) {
                this.ressources.pop();
            }
        }
        return this.currentCraft;
    }
}

export default Crafter;