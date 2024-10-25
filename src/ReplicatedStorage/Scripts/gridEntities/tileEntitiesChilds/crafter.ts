import Entity from "ReplicatedStorage/Scripts/Content/Entities/entity";
import { TileEntity } from "../tileEntity";
import { Component } from "ReplicatedStorage/Scripts/Content/Entities/component";
import Resource from "ReplicatedStorage/Scripts/Content/Entities/resource";
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
    resource = 0;
    craftedComponent = 0;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, 0, category, MAX_INPUTS, MAX_OUTPUTS);
    }

    tick(progress: number): void {
        if (this.getProgress(progress) < this.lastProgress) {
            if (!this.currentCraft) return;
            this.sendItemCrafted();
        };

        this.lastProgress = this.getProgress(progress);
    }

    private sendItemCrafted(): void {
        const craftedComponent = this.craft();
        if (this.outputTiles.isEmpty()) return;

        if (!craftedComponent) {
            if (this.craftedComponent === 0) return;
            this.craftedComponent--;
            this.craftedComponent += this.outputTiles[0].addEntity([this.currentCraft!.copy()]).size()
            return
        };

        const hasComponentBeenSend = this.outputTiles[0].addEntity([craftedComponent]).isEmpty();
        if (hasComponentBeenSend) this.craftedComponent--;
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        if (entities.isEmpty()) return entities;

        const entity = entities[0];
        if (!(entity instanceof Resource) && !(entity instanceof Component)) return entities;
        if (!this.isRessourceNeeded(entity)) return entities;

        this.resource++;

        return new Array<Entity>();
    }

    encode(): {} {
        return {
            "name": this.name,
            "category": this.category,
            "position": encodeVector3(this.position),
            "size": encodeVector2(this.size),
            "direction": encodeVector2(this.direction),
            "currentCraft": this.currentCraft?.name,
            "resource": this.resource,
            "craftedComponent": this.craftedComponent,
            "lastProgress": this.lastProgress,
            "inputTiles": this.inputTiles.map((tile) => encodeVector3(tile.position)),
            "outputTiles": this.outputTiles.map((tile) => encodeVector3(tile.position)),
        }
    }

    static decode(decoded: unknown): Crafter {
        const data = decoded as { name: string, category: string, position: { x: number, y: number, z: number }, size: { x: number, y: number }, direction: { x: number, y: number }, resource: number, craftedComponent: number, currentCraft: string, lastProgress: number, inputTiles: Array<{ x: number, y: number, z: number }>, outputTiles: Array<{ x: number, y: number, z: number }> };
        const crafter = new Crafter(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), 1);
        if (data.currentCraft) crafter.setCraft(getComponent(data.currentCraft) as Component);
        crafter.resource = data.resource;
        crafter.craftedComponent = data.craftedComponent;
        crafter.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        crafter.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        crafter.lastProgress = data.lastProgress;
        return crafter;
    }

    updateShape(gridBase: BasePart): void {
        return;
    }

    getNewShape(): BasePart | undefined {
        return;
    }

    public setCraft(craft: Component) {
        this.currentCraft = craft;
        this.speed = craft.speed
        this.craftedComponent = 0;
        this.resource = 0;
    }

    private isRessourceNeeded(ressource: Entity): boolean {
        if (!this.currentCraft) return false;
        for (const [_resource] of this.currentCraft.buildRessources) {
            if (string.lower(ressource.name) === string.lower((_resource as Resource).name)) return true;
        }
        return false;
    }

    private canCraft(): boolean {
        if (!this.currentCraft) return false;
        const [ressource] = this.currentCraft.buildRessources
        return this.resource >= ressource[1]
    }

    private craft(): Component | undefined {
        if (!this.currentCraft) return;
        if (!this.canCraft()) return;
        const [resource] = this.currentCraft.buildRessources
        this.resource -= resource[1];
        this.craftedComponent++;
        return (this.currentCraft as Component).copy();
    }
}

export default Crafter;