import { decodeVector2, decodeVector3, EncodedVector3, encodeVector3 } from "ReplicatedStorage/Scripts/Utils/encoding";
import Tile, { EncodedTile } from "../../tile";
import { TileEntity } from "../tileEntity";
import { getDistanceBetweenTiles } from "ReplicatedStorage/Scripts/TileGrid/tileGridUtils";
import { EnergyComponent } from "ReplicatedStorage/Scripts/Energy/energyComponent";

export interface EncodedElectricPole extends EncodedTile {
    machinesConnected: Array<EncodedVector3>;
    machineConnectionRange: number;

    poleConnected: Array<EncodedVector3>;
    poleConnectionRange: number;
}

export class ElectricPole extends Tile {
    readonly machineConnectionRange: number;
    readonly poleConnectionRange: number;

    private machinesConnected = new Map<Vector3, EnergyComponent>();
    private polesConnected = new Array<ElectricPole>();

    constructor(name: string, position: Vector3, size: Vector2, direction: Vector2, gridBase: BasePart, machineConnectionRange: number, poleConnectionRange: number) {
        super(name, position, size, direction, gridBase);
        this.machineConnectionRange = machineConnectionRange;
        this.poleConnectionRange = poleConnectionRange;
    }

    addConnection(tile: ElectricPole | TileEntity) {
        if (tile instanceof ElectricPole) {
            this.addPoleConnection(tile);
        } else {
            this.addMachineConnection(tile);
        }
    }

    private addMachineConnection(tileEntity: TileEntity) {
        if (this.machinesConnected.has(tileEntity.position))
            error("TileEntity already connected");

        if (getDistanceBetweenTiles(this, tileEntity) > this.machineConnectionRange)
            error("TileEntity too far away");

        if (!tileEntity.hasEnergyComponent())
            error("TileEntity has no energy component");

        this.machinesConnected.set(tileEntity.position, tileEntity.getEnergyComponent());
    }

    private addPoleConnection(pole: ElectricPole) {
        if (this.polesConnected.includes(pole))
            error("Pole already connected");

        if (getDistanceBetweenTiles(this, pole) > this.poleConnectionRange)
            error("Pole too far away");

        this.polesConnected.push(pole);
    }

    removeMachineConnection(tileEntity: TileEntity) {
        if (!this.machinesConnected.has(tileEntity.position))
            error("TileEntity not connected");

        this.machinesConnected.delete(tileEntity.position);
    }

    removePoleConnection(pole: ElectricPole) {
        if (!this.polesConnected.includes(pole))
            error("Pole not connected");

        this.polesConnected = this.polesConnected.filter(p => p !== pole);
    }

    getConnections() {
        return this.machinesConnected;
    }

    encode(): EncodedElectricPole {
        const encodedMachinesConnected = new Array<EncodedVector3>();
        this.machinesConnected.forEach((_, position) => {
            encodedMachinesConnected.push(encodeVector3(position));
        });

        const encodedPolesConnected = new Array<EncodedVector3>();
        this.polesConnected.forEach(pole => {
            encodedPolesConnected.push(encodeVector3(pole.position));
        });

        return {
            ...super.encode(),
            machinesConnected: encodedMachinesConnected, 
            machineConnectionRange: this.machineConnectionRange,

            poleConnected: encodedPolesConnected, 
            poleConnectionRange: this.poleConnectionRange
        }
    }

    static decode(decoded: unknown, gridBase: BasePart): ElectricPole {
        const data = decoded as EncodedElectricPole;
        const clone = new ElectricPole(data.name, decodeVector3(data.position), decodeVector2(data.size), decodeVector2(data.direction), gridBase, data.machineConnectionRange, data.poleConnectionRange);
        clone.polesConnected = data.poleConnected as unknown as Array<ElectricPole>;
        clone.machinesConnected = data.machinesConnected as unknown as Map<Vector3, EnergyComponent>;

        return clone;
    }
}