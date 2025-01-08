import { Component, Entity, EntityType } from "ReplicatedStorage/Scripts/Entities/entity";
import { EncodedTileEntity, TileEntity } from "../tileEntity";
import { decodeMap, decodeVector2, decodeVector3, decodeVector3Array } from "ReplicatedStorage/Scripts/Utils/encoding";
import { entitiesList } from "ReplicatedStorage/Scripts/Entities/EntitiesList";
import { Efficiency, EncodedEfficiency } from "../Utils/efficiency";
import { EnergyComponent } from "ReplicatedStorage/Scripts/Energy/energyComponent";

// Settings
const MAX_INPUTS = 2;
const MAX_OUTPUTS = 1;
const MAX_CAPACITY = 20;
const category: string = "assembler";
const EFFICIENCY_HISTORY_SIZE = 10;

export interface EncodedAssembler extends EncodedTileEntity {
    isCrafting: boolean,
    resource: Map<string, number>,
    craftedComponent: number,
    currentCraft: string | undefined,
    lastProgress: number,
    efficiency: EncodedEfficiency
}

class Assembler extends TileEntity {
    currentCraft: Component | undefined;
    resource = new Map<string, number>();
    craftedComponent = 0;
    isCrafting = false;
    lastCraftingProgress = 0;

    private craftingCoroutine: thread | undefined;
    private efficiency = new Efficiency(EFFICIENCY_HISTORY_SIZE)
    private isActive = true

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, gridBase: BasePart, speed: number) {
        super(name, position, size, direction, gridBase, speed, category, MAX_INPUTS, MAX_OUTPUTS);
        this.energyComponent = new AssemblerEnergyComponent(this);
    }

    addEntity(entity: Entity): Entity | undefined {
        if (!this.resource || !this.resource.has(string.lower(entity.name))) return entity;

        if (this.resource.get(string.lower(entity.name))! >= MAX_CAPACITY) return entity;
        if (!this.isRessourceNeeded(entity)) return entity;

        this.resource.set(string.lower(entity.name), this.resource.get(string.lower(entity.name))! + 1);
        return;
    }

    tick(progress: number): void {
        if (!this.isActive)
            return;

        if (this.getCraftingProgress(progress) < this.lastCraftingProgress)
            this.craft();

        if (this.getProgress(progress) < this.lastProgress) {
            if (!this.currentCraft) return;
            this.efficiency.addSuccess(this.sendItemCrafted());
        };

        this.lastProgress = this.getProgress(progress);
        this.lastCraftingProgress = this.getCraftingProgress(progress);
    }

    private sendItemCrafted(): boolean {
        if (this.outputTiles.isEmpty()) return false;

        if (this.craftedComponent === 0) return false;
        this.craftedComponent--;

        const addedEntity = this.outputTiles[0].addEntity(table.clone(this.currentCraft!))
        if (addedEntity) {
            this.craftedComponent++;
            return false
        }
        return true
    }

    private isRessourceNeeded(ressource: Entity): boolean {
        if (!this.currentCraft) return false;
        for (const [_resource] of this.currentCraft.buildRessources) {
            if (string.lower(ressource.name) === string.lower(_resource)) return true;
        }
        return false;
    }

    private canCraft(): boolean {
        if (this.craftingCoroutine && coroutine.status(this.craftingCoroutine) === "running") return false; // because we use this.isCrafting to send the status
        if (!this.currentCraft) return false;
        if (!this.currentCraft) return false;
        for (const [resource, quantity] of this.currentCraft.buildRessources) {
            if (this.resource.get(string.lower(resource))! < quantity) return false;
        }
        return true;
    }

    private craft() {
        if (!this.currentCraft) return;
        if (this.craftedComponent >= MAX_CAPACITY) return;
        if (!this.canCraft()) return;

        for (const [resource, quantity] of this.currentCraft.buildRessources) {
            this.resource.set(string.lower(resource), this.resource.get(string.lower(resource))! - quantity);
        }
        this.isCrafting = true;
        this.craftingCoroutine = coroutine.create(() => {
            wait(60 / this.currentCraft!.speed - 0.05);
            this.craftedComponent += this.currentCraft!.amount;
            this.isCrafting = false;
        });
        coroutine.resume(this.craftingCoroutine);
    }

    getCraftingProgress(progress: number): number {
        if (!this.currentCraft) return 0;
        return (progress * (this.currentCraft.speed / 60)) % 1;
    }

    getEfficiency(): number {
        return this.efficiency.getEfficiency();
    }

    getNewMesh(): BasePart | undefined {
        return;
    }

    setCraft(craft: Component) {
        assert(craft.type === EntityType.MODULE, "The entity is not a module");

        this.currentCraft = craft;
        this.craftedComponent = 0;
        this.initResources();
    }

    private initResources() {
        if (!this.currentCraft) return

        for (const [comp, quantity] of this.currentCraft.buildRessources) {
            this.resource.set(string.lower(comp), 0);
        }
    }

    turnOff() {
        this.isActive = false;
    }

    turnOn() {
        this.isActive = true;
    }

    encode(): EncodedAssembler {
        return {
            ...super.encode(),
            isCrafting: this.isCrafting,
            currentCraft: this.currentCraft?.name,
            resource: this.resource,
            craftedComponent: this.craftedComponent,
            lastProgress: this.lastProgress,
            efficiency: this.efficiency.encode(),
        }
    }

    static decode(decoded: unknown, gridBase: unknown): Assembler {
        const data = decoded as EncodedAssembler;
        const crafter = new Assembler(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), gridBase as BasePart, data.speed);
        if (data.currentCraft) crafter.setCraft(entitiesList.get(data.currentCraft) as Component);
        crafter.resource = decodeMap(data.resource) as Map<string, number>;
        crafter.isCrafting = data.isCrafting;
        crafter.craftedComponent = data.craftedComponent;
        crafter.inputTiles = decodeVector3Array(data.inputTiles) as TileEntity[]
        crafter.outputTiles = decodeVector3Array(data.outputTiles) as TileEntity[];
        crafter.lastProgress = data.lastProgress;
        crafter.efficiency = data.efficiency ? Efficiency.decode(data.efficiency) : new Efficiency(EFFICIENCY_HISTORY_SIZE);
        return crafter;
    }
}

class AssemblerEnergyComponent implements EnergyComponent {
    private assembler: Assembler;
    readonly energyUsage: number;

    constructor(assembler: Assembler, energyUsage: number = 5) {
        this.assembler = assembler;
        this.energyUsage = energyUsage;
    }

    isProcessing(): boolean {
        return this.assembler.isCrafting;
    }

    turnOff(): void {
        this.assembler.turnOff();
    }

    turnOn(): void {
        this.assembler.turnOn();
    }

}

export default Assembler;