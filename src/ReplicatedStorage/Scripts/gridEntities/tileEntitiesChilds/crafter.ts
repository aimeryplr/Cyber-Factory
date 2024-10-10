import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import Component from "ReplicatedStorage/Scripts/Content/Entities/component";
import Ressource from "ReplicatedStorage/Scripts/Content/Entities/ressource";
import { decodeVector2, decodeVector3, decodeVector3Array, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/encoding";
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
        super(name, position, size, direction, 0, category, MAX_INPUTS, MAX_OUTPUTS);
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

        this.ressources.push(entity);

        return new Array<Entity>();
    }

    encode(): {} {
        return {
            "name": this.name,
            "category": this.category,
            "position": encodeVector3(this.position),
            "size": encodeVector2(this.size),
            "direction": encodeVector2(this.direction),
            "inputTiles": this.inputTiles.map((tile) => encodeVector3(tile.position)),
            "outputTiles": this.outputTiles.map((tile) => encodeVector3(tile.position)),
            "currentCraft": this.currentCraft?.name
        }
    }

    static decode(decoded: unknown): Crafter {
        const data = decoded as {name: string, position: {x: number, y: number, z: number}, size: {x: number, y: number}, direction: {x: number, y: number}, inputTiles: Array<{x: number, y: number, z: number}>, outputTiles: Array<{x: number, y: number, z: number}>, currentCraft: string};
        const crafter = new Crafter(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), 1);
        crafter.currentCraft = getComponent(data.currentCraft);
        crafter.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        crafter.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        return crafter;
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
            if (this.ressources.size() >= quantity) return true
        }
        return false;
    }

    private craft(): Component | undefined {
        if (!this.currentCraft) return;
        if (!this.canCraft()) return;
        for (const [ressource, quantity] of this.currentCraft.buildRessources) {
            for (let i = quantity - 1; i >= 0; i--) {
                this.ressources.pop();
            }
        }
        return (this.currentCraft as Component).copy();
    }
}

export default Crafter;