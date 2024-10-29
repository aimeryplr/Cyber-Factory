import { Component, Entity, EntityType } from "ReplicatedStorage/Scripts/Entities/entity";
import { TileEntity } from "../tileEntity";
import { decodeMap, decodeVector2, decodeVector3, decodeVector3Array, encodeVector2, encodeVector3 } from "ReplicatedStorage/Scripts/encoding";
import { entitiesList } from "ReplicatedStorage/Scripts/Entities/EntitiesList";

// Settings
const MAX_INPUTS = 1;
const MAX_OUTPUTS = 1;
const MAX_CAPACITY = 20;
const category: string = "assembler";

class Assembler extends TileEntity {
    // mettre type component
    currentCraft: Component | undefined;
    resource = new Map<string, number>();
    craftedComponent = 0;

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, speed: number) {
        super(name, position, size, direction, 0, category, MAX_INPUTS, MAX_OUTPUTS);
    }

    initResources() {
        if (!this.currentCraft) return

        for (const [comp, quantity] of this.currentCraft.buildRessources) {
            this.resource.set(string.lower(comp), 0);
        }
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
            this.craftedComponent += this.outputTiles[0].addEntity([table.clone(this.currentCraft!)]).size()
            return
        };

        const hasComponentBeenSend = this.outputTiles[0].addEntity([craftedComponent]).isEmpty();
        if (hasComponentBeenSend) this.craftedComponent--;
    }

    addEntity(entities: Array<Entity>): Array<Entity> {
        if (entities.isEmpty()) return entities;
        const entity = entities[0];

        if (!entity) return entities;
        if (!this.resource || !this.resource.has(string.lower(entity.name))) return entities;

        if (this.resource.get(string.lower(entity.name))! >= MAX_CAPACITY) return entities;
        if (!this.isRessourceNeeded(entity)) return entities;

        this.resource.set(string.lower(entity.name), this.resource.get(string.lower(entity.name))! + 1);

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

    static decode(decoded: unknown): Assembler {
        const data = decoded as { name: string, category: string, position: { x: number, y: number, z: number }, size: { x: number, y: number }, direction: { x: number, y: number }, resource: Map<string, number>, craftedComponent: number, currentCraft: string, lastProgress: number, inputTiles: Array<{ x: number, y: number, z: number }>, outputTiles: Array<{ x: number, y: number, z: number }> };
        const crafter = new Assembler(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), 1);
        if (data.currentCraft) crafter.setCraft(entitiesList.get(data.currentCraft) as Component);
        crafter.resource = decodeMap(data.resource) as Map<string, number>;
        crafter.craftedComponent = data.craftedComponent;
        crafter.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        crafter.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        crafter.lastProgress = data.lastProgress;
        return crafter;
    }

    getNewShape(): BasePart | undefined {
        return;
    }

    public setCraft(craft: Component) {
        assert(craft.type === EntityType.MODULE, "The entity is not a module");

        this.currentCraft = craft;
        this.speed = craft.speed
        this.craftedComponent = 0;
        this.initResources();
    }

    private isRessourceNeeded(ressource: Entity): boolean {
        if (!this.currentCraft) return false;
        for (const [_resource] of this.currentCraft.buildRessources) {
            if (string.lower(ressource.name) === string.lower(_resource)) return true;
        }
        return false;
    }

    private canCraft(): boolean {
        if (!this.currentCraft) return false;
        for (const [resource, quantity] of this.currentCraft.buildRessources) {
            if (this.resource.get(string.lower(resource))! < quantity) return false;
        }
        return true;
    }

    private craft(): Component | undefined {
        if (!this.currentCraft) return;
        if (this.craftedComponent >= MAX_CAPACITY) return;
        if (!this.canCraft()) return;

        for (const [resource, quantity] of this.currentCraft.buildRessources) {
            this.resource.set(string.lower(resource), this.resource.get(string.lower(resource))! - quantity);
        }
        this.craftedComponent++;
        return table.clone(this.currentCraft);
    }
}

export default Assembler;